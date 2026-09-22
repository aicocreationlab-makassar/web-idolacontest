import { readForm } from "@/lib/request-body";
import { registrationSchema } from "@/lib/validation";
import {
  generateLegacyRegistrationCode,
  generateRegistrationCode,
} from "@/lib/business-rules";
import { admin, service } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data";
import { failure, json, rateLimit } from "@/lib/http";
import { imageBytes, upload, remove } from "@/lib/media";
import { validateRegions } from "@/lib/locations";
export async function POST(req: Request) {
  let path: string | undefined;
  try {
    await rateLimit(req, "registration", 6);
    if (Number(req.headers.get("content-length")) > 3 * 1024 * 1024)
      throw new Error("File maksimum 2 MB.");
    const f = await readForm(req);
    const parsed = registrationSchema.safeParse(
      JSON.parse(String(f.get("data"))),
    );
    if (!parsed.success)
      return json(
        {
          error: parsed.error.issues
            .map((v) => `${v.path.join(".")}: ${v.message}`)
            .join("; "),
        },
        400,
      );
    const p = parsed.data;
    let actor = null;
    if (p.registration_source !== "website")
      actor = (await admin(["admin", "super_admin"])).user.id;
    await validateRegions(p);
    const season = await getActiveSeason();
    if (!season) throw new Error("Pendaftaran belum dibuka.");
    const bytes = await imageBytes(f.get("photo"));
    path = await upload("participant-private", bytes);
    let code = "";
    let registrationError: { code?: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      code = generateRegistrationCode(p.full_name);
      const { error } = await service().rpc("create_registration", {
        p,
        p_code: code,
        p_path: path,
        p_size: bytes.length,
        p_actor: actor,
      });
      registrationError = error;
      if (!error) break;
      if (error.code !== "23505") break;
    }
    if (
      registrationError?.code === "23514" &&
      "message" in registrationError &&
      String(registrationError.message).includes("registration_code_shape")
    ) {
      code = generateLegacyRegistrationCode(season.slug);
      const { error } = await service().rpc("create_registration", {
        p,
        p_code: code,
        p_path: path,
        p_size: bytes.length,
        p_actor: actor,
      });
      registrationError = error;
    }
    if (registrationError)
      throw new Error(
        "Pendaftaran gagal. Periksa periode, kuota, dan data Anda.",
      );
    return json({ code, public_name: p.public_name }, 201);
  } catch (e) {
    if (path) await remove("participant-private", path);
    return failure(e);
  }
}
