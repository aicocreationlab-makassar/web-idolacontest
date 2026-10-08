import Link from "next/link";
import { Trophy, Medal, Star } from "lucide-react";
import { getActiveSeason, resultsPage, type PublicResult } from "@/lib/data";
import { PageHeading, Fees } from "@/components/shared";
import { categories, competitions } from "@/lib/business-rules";
import { formatDate } from "@/lib/season";
export const dynamic = "force-dynamic";
export const metadata = { title: "Hasil & penghargaan" };

type Row = PublicResult & {
  competition_type: keyof typeof competitions;
  category: keyof typeof categories;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requested } = await searchParams;
  const [{ items, seasons, selectedSeasonId }, activeSeason] = await Promise.all([
    resultsPage(requested),
    getActiveSeason(),
  ]);
  const rows = items as Row[];
  const selected = seasons.find((item) => item.id === selectedSeasonId);
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = `${row.competition_type}|${row.category}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const specials = rows.filter((row) =>
    ["Juara Umum", "Best Social Media"].includes(row.award_code),
  );
  return (
    <div className="wrap section">
      <PageHeading
        eyebrow={selected ? `Pemenang ${selected.name}` : "Penghargaan Idola Contest"}
        title="Rayakan bintang kecil kita."
        description={
          selected
            ? "Pemenang yang telah diumumkan resmi. Juara ditentukan dari penilaian juri dan peringkat otomatis per jenis lomba dan kategori usia."
            : activeSeason
              ? `Pengumuman ${activeSeason.name}: ${formatDate(activeSeason.announcement_at)}. Hasil muncul setelah dipublikasikan oleh admin.`
              : "Hasil muncul setelah dipublikasikan oleh admin."
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
              href={`/hasil?season=${item.id}`}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
      {specials.length > 0 && (
        <div className="grid2 mb-8">
          {specials.map((r) => (
            <div className="card stack result-special" key={`${r.award_code}-${r.public_name}`}>
              <Star className="art-icon-modern" aria-hidden="true" />
              <span className="eyebrow">{r.award_code}</span>
              <h3>{r.public_name}</h3>
              <p>
                {competitions[r.competition_type]} · {categories[r.category]}
              </p>
              <p className="muted">
                {r.regency_name}, {r.province_name}
              </p>
            </div>
          ))}
        </div>
      )}
      {groups.size ? (
        <div className="stack">
          {[...groups.entries()].map(([key, group]) => {
            const [competition, category] = key.split("|") as [
              keyof typeof competitions,
              keyof typeof categories,
            ];
            const ranked = group
              .filter((r) => !["Juara Umum", "Best Social Media"].includes(r.award_code))
              .sort(
                (a, b) =>
                  (a.rank_position ?? 99) - (b.rank_position ?? 99) ||
                  Number(b.final_score) - Number(a.final_score),
              );
            if (!ranked.length) return null;
            return (
              <section className="result-group" key={key}>
                <div className="result-group-head">
                  <Trophy aria-hidden="true" />
                  <div>
                    <span className="eyebrow">{competitions[competition]}</span>
                    <h2>Kategori {categories[category]}</h2>
                  </div>
                </div>
                <div className="grid3">
                  {ranked.map((r) => (
                    <div
                      className={`card stack result-card rank-${r.rank_position ?? "x"}`}
                      key={`${r.award_code}-${r.public_name}`}
                    >
                      <span className="result-rank" aria-hidden="true">
                        {r.rank_position ? `#${r.rank_position}` : <Medal />}
                      </span>
                      <span className="eyebrow">{r.award_code}</span>
                      <h3>{r.public_name}</h3>
                      <p className="muted">
                        {r.regency_name}, {r.province_name}
                      </p>
                      <p>Skor akhir: {Number(r.final_score)}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <p className="notice mb-8">
          Belum ada pemenang yang dipublikasikan. Pantau @idola.contest untuk
          pengumuman resmi.
        </p>
      )}
      <div className="max-w-2xl mt-8 stack">
        <Fees />
        <p>
          Invoice klaim terbit otomatis saat juara diumumkan. Periksa
          penghargaan, invoice, status pembayaran, dan resi menggunakan kode
          registrasi.
        </p>
        <Link className="btn" href="/cek-status">
          Lihat klaim & pengiriman →
        </Link>
      </div>
    </div>
  );
}
