import Link from "next/link";
import { Trophy } from "lucide-react";
import { categories, competitions } from "@/lib/business-rules";
import { resultsPage } from "@/lib/data";
import { Fees, PageHeading } from "@/components/shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hasil & penghargaan" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season } = await searchParams;
  const { items, seasons, selectedSeasonId } = await resultsPage(season);
  const selected = seasons.find((item) => item.id === selectedSeasonId);

  return (
    <div className="wrap section">
      <PageHeading
        eyebrow={selected ? selected.name : "Penghargaan Idola Contest"}
        title="Rayakan bintang kecil kita."
        description={
          selected
            ? "Pemenang yang telah diumumkan secara resmi oleh Idola Contest."
            : "Hasil akan muncul setelah diumumkan secara resmi oleh admin."
        }
      />

      {seasons.length > 1 && (
        <nav
          className="gallery-competition-tabs result-season-tabs"
          aria-label="Pilih season pemenang"
        >
          {seasons.map((item) => (
            <Link
              className={item.id === selectedSeasonId ? "active" : ""}
              href={"/hasil?season=" + item.id}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      {items.length ? (
        <div className="grid3">
          {items.map((result, index) => (
            <article className="card stack" key={result.public_name + index}>
              <Trophy className="art-icon-modern" aria-hidden="true" />
              <span className="eyebrow">{result.award_code}</span>
              <h3>{result.public_name}</h3>
              <p>
                {
                  competitions[
                    result.competition_type as keyof typeof competitions
                  ]
                }{" "}
                · {categories[result.category as keyof typeof categories]}
              </p>
              <p className="muted">
                {result.regency_name}, {result.province_name}
              </p>
              {result.award_code !== "Best Social Media" && (
                <p>Skor akhir: {result.final_score}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="notice mb-8">
          Belum ada pemenang yang dipublikasikan untuk season ini.
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
