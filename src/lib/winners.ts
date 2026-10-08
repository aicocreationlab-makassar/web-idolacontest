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

/** Winners of one season (or every season), newest season first, ranked within groups. */
export async function publicWinners(seasonId?: string | null) {
  if (!configured()) return [] as PublicWinner[];
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

/**
 * Gives every winner its own public copy of the artwork under winners/.
 * The copy survives gallery unpublishing and registration deletion.
 */
export async function ensureWinnerImages(registrationIds: string[]) {
  if (!registrationIds.length) return;
  const db = service();
  const { data: rows } = await db
    .from("winners")
    .select("id,image_path,source_image_path,registration_id")
    .in("registration_id", registrationIds);
  for (const row of rows ?? []) {
    if (row.image_path) continue;
    let source = row.source_image_path as string | null;
    if (!source && row.registration_id) {
      const { data: submission } = await db
        .from("submissions")
        .select("private_file_path")
        .eq("registration_id", row.registration_id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      source = submission?.private_file_path ?? null;
    }
    if (!source) continue;
    const { data: blob, error } = await db.storage
      .from("submission-private")
      .download(source);
    if (error || !blob) continue;
    const bytes = await sharp(Buffer.from(await blob.arrayBuffer()))
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `winners/${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await db.storage
      .from("gallery-public")
      .upload(path, bytes, { contentType: "image/webp", upsert: false });
    if (uploadError) continue;
    await db
      .from("winners")
      .update({ image_path: path, source_image_path: source })
      .eq("id", row.id);
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
