import "server-only";
import { configured, service } from "./supabase/server";
export async function getActiveSeason() {
  if (!configured()) return null;
  const { data, error } = await service()
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("Tidak dapat memuat season.");
  return data;
}
export async function gallery() {
  if (!configured()) return [];
  const { data, error } = await service()
    .from("public_gallery")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) throw new Error("Galeri belum dapat dimuat.");
  return data ?? [];
}
export async function recentRegistrations() {
  if (!configured()) return [];
  const { data, error } = await service()
    .from("public_recent_registrations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error("Aktivitas registrasi belum dapat dimuat.");
  return data ?? [];
}
export function publicImage(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery-public/${path}`;
}
export type GalleryFilters = {
  q?: string;
  competition?: string;
  category?: string;
  province?: string;
  season?: string;
  highlight?: string;
  page?: string;
};
export async function galleryPage(filters: GalleryFilters) {
  const page = Math.max(1, Math.min(100000, Number(filters.page) || 1));
  if (!configured()) return { items: [], count: 0, page, seasons: [] };
  const db = service();
  let query = db
    .from("public_gallery")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("slug");
  if (filters.q)
    query = query.ilike(
      "public_name",
      `%${filters.q.replace(/[%_]/g, "").slice(0, 120)}%`,
    );
  if (filters.competition)
    query = query.eq("competition_type", filters.competition);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.province)
    query = query.ilike(
      "province_name",
      `%${filters.province.replace(/[%_]/g, "").slice(0, 120)}%`,
    );
  if (filters.season) query = query.eq("season_id", filters.season);
  if (filters.highlight && /^[a-f0-9]{24}$/.test(filters.highlight))
    query = query.eq("slug", filters.highlight);
  const [rows, seasons] = await Promise.all([
    query.range((page - 1) * 12, page * 12 - 1),
    db
      .from("seasons")
      .select("id,name")
      .order("created_at", { ascending: false }),
  ]);
  if (rows.error || seasons.error)
    throw new Error("Galeri belum dapat dimuat.");
  return {
    items: rows.data ?? [],
    count: rows.count ?? 0,
    page,
    seasons: seasons.data ?? [],
  };
}
