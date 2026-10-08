import { z } from "zod";
import { admin } from "@/lib/supabase/server";
import { failure, json, sameOrigin, VisibleError } from "@/lib/http";
import { readJson } from "@/lib/request-body";
import { describeDatabaseError } from "@/lib/admin-errors";
import { removePublicObjects } from "@/lib/winners";

const schema = z.object({
  id: z.uuid(),
  confirmation: z.literal("HAPUS PEMENANG"),
});

/** Hard-deletes one winner record together with its public artwork copy. */
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = schema.parse(await readJson(req));
    const { db } = await admin(["admin", "super_admin"]);
    const { data, error } = await db.rpc("admin_delete_winner", { p_id: input.id });
    if (error) throw new VisibleError(describeDatabaseError(error));
    const imagePath = (data as { image_path?: string | null } | null)?.image_path;
    if (imagePath) await removePublicObjects([imagePath]);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
