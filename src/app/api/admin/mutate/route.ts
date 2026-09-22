import { readJson } from "@/lib/request-body";
import { z } from "zod";
import sharp from "sharp";
import { admin, service } from "@/lib/supabase/server";
import { failure, json, sameOrigin } from "@/lib/http";
import { upload, remove } from "@/lib/media";
const schema = z.object({
  action: z.enum([
    "payment",
    "review",
    "publish",
    "unpublish",
    "score",
    "award",
    "result_publish",
    "invoice",
    "claim_paid",
    "shipment",
    "settings",
    "registration_review",
  ]),
  id: z.uuid(),
  data: z.record(z.string(), z.unknown()).default({}),
});
export async function POST(req: Request) {
  let copy: string | undefined;
  try {
    sameOrigin(req);
    const input = schema.parse(await readJson(req));
    const { db } = await admin(
      input.action === "score"
        ? ["admin", "super_admin", "judge"]
        : input.action === "settings"
          ? ["super_admin"]
          : ["admin", "super_admin"],
    );
    let oldPath: string | null = null;
    if (["publish", "unpublish"].includes(input.action)) {
      const { data: s, error } = await db
        .from("submissions")
        .select("private_file_path,public_file_path,status,registration_id")
        .eq("id", input.id)
        .single();
      if (error || !s) throw new Error("Karya tidak ditemukan.");
      oldPath = s.public_file_path;
      if (input.action === "publish") {
        if (s.status !== "approved" || oldPath)
          throw new Error("Karya belum disetujui atau sudah dipublikasikan.");
        const { data: r, error: registrationError } = await db
          .from("registrations")
          .select("payment_status,registration_status,consent_publication")
          .eq("id", s.registration_id)
          .single();
        if (
          registrationError ||
          !r ||
          r.payment_status !== "paid" ||
          r.registration_status !== "verified" ||
          !r.consent_publication
        )
          throw new Error("Karya belum memenuhi syarat publikasi.");
        const { data: blob, error: downloadError } = await service()
          .storage.from("submission-private")
          .download(s.private_file_path);
        if (downloadError || !blob) throw new Error("File tidak tersedia.");
        const bytes = await sharp(Buffer.from(await blob.arrayBuffer()))
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        copy = await upload("gallery-public", bytes);
        input.data = { path: copy };
      } else if (oldPath) {
        const { error: removeError } = await service()
          .storage.from("gallery-public")
          .remove([oldPath]);
        if (removeError)
          throw new Error(
            "File publik belum berhasil dihapus. Ulangi unpublish.",
          );
      }
    }
    const { error } = input.action === "registration_review"
      ? await db.rpc("admin_review_registration", {
          p_id: input.id,
          p_status: input.data.status,
          p_note: input.data.note ?? null,
        })
      : await db.rpc("admin_mutate", {
          p_action: input.action,
          p_id: input.id,
          p_data: input.data,
        });
    if (error)
      throw new Error(
        input.action === "registration_review"
          ? "Review pendaftaran belum dapat disimpan. Pastikan migration terbaru sudah diterapkan."
          : "Data belum dapat diubah. Periksa prasyarat, periode, dan status terkait.",
      );
    return json({ ok: true });
  } catch (e) {
    if (copy) await remove("gallery-public", copy);
    return failure(e);
  }
}
