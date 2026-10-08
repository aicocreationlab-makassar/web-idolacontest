import { admin } from "@/lib/supabase/server";
import { registrationQuery, type Filters } from "@/lib/admin-data";
import { failure } from "@/lib/http";
import { firstOf } from "@/lib/embed";
import { formatParticipantAge } from "@/lib/participant";
function cell(v: unknown) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r\n]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}
export async function GET(req: Request) {
  try {
    const { db } = await admin(["admin", "super_admin"]);
    const params = new URL(req.url).searchParams;
    const filters = Object.fromEntries(params) as Filters;
    const kind = params.get("kind") || "peserta";
    if (
      !["peserta", "hasil", "klaim-hadiah", "pengiriman", "payments"].includes(
        kind,
      )
    )
      throw new Error("Data ekspor tidak valid.");
    const lines: string[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await registrationQuery(db, filters).range(
        offset,
        offset + 499,
      );
      if (error) throw new Error("Data ekspor gagal dimuat.");
      for (const r of data) {
        const base = {
          kode: r.registration_code,
          nama: r.participants.full_name,
          usia: formatParticipantAge(
            r.participants.age,
            r.participants.age_unit,
          ),
          lomba: r.competition_type,
          kategori: r.category,
        };
        const row =
          kind === "peserta"
            ? {
                ...base,
                orang_tua: r.participants.parent_name,
                whatsapp: r.participants.whatsapp,
                alamat: r.participants.address_line,
                desa: r.participants.village_name,
                kecamatan: r.participants.district_name,
                kota: r.participants.regency_name,
                provinsi: r.participants.province_name,
                kode_pos: r.participants.postal_code,
                pembayaran: r.payment_status,
                sumber: r.registration_source,
              }
            : kind === "hasil"
              ? {
                  ...base,
                  penghargaan: firstOf(r.results)?.award_code,
                  skor: firstOf(r.results)?.final_score,
                  published: firstOf(r.results)?.is_published,
                }
              : kind === "klaim-hadiah"
                ? {
                    ...base,
                    invoice: firstOf(r.claim_invoices)?.invoice_number,
                    status: firstOf(r.claim_invoices)?.status,
                    jumlah: firstOf(r.claim_invoices)?.amount,
                  }
                : kind === "pengiriman"
                  ? {
                      ...base,
                      kurir: firstOf(r.shipments)?.courier,
                      resi: firstOf(r.shipments)?.tracking_number,
                      status: firstOf(r.shipments)?.shipping_status,
                    }
                  : {
                      ...base,
                      pembayaran_registrasi: r.payment_status,
                      claim: firstOf(r.claim_invoices)?.status,
                    };
        if (!lines.length) lines.push(Object.keys(row).map(cell).join(","));
        lines.push(Object.values(row).map(cell).join(","));
      }
      if (data.length < 500) break;
    }
    return new Response("\uFEFF" + lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="idola-${kind}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
