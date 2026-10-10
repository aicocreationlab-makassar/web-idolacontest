import Link from "next/link";
import Image from "next/image";
import { Trophy, Medal, Star } from "lucide-react";
import { getActiveSeason, resultsPage, type PublicResult } from "@/lib/data";
import { publicWinners, winnerImageUrl, type PublicWinner } from "@/lib/winners";
import { PageHeading, Fees } from "@/components/shared";
import { categoryLabel, competitions } from "@/lib/business-rules";
import { resolveContent } from "@/lib/contest-modes";
import { formatDate } from "@/lib/season";
import { configured, service } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Pemenang & karya juara" };

type Row = {
  key: string;
  award_code: string;
  final_score: number | null;
  rank_position: number | null;
  public_name: string;
  regency_name: string | null;
  province_name: string | null;
  competition_type: keyof typeof competitions;
  category: string;
  season_id: string;
  image: string | null;
};

type SeasonTab = {
  id: string;
  name: string;
  contest_mode?: string | null;
  registration_fee?: number | null;
  claim_fee?: number | null;
  content?: Record<string, unknown> | null;
};

const specialAwards = ["Juara Umum", "Best Social Media"];

async function loadRows(requested?: string) {
  const winners = await publicWinners(null);
  if (winners) {
    const rows: Row[] = winners.map((w: PublicWinner) => ({
      key: w.id,
      award_code: w.award_code,
      final_score: w.final_score,
      rank_position: w.rank_position,
      public_name: w.public_name,
      regency_name: w.regency_name,
      province_name: w.province_name,
      competition_type: w.competition_type as keyof typeof competitions,
      category: w.category,
      season_id: w.season_id,
      image: winnerImageUrl(w.image_path),
    }));
    const seasonIds = [...new Set(rows.map((row) => row.season_id))];
    const seasons = seasonIds.length && configured()
      ? ((
          await service()
            .from("seasons")
            .select("id,name,slug,created_at,contest_mode,registration_fee,claim_fee,content")
            .in("id", seasonIds)
            .order("created_at", { ascending: false })
        ).data ?? [])
      : [];
    const selectedSeasonId = seasons.some((s) => s.id === requested)
      ? requested!
      : seasons[0]?.id || null;
    return {
      rows: rows.filter((row) => row.season_id === selectedSeasonId),
      seasons: seasons as SeasonTab[],
      selectedSeasonId,
    };
  }
  // Database without the winners table: fall back to published results.
  const { items, seasons, selectedSeasonId } = await resultsPage(requested);
  return {
    rows: items.map((r: PublicResult, i) => ({
      key: `${r.award_code}-${r.public_name}-${i}`,
      award_code: r.award_code,
      final_score: r.final_score,
      rank_position: r.rank_position ?? null,
      public_name: r.public_name,
      regency_name: r.regency_name,
      province_name: r.province_name,
      competition_type: r.competition_type as keyof typeof competitions,
      category: r.category,
      season_id: r.season_id,
      image: null,
    })),
    seasons: seasons as SeasonTab[],
    selectedSeasonId,
  };
}

function WinnerCard({ row, special = false }: { row: Row; special?: boolean }) {
  return (
    <article
      className={`card stack winner-card${special ? " result-special" : ` result-card rank-${row.rank_position ?? "x"}`}`}
    >
      {row.image ? (
        <div className="winner-image">
          <Image
            src={row.image}
            alt={`Karya juara ${row.public_name}`}
            width={640}
            height={640}
            unoptimized
          />
          <span className="winner-award-badge">
            <Trophy size={14} aria-hidden="true" /> {row.award_code}
          </span>
        </div>
      ) : (
        <div className="winner-image placeholder" aria-hidden="true">
          {special ? <Star /> : <Medal />}
        </div>
      )}
      {!special && (
        <span className="result-rank" aria-hidden="true">
          {row.rank_position ? `#${row.rank_position}` : <Medal />}
        </span>
      )}
      <span className="eyebrow">{row.award_code}</span>
      <h3>{row.public_name}</h3>
      <p className="muted">
        {row.regency_name}
        {row.regency_name && row.province_name ? ", " : ""}
        {row.province_name}
      </p>
      {special ? (
        <p>
          {competitions[row.competition_type]} · {categoryLabel(row.category)}
        </p>
      ) : (
        row.final_score !== null && <p>Skor akhir: {Number(row.final_score)}</p>
      )}
    </article>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requested } = await searchParams;
  const [{ rows, seasons, selectedSeasonId }, activeSeason] = await Promise.all([
    loadRows(requested),
    getActiveSeason(),
  ]);
  const selected = seasons.find((item) => item.id === selectedSeasonId);
  // In the national mode "Juara Umum" is the rank-2 award of each category, not a special award.
  const isSpecial = (row: Row) =>
    specialAwards.includes(row.award_code) && selected?.contest_mode !== "national";
  // Fees and claim wording follow the season whose winners are on screen.
  const content = resolveContent(selected ?? activeSeason);
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    if (isSpecial(row)) continue;
    const key = `${row.competition_type}|${row.category}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const specials = rows.filter(isSpecial);
  return (
    <div className="wrap section">
      <PageHeading
        eyebrow={selected ? `Pemenang ${selected.name}` : "Penghargaan Idola Contest"}
        title="Rayakan bintang kecil kita."
        description={
          selected
            ? "Pemenang yang telah diumumkan resmi beserta karya juaranya. Juara ditentukan dari penilaian juri dan peringkat otomatis per jenis lomba dan kategori usia."
            : activeSeason
              ? `Pengumuman ${activeSeason.name}: ${formatDate(activeSeason.announcement_at)}. Pemenang dan karyanya tampil di sini setelah diumumkan admin.`
              : "Pemenang dan karyanya tampil di sini setelah diumumkan admin."
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
          {specials.map((row) => (
            <WinnerCard row={row} special key={row.key} />
          ))}
        </div>
      )}
      {groups.size ? (
        <div className="stack">
          {[...groups.entries()].map(([key, group]) => {
            const [competition, category] = key.split("|") as [
              keyof typeof competitions,
              string,
            ];
            const ranked = [...group].sort(
              (a, b) =>
                (a.rank_position ?? 99) - (b.rank_position ?? 99) ||
                Number(b.final_score ?? 0) - Number(a.final_score ?? 0),
            );
            return (
              <section className="result-group" key={key}>
                <div className="result-group-head">
                  <Trophy aria-hidden="true" />
                  <div>
                    <span className="eyebrow">{competitions[competition]}</span>
                    <h2>Kategori {categoryLabel(category)}</h2>
                  </div>
                </div>
                <div className="grid3">
                  {ranked.map((row) => (
                    <WinnerCard row={row} key={row.key} />
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
        <Fees content={content} />
        <p>
          {content.claim_fee === 0
            ? "Semua hadiah gratis tanpa penebusan. Juara mengonfirmasi alamat dan rekening hadiah, lalu memantau resi pengiriman menggunakan kode registrasi."
            : "Invoice klaim terbit otomatis saat juara diumumkan. Periksa penghargaan, invoice, status pembayaran, dan resi menggunakan kode registrasi."}
        </p>
        <Link className="btn" href="/cek-status">
          {content.claim_fee === 0 ? "Konfirmasi hadiah & pengiriman →" : "Lihat klaim & pengiriman →"}
        </Link>
      </div>
    </div>
  );
}
