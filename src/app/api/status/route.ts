import { readJson } from "@/lib/request-body";
import { z } from "zod";
import { codeSchema } from "@/lib/validation";
import { service } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
import { calculateSubmissionDeadline } from "@/lib/business-rules";
export async function POST(req: Request) {
  try {
    await rateLimit(req, "status");
    const { code } = z.object({ code: codeSchema }).parse(await readJson(req));
    const db = service();
    const { data: r, error } = await db
      .from("registrations")
      .select(
        "id,participant_id,competition_type,category,payment_status,registration_status,created_at,season_id",
      )
      .eq("registration_code", code)
      .maybeSingle();
    if (error || !r) throw new Error("Kode registrasi tidak ditemukan.");
    const [p, e, s, w, c, h] = await Promise.all([
      db
        .from("participants")
        .select("public_name")
        .eq("id", r.participant_id)
        .single(),
      db
        .from("seasons")
        .select("submission_global_close_at")
        .eq("id", r.season_id)
        .single(),
      db
        .from("submissions")
        .select("status,publication_status,slug")
        .eq("registration_id", r.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db.from("worksheets").select("id").eq("registration_id", r.id).limit(1),
      db
        .from("claim_invoices")
        .select("invoice_number,amount,status")
        .eq("registration_id", r.id)
        .maybeSingle(),
      db
        .from("shipments")
        .select("courier,tracking_number,shipping_status")
        .eq("registration_id", r.id)
        .maybeSingle(),
    ]);
    if ([p, e, s, w, c, h].some((x) => x.error))
      throw new Error("Layanan status belum tersedia.");
    return json({
      public_name: p.data?.public_name,
      competition_type: r.competition_type,
      category: r.category,
      payment_status: r.payment_status,
      registration_status: r.registration_status,
      submission: s.data,
      worksheet_ready: !!w.data?.length,
      deadline: calculateSubmissionDeadline(
        r.created_at,
        e.data!.submission_global_close_at,
      ).toISOString(),
      claim: c.data,
      shipment: h.data,
    });
  } catch (e) {
    return failure(e);
  }
}
