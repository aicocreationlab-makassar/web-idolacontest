import { admin } from "@/lib/supabase/server";
import { registrationQuery, type Filters } from "@/lib/admin-data";
import { failure } from "@/lib/http";
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
                  penghargaan: r.results[0]?.award_code,
                  skor: r.results[0]?.final_score,
                  published: r.results[0]?.is_published,
                }
              : kind === "klaim-hadiah"
                ? {
                    ...base,
                    invoice: r.claim_invoices[0]?.invoice_number,
                    status: r.claim_invoices[0]?.status,
                    jumlah: r.claim_invoices[0]?.amount,
                  }
                : kind === "pengiriman"
                  ? {
                      ...base,
                      kurir: r.shipments[0]?.courier,
                      resi: r.shipments[0]?.tracking_number,
                      status: r.shipments[0]?.shipping_status,
                    }
                  : {
                      ...base,
                      pembayaran_registrasi: r.payment_status,
                      claim: r.claim_invoices[0]?.status,
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
