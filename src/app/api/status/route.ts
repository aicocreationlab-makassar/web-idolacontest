import { readJson } from "@/lib/request-body";
import { z } from "zod";
import { codeSchema } from "@/lib/validation";
import { service } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
import { calculateSubmissionDeadline } from "@/lib/business-rules";
import { winnerImageUrl } from "@/lib/winners";
import { resolveContent } from "@/lib/contest-modes";

/**
 * Participant status by registration code. Returns only what the family needs
 * to follow their journey: no address, WhatsApp, parent name or admin notes.
 * Announced winners are served from the permanent winners table, so the code
 * keeps working even after the registration itself has been deleted.
 */
export async function POST(req: Request) {
  try {
    await rateLimit(req, "status");
    const { code } = z.object({ code: codeSchema }).parse(await readJson(req));
    const db = service();
    const winnerLookup = await db
      .from("winners")
      .select("*")
      .eq("registration_code", code)
      .maybeSingle();
    const winner = winnerLookup.error ? null : winnerLookup.data;
    const { data: r, error } = await db
      .from("registrations")
      .select("*")
      .eq("registration_code", code)
      .maybeSingle();
    if ((error || !r) && !winner) throw new Error("Kode registrasi tidak ditemukan.");

    const winnerPayload = winner
      ? {
          award_code: winner.award_code,
          final_score: winner.final_score,
          rank_position: winner.rank_position ?? null,
          published_at: winner.published_at,
          image_url: winnerImageUrl(winner.image_path),
        }
      : null;

    if (!r) {
      // Registration removed after the announcement: show the permanent winner record.
      const { data: season } = await db
        .from("seasons")
        .select("*")
        .eq("id", winner!.season_id)
        .maybeSingle();
      return json({
        public_name: winner!.public_name,
        competition_type: winner!.competition_type,
        category: winner!.category,
        payment_status: "paid",
        registration_status: "verified",
        review_status: "approved",
        registered_at: winner!.created_at,
        archived: true,
        season: season
          ? {
              name: season.name,
              slug: season.slug,
              theme_key: season.theme_key || "sky",
              theme_title: season.theme_title || "Cita Citaku",
              submission_global_close_at: season.submission_global_close_at,
              announcement_at: season.announcement_at,
              shipping_at: season.shipping_at,
              content: resolveContent(season),
            }
          : null,
        submission: null,
        worksheet_ready: false,
        deadline: winner!.published_at,
        result: winnerPayload,
        claim: null,
        shipment: null,
      });
    }

    const [p, e, s, w, c, h, x] = await Promise.all([
      db.from("participants").select("*").eq("id", r.participant_id).single(),
      db.from("seasons").select("*").eq("id", r.season_id).single(),
      db
        .from("submissions")
        .select("status,publication_status,slug,submitted_at,reviewed_at")
        .eq("registration_id", r.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db.from("worksheets").select("id").eq("registration_id", r.id).limit(1),
      db
        .from("claim_invoices")
        .select("invoice_number,amount,status,paid_at,created_at,confirmed_at")
        .eq("registration_id", r.id)
        .maybeSingle(),
      db
        .from("shipments")
        .select("courier,tracking_number,shipping_status,shipped_at,delivered_at")
        .eq("registration_id", r.id)
        .maybeSingle(),
      db.from("results").select("*").eq("registration_id", r.id).maybeSingle(),
    ]);
    if ([p, e, s, w, c, h, x].some((item) => item.error))
      throw new Error("Layanan status belum tersedia.");
    const result =
      winnerPayload ??
      (x.data?.is_published
        ? {
            award_code: x.data.award_code,
            final_score: x.data.final_score,
            rank_position: x.data.rank_position ?? null,
            published_at: x.data.published_at,
            image_url: null,
          }
        : null);
    return json({
      public_name: p.data?.public_name,
      age: p.data?.age,
      age_unit: p.data?.age_unit || "years",
      competition_type: r.competition_type,
      category: r.category,
      payment_status: r.payment_status,
      registration_status: r.registration_status,
      review_status: r.review_status || "pending",
      registered_at: r.created_at,
      archived: false,
      season: e.data
        ? {
            name: e.data.name,
            slug: e.data.slug,
            theme_key: e.data.theme_key || "sky",
            theme_title: e.data.theme_title || "Cita Citaku",
            submission_global_close_at: e.data.submission_global_close_at,
            announcement_at: e.data.announcement_at,
            shipping_at: e.data.shipping_at,
            content: resolveContent(e.data),
          }
        : null,
      submission: s.data,
      worksheet_ready: !!w.data?.length,
      deadline: calculateSubmissionDeadline(
        r.created_at,
        e.data!.submission_global_close_at,
      ).toISOString(),
      result,
      claim: result ? c.data : null,
      shipment: result ? h.data : null,
    });
  } catch (e) {
    return failure(e);
  }
}
