import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap section stack" style={{ maxWidth: 640, margin: "auto" }}>
      <span className="eyebrow">IDOLA CONTEST</span>
      <h1 className="text-4xl">Halaman belum ditemukan.</h1>
      <p>Tautan mungkin berubah atau karya belum dipublikasikan.</p>
      <div className="actions">
        <Link className="btn" href="/">
          Kembali ke beranda
        </Link>
        <Link className="btn secondary" href="/admin/dashboard">
          Ruang admin
        </Link>
      </div>
    </div>
  );
}
