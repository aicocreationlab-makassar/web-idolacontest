import { configured, service } from "@/lib/supabase/server";
import { PageHeading, Fees } from "@/components/shared";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { categories, competitions } from "@/lib/business-rules";
export const dynamic = "force-dynamic";
export const metadata = { title: "Hasil & penghargaan" };
export default async function Page() {
  const result = configured()
    ? await service()
        .from("public_results")
        .select("*")
        .order("final_score", { ascending: false })
    : { data: [], error: null };
  if (result.error) throw new Error("Hasil belum dapat dimuat.");
  return (
    <div className="wrap section">
      <PageHeading
        eyebrow="Setiap usaha punya cerita"
        title="Rayakan bintang kecil kita."
        description="Pengumuman Season 1: 8 Oktober 2026. Hasil muncul setelah dipublikasikan oleh admin."
      />
      {result.data?.length ? (
        <div className="grid3">
          {result.data.map((r, i) => (
            <div className="card stack" key={i}>
              <Trophy className="art-icon-modern" aria-hidden="true" />
              <span className="eyebrow">{r.award_code}</span>
              <h3>{r.public_name}</h3>
              <p>
                {competitions[r.competition_type as keyof typeof competitions]}{" "}
                · {categories[r.category as keyof typeof categories]}
              </p>
              <p className="muted">
                {r.regency_name}, {r.province_name}
              </p>
              {r.award_code !== "Best Social Media" && (
                <p>Skor akhir: {r.final_score}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="notice mb-8">
          Hasil belum dipublikasikan. Pantau @idola.contest untuk pengumuman
          resmi.
        </p>
      )}
      <div className="max-w-2xl mt-8 stack">
        <Fees />
        <p>
          Invoice klaim diterbitkan admin setelah pengumuman. Periksa invoice,
          status pembayaran, dan resi menggunakan kode registrasi.
        </p>
        <Link className="btn" href="/cek-status">
          Lihat klaim & pengiriman →
        </Link>
      </div>
    </div>
  );
}
