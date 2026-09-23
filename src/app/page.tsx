import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CalendarDays } from "lucide-react";
import {
  getActiveSeason,
  gallery,
  publicImage,
  recentRegistrations,
} from "@/lib/data";
import { RecentTicker } from "@/components/recent-ticker";
import { Countdown } from "@/components/countdown";
import { Faq, Fees } from "@/components/shared";
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
  return (
    <>
      <RecentTicker items={recent} />
      <section className="hero kids-hero">
        <div className="hero-white-shape" aria-hidden="true" />
        <CloudDecoration className="hero-cloud-one" />
        <StarDecoration className="hero-star-one" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="pill season-pill">
              <span aria-hidden>★</span> IDOLA CONTEST —{" "}
              {season?.name.toUpperCase() || "SEASON 1"}
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
              Lomba online anak Indonesia untuk menunjukkan senyum, keberanian,
              dan karya terbaik melalui lomba fotogenik serta mewarnai.
            </p>
            <div className="actions">
              <Link className="btn" href="/daftar">
                Daftar Sekarang <ArrowRight size={19} />
              </Link>
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
            {season ? (
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
                  21 September – 6 Oktober 2026
                  <small>Registrasi Rp20.000 · Tema Cita Citaku</small>
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
            <FloatingSticker className="hero-sticker">
              <span className="sticker-star">★</span>
              <span>
                Mimpi kecil,<strong>potensi besar!</strong>
              </span>
            </FloatingSticker>
            <span className="theme-sticker">
              TEMA SEASON 1<strong>Cita Citaku</strong>
            </span>
            <div className="artboard-ground" />
          </div>
        </div>
      </section>
      <FeatureStrip />
      <CompetitionCards />
      <PersonalizedWorksheetSection />
      <PrizeSection />
      <CompetitionTimeline />
      <RegistrationSteps />
      <HomeFinalists
        works={works
          .slice(0, 3)
          .map((w) => ({ ...w, image: publicImage(w.public_file_path) }))}
      />
      <section className="section wrap info-section">
        <div className="grid2">
          <div className="info-card">
            <span className="eyebrow">ADIL & TRANSPARAN</span>
            <h3>Kreativitas layak diapresiasi.</h3>
            <p>
              Lima kriteria berbobot 30%, 25%, 20%, 15%, dan 10%, dinilai oleh
              juri manusia. Best Social Media terpisah dari skor utama.
            </p>
            <Link href="/lomba/fotogenik">
              Lihat kriteria penilaian <ArrowRight size={17} />
            </Link>
          </div>
          <Fees />
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
          <Faq />
        </div>
      </section>
      <FinalCallToAction />
    </>
  );
}
