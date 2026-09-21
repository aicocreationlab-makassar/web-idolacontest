import { readForm } from "@/lib/request-body";
import { codeSchema } from "@/lib/validation";
import { service } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
import { imageBytes, upload, remove } from "@/lib/media";
export async function POST(req: Request) {
  let path: string | undefined;
  try {
    await rateLimit(req, "submission", 8);
    if (Number(req.headers.get("content-length")) > 3 * 1024 * 1024)
      throw new Error("File maksimum 2 MB.");
    const f = await readForm(req);
    const code = codeSchema.parse(f.get("code"));
    const bytes = await imageBytes(f.get("photo"));
    path = await upload("submission-private", bytes);
    const { error } = await service().rpc("create_submission", {
      p_code: code,
      p_path: path,
    });
    if (error)
      throw new Error(
        "Karya belum dapat dikirim. Periksa pembayaran, tenggat, dan status karya sebelumnya.",
      );
    return json(
      { message: "Karya tersimpan privat dan menunggu review admin." },
      201,
    );
  } catch (e) {
    if (path) await remove("submission-private", path);
    return failure(e);
  }
}
