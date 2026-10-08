import "server-only";
import { cache } from "react";
import { configured, service } from "./supabase/server";
import { formatDate, formatShortDate, type Season } from "./season";

export type PublicSeason = Season;

/** Long WIB date, e.g. "6 Oktober 2026". Kept for callers that predate lib/season. */
export function formatWibDate(value: string, style: "short" | "long" = "long") {
  if (style === "long") return formatDate(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatWibDayMonth(value: string) {
  return formatShortDate(value);
}

/** Active season, cached per request. Returns null when Supabase is not configured or unreachable. */
export const getActiveSeason = cache(async (): Promise<Season | null> => {
  if (!configured()) return null;
  try {
    const { data, error } = await service()
      .from("seasons")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return null;
    const season = data as Season;
    return {
      ...season,
      theme_key: season.theme_key || "sky",
      theme_title: season.theme_title || "Cita Citaku",
    };
  } catch {
    return null;
  }
});

/** Published works of the active season only; earlier seasons live on through their winners. */
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
  const recent = () =>
    service()
      .from("public_recent_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
  // The view gained season_id in migration 202610070001; older databases ignore the scope.
  const scoped = await recent().eq("season_id", season.id);
  if (!scoped.error) return scoped.data ?? [];
  const { data, error } = await recent();
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
  if (rows.error) throw new Error("Galeri belum dapat dimuat.");
  return {
    items: rows.data ?? [],
    count: rows.count ?? 0,
    page,
    season,
  };
}

export type PublicResult = {
  award_code: string;
  final_score: number;
  rank_position?: number | null;
  published_at?: string | null;
  public_name: string;
  regency_name: string;
  province_name: string;
  competition_type: string;
  category: string;
  season_id: string;
};

/** Published results, optionally scoped to one season. */
export async function publishedResults(seasonId?: string | null) {
  if (!configured()) return [] as PublicResult[];
  const build = (ranked: boolean) => {
    let query = service()
      .from("public_results")
      .select("*")
      .order("competition_type")
      .order("category");
    if (ranked)
      query = query.order("rank_position", { ascending: true, nullsFirst: false });
    query = query.order("final_score", { ascending: false });
    return seasonId ? query.eq("season_id", seasonId) : query;
  };
  let { data, error } = await build(true);
  // Older databases (before the rankings migration) have no rank_position column.
  if (error) ({ data, error } = await build(false));
  if (error) throw new Error("Hasil belum dapat dimuat.");
  return (data ?? []) as PublicResult[];
}

/**
 * Results page data: every season that has published winners becomes a tab;
 * the requested season (or the newest one) is selected.
 */
export async function resultsPage(requestedSeason?: string) {
  const empty = {
    items: [] as PublicResult[],
    seasons: [] as Pick<Season, "id" | "name" | "slug">[],
    selectedSeasonId: null as string | null,
  };
  if (!configured()) return empty;
  const items = await publishedResults(null);
  const seasonIds = [...new Set(items.map((item) => item.season_id))];
  if (!seasonIds.length) return empty;
  const { data: seasonRows, error } = await service()
    .from("seasons")
    .select("id,name,slug,created_at")
    .in("id", seasonIds)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Daftar season belum dapat dimuat.");
  const seasons = (seasonRows ?? []) as Pick<Season, "id" | "name" | "slug">[];
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
