import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CalendarDays } from "lucide-react";
import {
  getActiveSeason,
  gallery,
  publicImage,
  recentRegistrations,
} from "@/lib/data";
import { formatDate, seasonPhase, themeFor } from "@/lib/season";
import { resolveContent, rupiah } from "@/lib/contest-modes";
import { RecentTicker } from "@/components/recent-ticker";
import { Countdown } from "@/components/countdown";
import { Faq, Fees } from "@/components/shared";
import { NationalHome } from "@/components/national-home";
import {
  FeatureStrip,
  CompetitionCards,
  PersonalizedWorksheetSection,
  PrizeSection,
  CompetitionTimeline,
  RegistrationSteps,
  HomeFinalists,
  FinalCallToAction,
  SectionHeading,
} from "@/components/home-sections";
import {
  ToyArt,
  StarDecoration,
  CloudDecoration,
  FloatingSticker,
  SparkleDecoration,
} from "@/components/decorations";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [season, works, recent] = await Promise.all([
    getActiveSeason(),
    gallery(),
    recentRegistrations(),
  ]);
  const content = resolveContent(season);
  const finalists = works
    .slice(0, 3)
    .map((w) => ({ ...w, image: publicImage(w.public_file_path) }));
  if (content.mode === "national")
    return (
      <NationalHome
        season={season}
        content={content}
        works={finalists}
        recent={recent}
      />
    );
  const theme = themeFor(season?.theme_key);
  const themeTitle = season?.theme_title || "Cita Citaku";
  const phase = seasonPhase(season);
  return (
    <>
      <RecentTicker items={recent} fee={content.registration_fee} />
      <section className="hero kids-hero">
        <div className="hero-white-shape" aria-hidden="true" />
        <CloudDecoration className="hero-cloud-one" />
        <StarDecoration className="hero-star-one" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="pill season-pill">
              <span aria-hidden>★</span> IDOLA CONTEST —{" "}
              {season?.name.toUpperCase() || "SEASON BARU"}
            </span>
            <h1>
              Saatnya Si Kecil
              <br />
              <span className="hero-pink">Menjadi</span>
              <br />
              <span className="hero-yellow">Idola!</span>
              <SparkleDecoration className="headline-sparkle" />
            </h1>
            <p>
              {season?.tagline ||
                "Lomba online anak Indonesia untuk menunjukkan senyum, keberanian, dan karya terbaik melalui lomba fotogenik serta mewarnai."}
            </p>
            <div className="actions">
              {phase === "registration" || phase === "idle" ? (
                <Link className="btn" href="/daftar">
                  Daftar Sekarang <ArrowRight size={19} />
                </Link>
              ) : phase === "announcement" || phase === "shipping" ? (
                <Link className="btn" href="/hasil">
                  Lihat Juara <ArrowRight size={19} />
                </Link>
              ) : (
                <Link className="btn" href="/cek-status">
                  Cek Status <ArrowRight size={19} />
                </Link>
              )}
              <Link className="btn secondary" href="/galeri">
                Lihat Finalis <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-reassurance">
              <CheckCircle2 size={17} />
              <span>Ikut dari rumah</span>
              <span className="dot" />
              <span>Seluruh Indonesia</span>
            </div>
            {season && phase === "registration" ? (
              <div className="hero-countdown">
                <p>Pendaftaran ditutup dalam</p>
                <Countdown close={season.registration_close_at} />
                {season.quota && (
                  <span className="pill quota-pill">
                    KUOTA TERBATAS · {season.quota} pendaftaran
                  </span>
                )}
              </div>
            ) : (
              <div className="season-dates">
                <CalendarDays size={20} />
                <span>
                  {season
                    ? phase === "upcoming"
                      ? `Pendaftaran dibuka ${formatDate(season.registration_open_at)}`
                      : phase === "submission"
                        ? `Pengumpulan karya sampai ${formatDate(season.submission_global_close_at)}`
                        : phase === "judging"
                          ? `Pengumuman juara ${formatDate(season.announcement_at)}`
                          : `Pendaftaran ${formatDate(season.registration_open_at)} – ${formatDate(season.registration_close_at)}`
                    : "Season baru segera dibuka"}
                  <small>
                    Registrasi {rupiah(content.registration_fee)} · Tema {themeTitle}
                  </small>
                </span>
              </div>
            )}
          </div>
          <div className="hero-artboard">
            <div className="artboard-sky" />
            <div className="artboard-rainbow" />
            <CloudDecoration className="artboard-cloud" />
            <Image
              className="hero-logo"
              src="/logo.webp"
              width={560}
              height={560}
              sizes="(max-width:760px) 80vw, 43vw"
              alt="Logo asli Idola Contest — kamera, warna, dan bintang"
              priority
            />
            <ToyArt kind="camera" className="hero-camera" />
            <ToyArt kind="pencil" className="hero-pencils" />
            <StarDecoration className="hero-star-two" />
            <StarDecoration className="hero-star-three" />
            <div className="season-motifs" aria-hidden="true">
              {theme.motifs.map((motif, i) => (
                <span className="season-motif" key={`${motif}-${i}`}>
                  {motif}
                </span>
              ))}
            </div>
            <FloatingSticker className="hero-sticker">
              <span className="sticker-star">★</span>
              <span>
                {theme.sticker.split(",")[0]}
                {theme.sticker.includes(",") ? "," : ""}
                <strong>
                  {theme.sticker.includes(",")
                    ? theme.sticker.split(",").slice(1).join(",").trim()
                    : season?.name || "Season baru"}
                </strong>
              </span>
            </FloatingSticker>
            <span className="theme-sticker">
              TEMA {season?.name.toUpperCase() || "SEASON"}
              <strong>{themeTitle}</strong>
            </span>
            <div className="artboard-ground" />
          </div>
        </div>
      </section>
      <FeatureStrip />
      <CompetitionCards themeTitle={themeTitle} fee={content.registration_fee} />
      <PersonalizedWorksheetSection themeTitle={themeTitle} />
      <PrizeSection claimFee={content.claim_fee} />
      <CompetitionTimeline season={season} />
      <RegistrationSteps fee={content.registration_fee} />
      <HomeFinalists seasonName={season?.name || "season ini"} works={finalists} />
      <section className="section wrap info-section">
        <div className="grid2">
          <div className="info-card">
            <span className="eyebrow">ADIL & TRANSPARAN</span>
            <h3>Kreativitas layak diapresiasi.</h3>
            <p>
              Lima kriteria berbobot 30%, 25%, 20%, 15%, dan 10%, dinilai oleh
              juri manusia dan diranking otomatis per kategori usia. Best Social
              Media terpisah dari skor utama.
            </p>
            <Link href="/lomba/fotogenik">
              Lihat kriteria penilaian <ArrowRight size={17} />
            </Link>
          </div>
          <Fees content={content} />
        </div>
      </section>
      <section className="section wrap faq-section">
        <SectionHeading
          eyebrow="Kami bantu jawab"
          title={
            <>
              Masih <span className="text-pink">penasaran?</span>
            </>
          }
          description="Semua yang perlu Ayah dan Bunda ketahui sebelum mendaftar."
        />
        <div className="faq-panel">
          <Faq season={season} content={content} />
        </div>
      </section>
      <FinalCallToAction />
    </>
  );
}
