import { readJson } from "@/lib/request-body";
import { z } from "zod";
import sharp from "sharp";
import { admin, service } from "@/lib/supabase/server";
import { failure, json, sameOrigin, VisibleError } from "@/lib/http";
import { upload, remove } from "@/lib/media";
import { describeDatabaseError } from "@/lib/admin-errors";
import {
  ensureWinnerImages,
  removePublicObjects,
  winnerImagePaths,
} from "@/lib/winners";

const actions = [
  "payment",
  "review",
  "publish",
  "unpublish",
  "score",
  "award",
  "result_publish",
  "publish_group",
  "invoice",
  "claim_paid",
  "claim_status",
  "shipment",
  "registration_review",
] as const;

const schema = z.object({
  action: z.enum(actions),
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
          throw new Error(
            "Karya belum memenuhi syarat publikasi: pembayaran lunas, pendaftaran aktif, dan izin publikasi.",
          );
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

    // Winner snapshots: find the registrations affected by a (un)publish so the
    // artwork copy can be created afterwards or its object removed.
    const publishing =
      input.action === "result_publish" || input.action === "publish_group";
    let affected: string[] = [];
    let staleImages: string[] = [];
    if (publishing) {
      if (input.action === "result_publish") affected = [input.id];
      else {
        const { data: rows } = await service()
          .from("registrations")
          .select("id,results!inner(id)")
          .eq("season_id", input.id)
          .eq("competition_type", String(input.data.competition ?? ""))
          .eq("category", String(input.data.category ?? ""));
        affected = (rows ?? []).map((row) => row.id as string);
      }
      if (!input.data.published) staleImages = await winnerImagePaths(affected);
    }

    const { error } =
      input.action === "registration_review"
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
    if (error) throw new VisibleError(describeDatabaseError(error));

    if (publishing) {
      if (input.data.published) await ensureWinnerImages(affected);
      else if (staleImages.length) await removePublicObjects(staleImages);
    }
    return json({ ok: true });
  } catch (e) {
    if (copy) await remove("gallery-public", copy);
    return failure(e);
  }
}
