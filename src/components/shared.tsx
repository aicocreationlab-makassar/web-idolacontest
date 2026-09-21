import Link from "next/link";
export const faqs = [
  [
    "Apakah peserta perlu membuat akun?",
    "Tidak. Simpan kode registrasi pribadi untuk cek pembayaran, mengambil worksheet, dan mengirim karya.",
  ],
  [
    "Berapa biaya yang perlu disiapkan?",
    "Registrasi Rp20.000. Setelah pengumuman, klaim paket penghargaan Rp120.000 termasuk gratis ongkir seluruh Indonesia. Transfer ke BSI 7341301558 a.n. Riswan Ramadhan.",
  ],
  [
    "Apakah Preschool bisa ikut mewarnai?",
    "Preschool hanya dapat mengikuti fotogenik. Mewarnai dimulai dari PAUD hingga SD kelas 5–6.",
  ],
  [
    "Kapan batas pengumpulan karya?",
    "Maksimal 7 hari setelah mendaftar atau 6 Oktober 2026 pukul 23.59 WITA, mana yang lebih awal.",
  ],
  [
    "Apakah foto anak langsung tampil di galeri?",
    "Tidak. Semua unggahan disimpan privat. Karya baru tampil setelah disetujui dan dipublikasikan oleh admin.",
  ],
  [
    "Bagaimana mendapatkan worksheet personal?",
    "Setelah pembayaran mewarnai terverifikasi, admin menyiapkan worksheet berdasarkan foto dan cita-cita anak. Unduh melalui Cek Status, lalu cetak A4.",
  ],
];
export function Faq() {
  return (
    <div>
      {faqs.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p className="muted mt-3">{a}</p>
        </details>
      ))}
    </div>
  );
}
export function Fees() {
  return (
    <div className="notice">
      <strong>Biaya jelas sejak awal.</strong>
      <p>
        Registrasi <b>Rp20.000</b>. Klaim paket penghargaan setelah pengumuman{" "}
        <b>Rp120.000</b>, termasuk gratis ongkir seluruh Indonesia.
      </p>
      <p>
        BSI <b>7341301558</b> a.n. <b>Riswan Ramadhan</b>.
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
