import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Coins,
  Download,
  Gift,
  Globe2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import {
  daysUntil,
  formatDate,
  seasonPhase,
  themeFor,
  type Season,
} from "@/lib/season";
import {
  bankLine,
  categoryAgeText,
  contestTypeSlug,
  instagramUrl,
  rupiah,
  type ResolvedContent,
} from "@/lib/contest-modes";
import { RecentTicker } from "./recent-ticker";
import { ToyIcon } from "./toy-icon";
import { CashStack } from "./cash-stack";
import { AmbassadorSpotlight } from "./ambassadors";
import { Countdown } from "./countdown";
import { Faq, Fees } from "./shared";
import {
  CompetitionTimeline,
  RegistrationSteps,
  HomeFinalists,
  FinalCallToAction,
  SectionHeading,
} from "./home-sections";
import {
  ToyArt,
  StarDecoration,
  CloudDecoration,
  SparkleDecoration,
} from "./decorations";

const tones = ["pink", "blue", "green", "orange", "yellow", "purple"] as const;

type Work = {
  slug: string;
  public_name: string;
  regency_name: string;
  image: string;
};

/** Landing page of the national contest mode, following the Season 2 poster. */
export function NationalHome({
  season,
  content,
  works,
  recent,
}: {
  season: Season | null;
  content: ResolvedContent;
  works: Work[];
  recent: { public_name: string; competition_type: string }[];
}) {
  const theme = themeFor(season?.theme_key);
  const themeTitle = season?.theme_title || "Bebas";
  const phase = seasonPhase(season);
  const daysLeft = season ? daysUntil(season.registration_close_at) : 0;
  const categoryNames = content.categories.map((c) => c.label).join(" & ");
  const contestNames = content.contest_types.map((c) => c.label).join(" & ");
  const instagram = content.instagram.replace(/^@/, "");
  const poster = content.show_poster && content.poster_src;
  return (
    <>
      <RecentTicker items={recent} fee={content.registration_fee} />
      <section className="hero kids-hero national-hero">
        <div className="hero-white-shape" aria-hidden="true" />
        <CloudDecoration className="hero-cloud-one" />
        <StarDecoration className="hero-star-one" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="pill season-pill">
              <ToyIcon name="star" size={22} /> IDOLA CONTEST —{" "}
              {season?.name.toUpperCase() || "SEASON BARU"}
            </span>
            <br />
            <span className="candy-ribbon">
              <Sparkles size={16} aria-hidden="true" /> {content.season_ribbon}
            </span>
            <h1 className="candy-title">
              {content.hero_title}
              <SparkleDecoration className="headline-sparkle" />
            </h1>
            <span className="national-subtitle">{content.hero_subtitle}</span>
            <p>
              {contestNames} · kategori {categoryNames} · tema {themeTitle}.
              Ikut dari rumah, penilaian murni dewan juri, dan semua hadiah
              gratis setelah menang.
            </p>
            <div className="candy-pill-row">
              {season && (
                <span className="candy-pill" data-tone="pink">
                  <CalendarDays size={16} aria-hidden="true" />
                  {phase === "upcoming"
                    ? "Pendaftaran dibuka"
                    : "Pendaftaran dibuka sampai"}{" "}
                  <b>
                    {formatDate(
                      phase === "upcoming"
                        ? season.registration_open_at
                        : season.registration_close_at,
                    )}
                  </b>
                </span>
              )}
              {phase === "registration" && (
                <span className="candy-pill" data-tone="yellow">
                  <ToyIcon name="clock" size={22} />{" "}
                  {daysLeft <= 1
                    ? "Hari terakhir pendaftaran!"
                    : `Hanya ${daysLeft} hari lagi!`}
                </span>
              )}
              {(phase === "submission" || phase === "judging") && season && (
                <span className="candy-pill" data-tone="yellow">
                  <ToyIcon name="trophy" size={22} /> Pengumuman {formatDate(season.announcement_at)}
                </span>
              )}
            </div>
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
              <span>Registrasi {rupiah(content.registration_fee)}</span>
              <span className="dot" />
              <span>Seluruh Indonesia</span>
            </div>
            {season && phase === "registration" && (
              <div className="hero-countdown">
                <p>Pendaftaran ditutup dalam</p>
                <Countdown close={season.registration_close_at} />
                {content.quota && (
                  <span className="pill quota-pill">
                    FINALIS TERBATAS · maks. {content.quota} peserta
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="hero-artboard">
            <div className="artboard-sky" />
            <div className="artboard-rainbow" />
            <CloudDecoration className="artboard-cloud" />
            {poster ? (
              <div className="hero-poster-frame">
                <Image
                  src={content.poster_src}
                  width={900}
                  height={1122}
                  sizes="(max-width:760px) 88vw, 40vw"
                  alt={content.poster_caption || "Poster Idola Contest"}
                  priority
                />
              </div>
            ) : (
              <Image
                className="hero-logo"
                src="/logo.webp"
                width={560}
                height={560}
                sizes="(max-width:760px) 80vw, 43vw"
                alt="Logo Idola Contest"
                priority
              />
            )}
            <ToyArt kind="camera" className="hero-camera" />
            <ToyArt kind="pencil" className="hero-pencils" />
            <StarDecoration className="hero-star-two" />
            <StarDecoration className="hero-star-three" />
            <div className="season-motifs" aria-hidden="true">
              {theme.motifs.map((motif, i) => (
                <span className="season-motif" key={`${motif}-${i}`}>
                  <ToyIcon name={motif} size={54} />
                </span>
              ))}
            </div>
            <div className="artboard-ground" />
          </div>
        </div>
      </section>

      <section className="wrap feature-wrap" aria-label="Keunggulan lomba">
        <div className="feature-strip">
          {[
            {
              Icon: Globe2,
              name: "Lomba Online Nasional",
              text: "Ikut dari rumah, seluruh Indonesia.",
              tone: "sky",
            },
            {
              Icon: Trophy,
              name: "Hadiah Uang Tunai",
              text: "Plus piala & sertifikat tiap kategori.",
              tone: "yellow",
            },
            {
              Icon: Gift,
              name: "Semua FREE",
              text: "Tidak ada penebusan setelah menang.",
              tone: "pink",
            },
            {
              Icon: ShieldCheck,
              name: "Dewan Juri",
              text: "Penilaian murni, adil & transparan.",
              tone: "mint",
            },
          ].map(({ Icon, name, text, tone }) => (
            <div className="feature-item" key={name}>
              <span className={`bubble-icon tone-${tone}`}>
                <Icon size={28} />
              </span>
              <div>
                <h3>{name}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AmbassadorSpotlight
        ambassadors={content.ambassadors}
        seasonName={season?.name || "season ini"}
        registrationOpen={phase === "registration" || phase === "idle"}
      />

      <section className="section wrap" id="lomba">
        <div className="national-section-head">
          <span className="candy-banner" data-tone="purple">
            <Users size={26} aria-hidden="true" /> Kategori Lomba
          </span>
          <p>
            Pilih kategori sesuai usia si kecil. Setiap kategori punya juaranya
            sendiri, jadi peluangnya lebih adil.
          </p>
        </div>
        <div className="category-cards">
          {content.categories.map((category, i) => (
            <article
              className="candy-card category-card"
              data-tone={tones[i % tones.length]}
              key={category.key}
            >
              <ToyIcon name={category.icon || "star"} size={84} className="category-icon" />
              <h3>{category.label}</h3>
              <span className="category-age">{categoryAgeText(category)}</span>
              {category.note && <small>{category.note}</small>}
            </article>
          ))}
        </div>
        <div className="national-section-head mt-14">
          <span className="candy-banner">
            <Sparkles size={26} aria-hidden="true" /> Jenis Lomba
          </span>
          <p>
            Tema <b>{themeTitle}</b>. Boleh ikut salah satu atau keduanya,
            masing-masing dinilai terpisah per kategori.
          </p>
        </div>
        <div className="contest-cards">
          {content.contest_types.map((type) => (
            <article
              className="candy-card contest-card"
              data-tone={type.key === "coloring" ? "yellow" : "pink"}
              key={type.key}
            >
              <ToyArt kind={type.key === "coloring" ? "palette" : "camera"} />
              <div>
                <h3>{type.label}</h3>
                <p>{type.tagline}</p>
                <Link
                  className="btn secondary"
                  href={`/lomba/${contestTypeSlug(type.key)}`}
                >
                  Lihat detail lomba <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap" id="hadiah">
        <div className="national-section-head">
          <span className="candy-banner" data-tone="pink">
            <Trophy size={26} aria-hidden="true" /> Hadiah
          </span>
          <p>
            Uang tunai, piala, dan sertifikat untuk para juara di setiap
            kategori. Tanpa biaya penebusan.
          </p>
        </div>
        <div className="national-prize-grid">
          {content.prizes.map((prize, i) => (
            <article
              className="candy-card"
              data-tone={prize.tone}
              key={`${prize.title}-${i}`}
            >
              <span className="candy-card-title">
                <ToyIcon
                  name={i === 0 ? "crown" : i === 1 ? "star" : i === 2 ? "trophy" : "heart"}
                  size={26}
                />{" "}
                {prize.title}
              </span>
              <CashStack amount={prize.cash} />
              <span className="prize-cash">{rupiah(prize.cash)}</span>
              {prize.extras && <p className="prize-extras">{prize.extras}</p>}
            </article>
          ))}
        </div>
        <div className="prize-footer">
          {content.voucher_text && (
            <span className="voucher-pill">
              <Gift size={18} aria-hidden="true" /> {content.voucher_text}
            </span>
          )}
          {content.prize_note && (
            <span className="prize-note-pill">✦ {content.prize_note}</span>
          )}
        </div>
      </section>

      <section className="section wrap">
        <div className="national-free-grid">
          <article className="candy-card free-card" data-tone="green">
            <span className="candy-card-title">
              <Gift size={16} aria-hidden="true" /> Gratis
            </span>
            <h3 className="text-2xl mt-4">{content.free_title}</h3>
            <ul>
              {content.free_bullets.map((bullet) => (
                <li key={bullet}>
                  <span>
                    <Check size={18} aria-hidden="true" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </article>
          <article className="candy-card fee-card" data-tone="yellow">
            <span className="candy-card-title">
              <Coins size={16} aria-hidden="true" /> Biaya Registrasi
            </span>
            <span className="fee-amount">{rupiah(content.registration_fee)}</span>
            <small>Sekali bayar · {bankLine(content)}</small>
            {content.finalist_note && (
              <span className="candy-pill" data-tone="pink">
                {content.finalist_note}
              </span>
            )}
            {content.quota && <small>Maks. {content.quota} finalis</small>}
            {(phase === "registration" || phase === "idle") && (
              <Link className="btn mt-2" href="/daftar">
                Daftar Sekarang <ArrowRight size={18} />
              </Link>
            )}
          </article>
        </div>
      </section>

      {poster && (
        <section className="section wrap" id="poster">
          <div className="poster-section">
            <figure className="poster-figure">
              <Image
                src={content.poster_src}
                width={900}
                height={1122}
                sizes="(max-width:980px) 92vw, 420px"
                alt={content.poster_caption || "Poster Idola Contest"}
              />
              {content.poster_caption && (
                <figcaption>{content.poster_caption}</figcaption>
              )}
            </figure>
            <div className="stack">
              <SectionHeading
                eyebrow="Poster resmi"
                title={
                  <>
                    Simpan &amp; <span className="text-pink">bagikan posternya.</span>
                  </>
                }
                description="Bagikan ke grup keluarga dan teman sekolah agar makin banyak bintang kecil yang ikut bersinar."
              />
              <div className="actions">
                <a className="btn secondary" href={content.poster_src} download>
                  <Download size={18} /> Unduh poster
                </a>
                <a
                  className="btn secondary"
                  href={instagramUrl(instagram)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram /> Follow @{instagram}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <CompetitionTimeline season={season} />
      <RegistrationSteps fee={content.registration_fee} />
      <HomeFinalists seasonName={season?.name || "season ini"} works={works} />
      <section className="section wrap info-section">
        <div className="grid2">
          <div className="info-card">
            <span className="eyebrow">ADIL &amp; TRANSPARAN</span>
            <h3>Penilaian murni dewan juri.</h3>
            <p>
              Lima kriteria berbobot 30%, 25%, 20%, 15%, dan 10%, dinilai oleh
              dewan juri dan diranking otomatis per jenis lomba dan kategori
              usia. Tidak ada sistem penebusan hadiah.
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
