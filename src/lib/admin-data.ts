import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export type Filters = {
  q?: string;
  season?: string;
  competition?: string;
  category?: string;
  payment?: string;
  province?: string;
  source?: string;
  page?: string;
};
export function registrationQuery(db: SupabaseClient, filters: Filters) {
  let q = db
    .from("registrations")
    .select(
      "*,participants!inner(*),payments(*),results(*),claim_invoices(*),shipments(*)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (filters.season) q = q.eq("season_id", filters.season);
  if (filters.competition) q = q.eq("competition_type", filters.competition);
  if (filters.category) q = q.eq("category", filters.category);
  if (filters.payment) q = q.eq("payment_status", filters.payment);
  if (filters.province)
    q = q.ilike(
      "participants.province_name",
      `%${filters.province.replace(/[%_]/g, "").slice(0, 100)}%`,
    );
  if (filters.source) q = q.eq("registration_source", filters.source);
  if (filters.q) {
    const text = filters.q.replace(/[%_,().]/g, "").slice(0, 100);
    q = text.startsWith("IDC-")
      ? q.eq("registration_code", text)
      : q.ilike("participants.full_name", `%${text}%`);
  }
  return q;
}
