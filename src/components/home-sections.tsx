import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Trophy,
  Palette,
  Camera,
  BookOpen,
  Blocks,
  Pencil,
  Star,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { categories } from "@/lib/business-rules";
import {
  ToyArt,
  WaveDivider,
  StarDecoration,
  CloudDecoration,
  FloatingSticker,
  SparkleDecoration,
} from "./decorations";
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>
        <span className="heading-star" aria-hidden>
          ✦
        </span>
        {title}
        <span className="heading-star" aria-hidden>
          ✦
        </span>
      </h2>
      {description && <p className="muted">{description}</p>}
    </div>
  );
}
export function FeatureStrip() {
  return (
    <section
      className="wrap feature-wrap"
      aria-label="Keunggulan Idola Contest"
    >
      <div className="feature-strip">
        {[
          {
            Icon: Sparkles,
            name: "Wadah Kreativitas",
            text: "Mimpi kecil, potensi besar.",
            tone: "yellow",
          },
          {
            Icon: Trophy,
            name: "Penghargaan Nasional",
            text: "Apresiasi setiap pencapaian.",
            tone: "sky",
          },
          {
            Icon: Palette,
            name: "Kompetisi Seru",
            text: "Berkarya dari rumah.",
            tone: "pink",
          },
          {
            Icon: ShieldCheck,
            name: "Aman untuk Anak",
            text: "Data keluarga tetap privat.",
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
  );
}
export function CompetitionCards() {
  return (
    <section className="section wrap competition-section" id="lomba">
      <SectionHeading
        eyebrow="Pilih panggung si kecil"
        title={
          <>
            Beda bakat, <span className="text-pink">sama hebatnya!</span>
          </>
        }
        description="Dua kompetisi seru, satu tema penuh inspirasi: Cita Citaku."
      />
      <div className="grid2">
        {[
          {
            type: "photogenic",
            title: "Lomba Fotogenik",
            href: "fotogenik",
            kind: "camera" as const,
            tone: "pink",
            tag: "EKSPRESIKAN MIMPINYA",
            text: "Senyum, ekspresi, dan percaya dirinya bercerita tentang cita-cita.",
            age: "Preschool, PAUD, TK & SD kelas 1–6",
          },
          {
            type: "coloring",
            title: "Lomba Mewarnai",
            href: "mewarnai",
            kind: "palette" as const,
            tone: "yellow",
            tag: "WARNAKAN CITA-CITANYA",
            text: "Lebih istimewa dengan worksheet personal dari foto dan profesi impiannya.",
            age: "PAUD, TK & SD kelas 1–6",
          },
        ].map((c) => (
          <article className={`competition-card tone-${c.tone}`} key={c.type}>
            <div className="competition-art">
              <span className="art-orbit" />
              <ToyArt kind={c.kind} />
              <StarDecoration className="art-star" />
              <span className="competition-price">
                Rp20.000<small>registrasi</small>
              </span>
            </div>
            <div className="competition-copy">
              <span className="eyebrow">{c.tag}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <span className="age-tag">{c.age}</span>
              <Link className="btn secondary" href={`/lomba/${c.href}`}>
                Lihat detail lomba <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="category-heading">
        <h3>Panggung untuk setiap usia</h3>
        <span>Temukan kategori si kecil</span>
      </div>
      <div className="category-row">
        {Object.entries(categories).map(([key, name], i) => {
          const icons = [Star, Blocks, Palette, BookOpen, Pencil, Trophy];
          const Icon = icons[i];
          return (
            <Link
              className="category-bubble"
              href={`/galeri?category=${key}`}
              key={key}
            >
              <span
                className={`bubble-icon tone-${["yellow", "pink", "sky", "mint", "purple", "peach"][i]}`}
              >
                <Icon size={29} />
              </span>
              <span>{name.replace("Kelas ", "")}</span>
            </Link>
          );
        })}
      </div>
      <p className="category-note">
        Preschool khusus lomba fotogenik. Mewarnai dimulai dari PAUD.
      </p>
    </section>
  );
}
export function PersonalizedWorksheetSection() {
  return (
    <section className="blue-scene worksheet-section">
      <WaveDivider flip />
      <div className="wrap grid2 items-center">
        <div className="worksheet-art">
          <div className="worksheet-paper">
            <span>IDOLA CONTEST · CITA CITAKU</span>
            <svg viewBox="0 0 200 190" aria-hidden="true">
              <g
                fill="none"
                stroke="#194a80"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="100" cy="63" r="28" />
                <path d="M73 60v-9q27-35 54 0M74 46V26h52v20M92 33h16m-8-6v13M88 65h1m22 0h1m-23 13q11 10 22 0M85 94 62 109l-9 48 26 2 3-34v49h38v-49l3 34 25-2-9-48-23-15M84 97l16 21 16-21M100 119v55M79 125h13m17 0h13M34 34l6 10 12 2-9 9 2 12-11-6-11 6 2-12-9-9 12-2ZM162 59l5 8 9 1-6 7 1 9-9-5-8 5 1-9-6-7 9-1Z" />
              </g>
            </svg>
            <strong>Aku ingin menjadi dokter!</strong>
            <small>Ilustrasi contoh · worksheet personal dibuat admin</small>
          </div>
          <ToyArt kind="pencil" className="worksheet-pencils" />
          <FloatingSticker className="worksheet-sticker">
            <CheckCircle2 size={21} /> Khusus untuk si kecil
          </FloatingSticker>
          <StarDecoration className="worksheet-star" />
        </div>
        <div className="worksheet-copy">
          <span className="pill glass-pill">
            ✦ LEBIH PERSONAL, LEBIH ISTIMEWA
          </span>
          <h2>
            Wajah si kecil.
            <br />
            Cita-citanya.
            <br />
            <span className="text-yellow-200">Satu karya istimewa!</span>
          </h2>
          <p>
            Worksheet mewarnai yang dibuat khusus berdasarkan foto si kecil dan
            profesi impiannya. Jadi dokter, astronaut, atau apa pun mimpinya!
          </p>
          <div className="worksheet-steps">
            <span>1. Kirim foto</span>
            <ArrowRight size={16} />
            <span>2. Cetak A4</span>
            <ArrowRight size={16} />
            <span>3. Warnai!</span>
          </div>
          <Link className="btn" href="/lomba/mewarnai">
            Kenali worksheet personal <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <CloudDecoration className="scene-cloud" />
      <WaveDivider />
    </section>
  );
}
export function PrizeSection() {
  return (
    <section className="section wrap" id="hadiah">
      <SectionHeading
        eyebrow="Koleksi kenangan berharga"
        title={
          <>
            Hadiah premium <span className="text-pink">untuk para idola!</span>
          </>
        }
        description="Bukan sekadar hadiah. Ini pengingat bahwa usaha si kecil layak dirayakan."
      />
      <div className="prize-grid">
        {[
          {
            name: "Piala Gold Marmer",
            sub: "Momen juara yang berkilau",
            kind: "trophy",
            tone: "yellow",
          },
          {
            name: "Medali Juara Nasional",
            sub: "Satu langkah penuh bangga",
            kind: "medal",
            tone: "sky",
          },
          {
            name: "Piagam Penghargaan",
            sub: "Jejak prestasi si kecil",
            kind: "certificate",
            tone: "pink",
          },
          {
            name: "Plakat Marmer",
            sub: "Kenangan istimewa",
            kind: "plaque",
            tone: "purple",
          },
          {
            name: "Worksheet Unlimited",
            sub: "Petualangan kreativitas",
            kind: "palette",
            tone: "mint",
          },
        ].map((r, i) => (
          <article key={r.name} className={`prize-card tone-${r.tone}`}>
            <span className="reward-shine" aria-hidden>
              ✦
            </span>
            {r.kind === "trophy" || r.kind === "palette" ? (
              <ToyArt kind={r.kind} />
            ) : (
              <div className={`reward-object reward-${r.kind}`} aria-hidden>
                {r.kind === "medal" ? (
                  <>
                    <span className="ribbon" />
                    <span className="medal-face">★</span>
                  </>
                ) : r.kind === "certificate" ? (
                  <>
                    <span>PIAGAM</span>
                    <Star fill="#ffca35" />
                    <i />
                    <i />
                  </>
                ) : (
                  <>
                    <Star fill="#ffca35" />
                    <span>IDOLA</span>
                  </>
                )}
              </div>
            )}
            <h3>{r.name}</h3>
            <p>{r.sub}</p>
            <span className="reward-number">0{i + 1}</span>
          </article>
        ))}
      </div>
      <div className="fee-banner">
        <div>
          <span className="bubble-icon tone-yellow">
            <Trophy size={25} />
          </span>
          <p>
            <strong>Klaim paket penghargaan Rp120.000</strong>
            <br />
            <span>
              Setelah pengumuman · termasuk gratis ongkir seluruh Indonesia
            </span>
          </p>
        </div>
        <Truck className="fee-truck" size={36} />
      </div>
    </section>
  );
}
export function CompetitionTimeline() {
  return (
    <section className="section timeline-section">
      <div className="wrap">
        <SectionHeading
          eyebrow="Setiap langkah punya cerita"
          title="Perjalanan menuju panggung."
          description="Catat tanggalnya, siapkan karya terbaiknya. Semua waktu dalam WIB."
        />
        <div className="journey">
          {[
            ["21 SEP", "Pendaftaran dibuka", Pencil],
            ["06 OKT", "Batas daftar & karya", Camera],
            ["07 OKT", "Penilaian juri", Star],
            ["08 OKT", "Pengumuman", Trophy],
            ["09–12 OKT", "Persiapan hadiah", Palette],
            ["13 OKT", "Mulai pengiriman", Truck],
          ].map(([date, label, icon], i) => {
            const Icon = icon as typeof Star;
            return (
              <div className="journey-stop" key={String(date)}>
                <span
                  className={`journey-icon tone-${["pink", "sky", "yellow", "purple", "mint", "peach"][i]}`}
                >
                  <Icon size={26} />
                  <small>{i + 1}</small>
                </span>
                <b>{String(date)}</b>
                <p>{String(label)}</p>
              </div>
            );
          })}
        </div>
        <p className="text-center muted text-sm mt-6">
          Batas kirim karya: 7 hari setelah registrasi atau 6 Oktober 2026, mana
          yang lebih awal.
        </p>
      </div>
    </section>
  );
}
export function RegistrationSteps() {
  return (
    <section className="section wrap">
      <SectionHeading
        eyebrow="Mudah, tanpa membuat akun"
        title={
          <>
            Empat langkah <span className="text-pink">untuk bersinar.</span>
          </>
        }
      />
      <div className="registration-steps">
        {[
          ["Daftar", "Follow @idola.contest, lalu isi data si kecil."],
          ["Bayar registrasi", "Transfer Rp20.000 dan konfirmasi ke admin."],
          ["Kirim karya", "Gunakan kode registrasi untuk mengirim karya."],
          ["Jadi finalis", "Karya direview, dipublikasikan, lalu dinilai."],
        ].map(([title, text], i) => (
          <article className="step-card" key={title}>
            <span
              className={`step-number tone-${["sky", "pink", "yellow", "mint"][i]}`}
            >
              {i + 1}
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function HomeFinalists({
  works,
}: {
  works: {
    slug: string;
    public_name: string;
    regency_name: string;
    image: string;
  }[];
}) {
  return (
    <section className="section gallery-scene">
      <div className="wrap">
        <SectionHeading
          eyebrow="Panggung bintang kecil"
          title={
            <>
              Kecil-kecil, <span className="text-pink">penuh inspirasi.</span>
            </>
          }
          description="Karya yang sudah disetujui dan dipublikasikan admin."
        />
        {works.length ? (
          <div className="grid3">
            {works.map((w) => (
              <Link
                className="card finalist-card"
                key={w.slug}
                href={`/finalis/${w.slug}`}
              >
                <div className="finalist-image">
                  <Image
                    src={w.image}
                    alt={`Karya ${w.public_name}`}
                    width={380}
                    height={380}
                  />
                  <span className="pill">★ FINALIS</span>
                </div>
                <h3>{w.public_name}</h3>
                <p>{w.regency_name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="gallery-empty">
            <StarDecoration />
            <div>
              <h3>Panggungnya siap. Bintang kecilnya segera hadir!</h3>
              <p>
                Jadi bagian dari cerita Season 1. Karya finalis tampil setelah
                proses review.
              </p>
            </div>
            <Link className="btn secondary" href="/daftar">
              Ikut bersinar <ArrowRight size={18} />
            </Link>
          </div>
        )}
        <div className="text-center mt-8">
          <Link className="btn secondary" href="/galeri">
            Jelajahi galeri <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function FinalCallToAction() {
  return (
    <section className="section wrap">
      <div className="final-cta">
        <CloudDecoration className="cta-cloud" />
        <StarDecoration className="cta-star" />
        <ToyArt kind="trophy" className="cta-trophy" />
        <div>
          <span className="pill glass-pill">MIMPI BESAR DIMULAI DARI SINI</span>
          <h2>
            Satu langkah kecil.
            <br />
            <span>Cerita hebat si kecil.</span>
          </h2>
          <p>Beri ruang untuk berani tampil, berkarya, dan bersinar.</p>
          <Link className="btn" href="/daftar">
            Daftar Sekarang <ArrowRight size={19} />
          </Link>
        </div>
        <SparkleDecoration className="cta-sparkle" />
      </div>
    </section>
  );
}
