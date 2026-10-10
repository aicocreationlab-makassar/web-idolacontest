import "server-only";
import sharp from "sharp";
import { configured, service } from "./supabase/server";

export type PublicWinner = {
  id: string;
  season_id: string;
  season_name: string;
  theme_title: string | null;
  award_code: string;
  rank_position: number | null;
  final_score: number | null;
  competition_type: string;
  category: string;
  public_name: string;
  regency_name: string | null;
  province_name: string | null;
  image_path: string | null;
  published_at: string;
};

export function winnerImageUrl(path: string | null | undefined) {
  return path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery-public/${path}`
    : null;
}

/**
 * Winners of one season (or every season), newest season first, ranked within
 * groups. Winners that still lack their artwork copy get one on the fly
 * (bounded per request) so the public page heals itself.
 */
export async function publicWinners(seasonId?: string | null) {
  if (!configured()) return [] as PublicWinner[];
  await backfillWinnerImages(12);
  let query = service()
    .from("public_winners")
    .select("*")
    .order("published_at", { ascending: false })
    .order("competition_type")
    .order("category")
    .order("rank_position", { ascending: true, nullsFirst: false });
  if (seasonId) query = query.eq("season_id", seasonId);
  const { data, error } = await query;
  if (error) return null; // table missing: caller falls back to results view
  return (data ?? []) as PublicWinner[];
}

type WinnerImageRow = {
  id: string;
  image_path: string | null;
  source_image_path: string | null;
  registration_id: string | null;
};

/**
 * Creates the winner's own public copy of the artwork under winners/. Prefers a
 * storage-side copy of the already published gallery object, otherwise
 * processes the private submission. Returns the new path or null.
 */
async function createWinnerImage(row: WinnerImageRow) {
  const db = service();
  let publicPath: string | null = null;
  let privatePath = row.source_image_path;
  if (row.registration_id) {
    const { data: submission } = await db
      .from("submissions")
      .select("private_file_path,public_file_path")
      .eq("registration_id", row.registration_id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    publicPath = submission?.public_file_path ?? null;
    privatePath = privatePath || submission?.private_file_path || null;
  }
  const path = `winners/${crypto.randomUUID()}.webp`;
  if (publicPath) {
    const { error } = await db.storage.from("gallery-public").copy(publicPath, path);
    if (!error) return { path, source: privatePath };
  }
  if (!privatePath) return null;
  const { data: blob, error } = await db.storage
    .from("submission-private")
    .download(privatePath);
  if (error || !blob) return null;
  const bytes = await sharp(Buffer.from(await blob.arrayBuffer()))
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const { error: uploadError } = await db.storage
    .from("gallery-public")
    .upload(path, bytes, { contentType: "image/webp", upsert: false });
  if (uploadError) return null;
  return { path, source: privatePath };
}

async function fillRows(rows: WinnerImageRow[]) {
  const db = service();
  for (const row of rows) {
    if (row.image_path) continue;
    try {
      const created = await createWinnerImage(row);
      if (!created) continue;
      await db
        .from("winners")
        .update({ image_path: created.path, source_image_path: created.source })
        .eq("id", row.id);
    } catch {
      // Leave the winner without an image; the next request retries.
    }
  }
}

/** Gives every winner of the given registrations its artwork copy. */
export async function ensureWinnerImages(registrationIds: string[]) {
  if (!registrationIds.length) return;
  const { data } = await service()
    .from("winners")
    .select("id,image_path,source_image_path,registration_id")
    .in("registration_id", registrationIds);
  await fillRows((data ?? []) as WinnerImageRow[]);
}

/** Fills missing artwork copies for winners announced before the copy step existed. */
export async function backfillWinnerImages(limit = 12) {
  try {
    const { data, error } = await service()
      .from("winners")
      .select("id,image_path,source_image_path,registration_id")
      .is("image_path", null)
      .order("published_at", { ascending: true })
      .limit(limit);
    if (error || !data?.length) return 0;
    await fillRows(data as WinnerImageRow[]);
    return data.length;
  } catch {
    return 0;
  }
}

/** Public winner copies for registrations about to be hidden; delete after the RPC succeeds. */
export async function winnerImagePaths(registrationIds: string[]) {
  if (!registrationIds.length) return [] as string[];
  const { data } = await service()
    .from("winners")
    .select("image_path")
    .in("registration_id", registrationIds);
  return (data ?? [])
    .map((row) => row.image_path as string | null)
    .filter((path): path is string => Boolean(path));
}

export async function removePublicObjects(paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) {
    await service()
      .storage.from("gallery-public")
      .remove(paths.slice(i, i + 100));
  }
}
