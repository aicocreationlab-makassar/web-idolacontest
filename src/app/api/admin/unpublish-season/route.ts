import { z } from "zod";
import { admin } from "@/lib/supabase/server";
import { failure, json, sameOrigin, VisibleError } from "@/lib/http";
import { readJson } from "@/lib/request-body";
import { describeDatabaseError } from "@/lib/admin-errors";
import { removePublicObjects } from "@/lib/winners";

const schema = z.object({
  id: z.uuid(),
  confirmation: z.literal("TARIK PUBLIKASI"),
});

/**
 * Withdraws every published work of a season from the public gallery and
 * deletes the public objects from storage. Winner copies stay.
 */
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = schema.parse(await readJson(req));
    const { db } = await admin(["admin", "super_admin"]);
    const { data, error } = await db.rpc("admin_unpublish_season", {
      p_season: input.id,
    });
    if (error) throw new VisibleError(describeDatabaseError(error));
    const paths = ((data ?? []) as Array<string | { admin_unpublish_season?: string }>)
      .map((row) => (typeof row === "string" ? row : row.admin_unpublish_season))
      .filter((path): path is string => Boolean(path));
    await removePublicObjects(paths);
    return json({ ok: true, removed: paths.length });
  } catch (error) {
    return failure(error);
  }
}
