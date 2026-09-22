import { z } from "zod";
import { admin, service } from "@/lib/supabase/server";
import { failure, json, sameOrigin } from "@/lib/http";
import { readJson } from "@/lib/request-body";
const schema = z.object({
  id: z.uuid(),
  confirmation: z.literal("HAPUS FOTO SEASON"),
});
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = schema.parse(await readJson(req));
    const { db } = await admin(["super_admin"]);
    const { data, error } = await db
      .from("registrations")
      .select(
        "participant_media(storage_path),submissions(private_file_path,public_file_path),worksheets(private_file_path)",
      )
      .eq("season_id", input.id);
    if (error) throw new Error("Media season tidak dapat dibaca.");
    const groups: [string, string[]][] = [
      [
        "participant-private",
        data.flatMap((r) =>
          r.participant_media.map(
            (x: { storage_path: string }) => x.storage_path,
          ),
        ),
      ],
      [
        "submission-private",
        data.flatMap((r) =>
          r.submissions.map(
            (x: { private_file_path: string }) => x.private_file_path,
          ),
        ),
      ],
      [
        "gallery-public",
        data.flatMap((r) =>
          r.submissions.flatMap((x: { public_file_path: string | null }) =>
            x.public_file_path ? [x.public_file_path] : [],
          ),
        ),
      ],
      [
        "worksheets-private",
        data.flatMap((r) =>
          r.worksheets.map(
            (x: { private_file_path: string }) => x.private_file_path,
          ),
        ),
      ],
    ];
    for (const [bucket, paths] of groups) {
      for (let i = 0; i < paths.length; i += 100) {
        const { error: removeError } = await service()
          .storage.from(bucket)
          .remove(paths.slice(i, i + 100));
        if (removeError)
          throw new Error(`Media ${bucket} belum terhapus seluruhnya.`);
      }
    }
    const { error: purgeError } = await db.rpc("admin_purge_season_media", {
      p_season: input.id,
    });
    if (purgeError)
      throw new Error("Referensi media season belum dapat dihapus.");
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
