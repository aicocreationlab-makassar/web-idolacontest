import { z } from "zod";
import { admin, service } from "@/lib/supabase/server";
import { failure, json, sameOrigin } from "@/lib/http";
import { readJson } from "@/lib/request-body";
const schema = z.object({ id: z.uuid(), confirmation: z.literal("HAPUS") });
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = schema.parse(await readJson(req));
    const { db } = await admin(["admin", "super_admin"]);
    const { data, error } = await db
      .from("registrations")
      .select(
        "participant_media(storage_path),submissions(private_file_path,public_file_path),worksheets(private_file_path)",
      )
      .eq("id", input.id)
      .single();
    if (error || !data) throw new Error("Registrasi tidak ditemukan.");
    const groups: [string, string[]][] = [
      [
        "participant-private",
        data.participant_media.map(
          (x: { storage_path: string }) => x.storage_path,
        ),
      ],
      [
        "submission-private",
        data.submissions.map(
          (x: { private_file_path: string }) => x.private_file_path,
        ),
      ],
      [
        "gallery-public",
        data.submissions.flatMap((x: { public_file_path: string | null }) =>
          x.public_file_path ? [x.public_file_path] : [],
        ),
      ],
      [
        "worksheets-private",
        data.worksheets.map(
          (x: { private_file_path: string }) => x.private_file_path,
        ),
      ],
    ];
    for (const [bucket, paths] of groups) {
      if (!paths.length) continue;
      const { error: removeError } = await service()
        .storage.from(bucket)
        .remove(paths);
      if (removeError)
        throw new Error(`File pada ${bucket} belum dapat dihapus.`);
    }
    const { error: deleteError } = await db.rpc("admin_delete_registration", {
      p_id: input.id,
    });
    if (deleteError) throw new Error("Data database belum dapat dihapus.");
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
