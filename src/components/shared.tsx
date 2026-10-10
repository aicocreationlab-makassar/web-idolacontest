import Link from "next/link";
import Image from "next/image";
import { formatDateTime, type Season } from "@/lib/season";
import {
  bankLine,
  categoryAgeText,
  resolveContent,
  rupiah,
  type ResolvedContent,
} from "@/lib/contest-modes";

export function faqs(season?: Season | null, content?: ResolvedContent) {
  const c = content ?? resolveContent(season);
  const deadline = season
    ? formatDateTime(season.submission_global_close_at)
    : "penutupan global season";
  const freeClaim = c.claim_fee === 0;
  return [
    [
      "Apakah peserta perlu membuat akun?",
      "Tidak. Simpan kode registrasi pribadi untuk cek pembayaran, mengambil worksheet, mengirim karya, melihat hasil juara, klaim hadiah, dan resi pengiriman.",
    ],
    [
      "Berapa biaya yang perlu disiapkan?",
      freeClaim
        ? `Hanya registrasi ${rupiah(c.registration_fee)}. Tidak ada biaya penebusan: semua hadiah gratis setelah menang. Transfer ke ${bankLine(c)}, lalu kirim bukti transfer melalui DM Instagram @${c.instagram.replace(/^@/, "")}.`
        : `Registrasi ${rupiah(c.registration_fee)}. Setelah pengumuman, klaim paket penghargaan ${rupiah(c.claim_fee)} termasuk gratis ongkir seluruh Indonesia. Transfer ke ${bankLine(c)}.`,
    ],
    c.mode === "national"
      ? [
          "Kategori apa saja yang bisa diikuti?",
          `${c.categories
            .map((category) => `${category.label} (${categoryAgeText(category)})`)
            .join(" dan ")} untuk ${c.contest_types
            .map((type) => type.label.toLowerCase())
            .join(" maupun ")}. Juara ditentukan per kategori.`,
        ]
      : [
          "Apakah Preschool bisa ikut mewarnai?",
          "Preschool hanya dapat mengikuti fotogenik. Mewarnai dimulai dari PAUD hingga SD kelas 5–6.",
        ],
    [
      "Kapan batas pengumpulan karya?",
      `Maksimal 7 hari setelah mendaftar atau ${deadline}, mana yang lebih awal.`,
    ],
    [
      "Apakah foto anak langsung tampil di galeri?",
      "Tidak. Semua unggahan disimpan privat. Karya baru tampil setelah disetujui dan dipublikasikan oleh admin.",
    ],
    [
      "Bagaimana mendapatkan worksheet personal?",
      "Setelah pembayaran mewarnai terverifikasi, admin menyiapkan worksheet berdasarkan foto dan tema season. Unduh melalui Cek Status, lalu cetak A4.",
    ],
    [
      "Bagaimana juara ditentukan?",
      "Juri menilai lima kriteria berbobot. Sistem meranking otomatis setiap peserta dibandingkan peserta lain pada jenis lomba dan kategori usia yang sama, lalu admin mengumumkan juaranya.",
    ],
    ...(c.mode === "national" && c.prizes.length
      ? [
          [
            "Apa yang didapat juara?",
            `${c.prizes
              .map((prize) => `${prize.title} ${rupiah(prize.cash)}${prize.extras ? ` ${prize.extras}` : ""}`)
              .join(", ")}${c.prize_note ? ` (${c.prize_note.toLowerCase()})` : ""}${c.voucher_text ? `, ditambah ${c.voucher_text.toLowerCase()}` : ""}. Juara mengonfirmasi alamat dan rekening hadiah melalui Cek Status, gratis tanpa penebusan.`,
          ],
        ]
      : []),
  ];
}

export function Faq({
  season,
  content,
}: {
  season?: Season | null;
  content?: ResolvedContent;
}) {
  return (
    <div>
      {faqs(season, content).map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p className="muted mt-3">{a}</p>
        </details>
      ))}
    </div>
  );
}
export function Fees({ content }: { content?: ResolvedContent }) {
  const c = content ?? resolveContent(null);
  return (
    <div className="notice">
      <Image
        className="bsi-logo"
        src="/logo-bsi.png"
        width={190}
        height={90}
        alt="Bank Syariah Indonesia"
      />
      <strong>Biaya jelas sejak awal.</strong>
      {c.claim_fee === 0 ? (
        <p>
          Registrasi <b>{rupiah(c.registration_fee)}</b>. Semua hadiah{" "}
          <b>gratis</b> setelah menang, tanpa biaya penebusan.
        </p>
      ) : (
        <p>
          Registrasi <b>{rupiah(c.registration_fee)}</b>. Klaim paket penghargaan setelah pengumuman{" "}
          <b>{rupiah(c.claim_fee)}</b>, termasuk gratis ongkir seluruh Indonesia.
        </p>
      )}
      <p>
        {c.bank_name} <b>{c.bank_account}</b> a.n. <b>{c.bank_holder}</b>.
      </p>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl mb-10">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className="text-4xl md:text-5xl my-4">{title}</h1>
      {description && <p className="muted">{description}</p>}
    </div>
  );
}
export function CTA() {
  return (
    <section className="section wrap">
      <div className="card text-center bg-purple! text-white">
        <span className="pill">MIMPI BESAR DIMULAI DARI SINI</span>
        <h2 className="my-6">
          Satu langkah kecil.
          <br />
          Cerita hebat si kecil.
        </h2>
        <p>Yuk, beri ruang untuk berani tampil dan berkreasi.</p>
        <Link className="btn secondary mt-6" href="/daftar">
          Daftar Sekarang ↗
        </Link>
      </div>
    </section>
  );
}
