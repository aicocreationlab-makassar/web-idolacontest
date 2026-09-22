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
        86400,
      ),
    });
  } catch (e) {
    return failure(e);
  }
}

export async function GET(req: Request) {
  try {
    const { profile } = await admin();
    const url = new URL(req.url);
    const { id, kind } = z
      .object({
        id: z.uuid(),
        kind: z.enum(["participant", "submission", "worksheet"]),
      })
      .parse({
        id: url.searchParams.get("id"),
        kind: url.searchParams.get("kind"),
      });
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
    const bucket = {
      participant: "participant-private",
      submission: "submission-private",
      worksheet: "worksheets-private",
    }[kind];
    const { data: file, error: downloadError } = await service()
      .storage.from(bucket)
      .download(data.storage_path || data.private_file_path);
    if (downloadError || !file) throw new Error("File tidak ditemukan.");
    return new Response(file, {
      headers: {
        "Content-Type": file.type || "image/webp",
        "Content-Disposition": `attachment; filename="idola-${kind}-${id}.webp"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
