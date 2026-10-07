import "server-only";
import { configured, service } from "./supabase/server";

export type PublicSeason = {
  id: string;
  name: string;
  slug: string;
  registration_open_at: string;
  registration_close_at: string;
  submission_global_close_at: string;
  judging_at: string;
  announcement_at: string;
  shipping_at: string;
  quota: number | null;
  is_active: boolean;
  created_at?: string;
};

export function formatWibDate(value: string, style: "short" | "long" = "long") {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: style === "short" ? "short" : "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatWibDayMonth(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  })
    .format(new Date(value))
    .toUpperCase();
}

export async function getActiveSeason(): Promise<PublicSeason | null> {
  if (!configured()) return null;
  const { data, error } = await service()
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("Tidak dapat memuat season.");
  return data as PublicSeason | null;
}
export async function gallery() {
  const season = await getActiveSeason();
  if (!season) return [];
  const { data, error } = await service()
    .from("public_gallery")
    .select("*")
    .eq("season_id", season.id)
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) throw new Error("Galeri belum dapat dimuat.");
  return data ?? [];
}
export async function recentRegistrations() {
  const season = await getActiveSeason();
  if (!season) return [];
  const { data, error } = await service()
    .from("public_recent_registrations")
    .select("*")
    .eq("season_id", season.id)
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
  /** Retained so old shared gallery links remain harmless. */
  season?: string;
  highlight?: string;
  page?: string;
};
export async function galleryPage(filters: GalleryFilters) {
  const page = Math.max(1, Math.min(100000, Number(filters.page) || 1));
  const season = await getActiveSeason();
  if (!season) return { items: [], count: 0, page, season: null };
  const db = service();
  let query = db
    .from("public_gallery")
    .select("*", { count: "exact" })
    .eq("season_id", season.id)
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
  if (filters.highlight && /^[a-f0-9]{24}$/.test(filters.highlight))
    query = query.eq("slug", filters.highlight);
  const rows = await query.range((page - 1) * 12, page * 12 - 1);
  if (rows.error)
    throw new Error("Galeri belum dapat dimuat.");
  return {
    items: rows.data ?? [],
    count: rows.count ?? 0,
    page,
    season,
  };
}

type PublicResult = {
  award_code: string;
  final_score: number;
  public_name: string;
  regency_name: string;
  province_name: string;
  competition_type: string;
  category: string;
  season_id: string;
};

export async function resultsPage(requestedSeason?: string) {
  if (!configured())
    return {
      items: [] as PublicResult[],
      seasons: [] as Pick<PublicSeason, "id" | "name" | "slug">[],
      selectedSeasonId: null,
    };

  const db = service();
  const { data, error } = await db
    .from("public_results")
    .select("*")
    .order("final_score", { ascending: false });
  if (error) throw new Error("Hasil belum dapat dimuat.");

  const items = (data ?? []) as PublicResult[];
  const seasonIds = [...new Set(items.map((item) => item.season_id))];
  if (!seasonIds.length)
    return {
      items,
      seasons: [] as Pick<PublicSeason, "id" | "name" | "slug">[],
      selectedSeasonId: null,
    };

  const { data: seasonRows, error: seasonError } = await db
    .from("seasons")
    .select("id,name,slug,created_at")
    .in("id", seasonIds)
    .order("created_at", { ascending: false });
  if (seasonError) throw new Error("Daftar season belum dapat dimuat.");

  const seasons = (seasonRows ?? []) as Pick<
    PublicSeason,
    "id" | "name" | "slug"
  >[];
  const selectedSeasonId = seasons.some((season) => season.id === requestedSeason)
    ? requestedSeason!
    : seasons[0]?.id || null;
  return {
    items: selectedSeasonId
      ? items.filter((item) => item.season_id === selectedSeasonId)
      : [],
    seasons,
    selectedSeasonId,
  };
}
