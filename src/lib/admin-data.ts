import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export type Filters = {
  q?: string;
  season?: string;
  competition?: string;
  category?: string;
  payment?: string;
  review?: string;
  province?: string;
  source?: string;
  /** registration_status: registered (waiting for verification), verified, cancelled or all. */
  access?: string;
  page?: string;
};

/**
 * Season a page shows: an explicit id, every season ("all"), or by default the
 * active season. Pengiriman passes defaultAll so prize shipping of earlier
 * seasons stays in view.
 */
export function seasonScope(
  param: string | undefined,
  activeId: string | null,
  defaultAll = false,
) {
  if (param === "all") return null;
  if (param) return param;
  return defaultAll ? null : activeId;
}
export function registrationQuery(db: SupabaseClient, filters: Filters) {
  let q = db
    .from("registrations")
    .select(
      "*,participants!inner(*),payments(*),results(*),claim_invoices(*),shipments(*),submissions(status,publication_status,created_at),worksheets(id)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (filters.season && filters.season !== "all")
    q = q.eq("season_id", filters.season);
  if (filters.competition) q = q.eq("competition_type", filters.competition);
  if (filters.category) q = q.eq("category", filters.category);
  if (filters.payment) q = q.eq("payment_status", filters.payment);
  if (filters.review) q = q.eq("review_status", filters.review);
  if (filters.access && filters.access !== "all")
    q = q.eq("registration_status", filters.access);
  if (filters.province)
    q = q.ilike(
      "participants.province_name",
      `%${filters.province.replace(/[%_]/g, "").slice(0, 100)}%`,
    );
  // "?source=pwa" marks PWA launches (manifest shortcuts), not a registration source.
  if (filters.source && filters.source !== "pwa")
    q = q.eq("registration_source", filters.source);
  if (filters.q) {
    const text = filters.q.replace(/[%_,().]/g, "").slice(0, 100);
    q = text.startsWith("IDC-")
      ? q.eq("registration_code", text)
      : q.ilike("participants.full_name", `%${text}%`);
  }
  return q;
}
