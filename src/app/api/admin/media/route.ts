import { readJson } from "@/lib/request-body";
import { z } from "zod";
import { admin, service } from "@/lib/supabase/server";
import { failure, json, sameOrigin } from "@/lib/http";
import { signed } from "@/lib/media";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const { profile } = await admin();
    const { id, kind } = z
      .object({
        id: z.uuid(),
        kind: z.enum(["participant", "submission", "worksheet"]),
      })
      .parse(await readJson(req));
    if (profile.role === "judge" && kind !== "submission")
      throw new Error("Akses ditolak.");
    const table = {
      participant: "participant_media",
      submission: "submissions",
      worksheet: "worksheets",
    }[kind];
    const { data, error } = await service()
      .from(table)
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) throw new Error("File tidak ditemukan.");
    if (profile.role === "judge" && data.status !== "approved")
      throw new Error("Akses ditolak.");
    return json({
      url: await signed(
        {
          participant: "participant-private",
          submission: "submission-private",
          worksheet: "worksheets-private",
        }[kind],
        data.storage_path || data.private_file_path,
      ),
    });
  } catch (e) {
    return failure(e);
  }
}
