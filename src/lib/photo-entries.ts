import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { service } from "./supabase/server";
import { remove, upload } from "./media";
import { asList } from "./embed";

/**
 * Photogenic participants do not upload artwork: the photo sent with the
 * registration is their entry. Once a photogenic registration is verified the
 * photo is copied to submission-private (where judging, publishing and winner
 * snapshots read entries) and becomes an approved submission.
 */

type Media = { storage_path: string; created_at: string };
type EntryRow = {
  id: string;
  competition_type: string;
  registration_status: string;
  participant_media: Media[] | Media | null;
  submissions: Array<{ status: string }> | { status: string } | null;
};

const columns =
  "id,competition_type,registration_status,participant_media(storage_path,created_at),submissions(status)";

function needsEntry(row: EntryRow) {
  return (
    row.competition_type === "photogenic" &&
    row.registration_status === "verified" &&
    !asList(row.submissions).some(
      (s) => s.status === "pending_review" || s.status === "approved",
    )
  );
}

async function createEntry(db: SupabaseClient, row: EntryRow) {
  const media = asList(row.participant_media).sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )[0];
  if (!media) return false;
  const { data: blob, error } = await service()
    .storage.from("participant-private")
    .download(media.storage_path);
  if (error || !blob) throw new Error("Foto pendaftaran tidak tersedia.");
  const path = await upload(
    "submission-private",
    Buffer.from(await blob.arrayBuffer()),
  );
  const { data, error: rpcError } = await db.rpc("admin_create_photo_entry", {
    p_registration: row.id,
    p_path: path,
  });
  if (rpcError || data !== true) await remove("submission-private", path);
  if (rpcError) throw new Error(rpcError.message);
  return data === true;
}

/** Creates the entry for one registration when it needs one. */
export async function ensurePhotoEntry(
  db: SupabaseClient,
  registrationId: string,
) {
  const { data, error } = await db
    .from("registrations")
    .select(columns)
    .eq("id", registrationId)
    .maybeSingle();
  if (error || !data || !needsEntry(data as EntryRow)) return false;
  return createEntry(db, data as EntryRow);
}

/**
 * Heals photogenic participants verified before entries were automatic (or
 * whose copy failed), bounded per request. Returns how many were created.
 */
export async function backfillPhotoEntries(
  db: SupabaseClient,
  seasonId: string | null,
  limit = 24,
) {
  let query = db
    .from("registrations")
    .select(columns)
    .eq("competition_type", "photogenic")
    .eq("registration_status", "verified")
    .order("created_at")
    .limit(1000);
  if (seasonId) query = query.eq("season_id", seasonId);
  const { data, error } = await query;
  if (error || !data) return 0;
  let created = 0;
  for (const row of (data as EntryRow[]).filter(needsEntry).slice(0, limit)) {
    try {
      if (await createEntry(db, row)) created += 1;
    } catch (e) {
      // Usually the migration is not applied yet: stop instead of copying
      // and removing every photo on each page load.
      console.error("photo entry backfill failed", row.id, e);
      break;
    }
  }
  return created;
}
