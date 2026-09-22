import { readJson } from "@/lib/request-body";
import { z } from "zod";
import { codeSchema } from "@/lib/validation";
import { service } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
import { signed } from "@/lib/media";
export async function POST(req: Request) {
  try {
    await rateLimit(req, "worksheet", 10);
    const { code } = z.object({ code: codeSchema }).parse(await readJson(req));
    const db = service();
    const { data: r } = await db
      .from("registrations")
      .select("id")
      .eq("registration_code", code)
      .eq("payment_status", "paid")
      .eq("registration_status", "verified")
      .eq("competition_type", "coloring")
      .maybeSingle();
    if (!r)
      throw new Error(
        "Kode tidak ditemukan atau pembayaran belum terverifikasi.",
      );
    const { data: w } = await db
      .from("worksheets")
      .select("private_file_path,version")
      .eq("registration_id", r.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!w) throw new Error("File worksheet belum tersedia.");
    return json({
      url: await signed("worksheets-private", w.private_file_path),
      download_url: await signed(
        "worksheets-private",
        w.private_file_path,
        86400,
        true,
      ),
      version: w.version,
    });
  } catch (e) {
    return failure(e);
  }
}
