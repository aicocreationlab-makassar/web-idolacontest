import { readForm } from "@/lib/request-body";
import { z } from "zod";
import { admin } from "@/lib/supabase/server";
import { failure, json, sameOrigin } from "@/lib/http";
import { imageBytes, upload, remove } from "@/lib/media";
export async function POST(req: Request) {
  let path: string | undefined;
  try {
    sameOrigin(req);
    const { db } = await admin(["admin", "super_admin"]);
    const f = await readForm(req);
    const id = z.uuid().parse(f.get("id"));
    path = await upload("worksheets-private", await imageBytes(f.get("photo")));
    const { error } = await db.rpc("admin_mutate", {
      p_action: "worksheet",
      p_id: id,
      p_data: { path },
    });
    if (error)
      throw new Error(
        "Data worksheet gagal disimpan. Peserta harus mewarnai dan sudah membayar.",
      );
    return json({ ok: true });
  } catch (e) {
    if (path) await remove("worksheets-private", path);
    return failure(e);
  }
}
