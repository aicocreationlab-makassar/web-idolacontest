import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap section stack">
      <h1 className="text-4xl">Halaman belum ditemukan.</h1>
      <p>Tautan mungkin berubah atau karya belum dipublikasikan.</p>
      <Link className="btn" href="/">
        Kembali ke beranda
      </Link>
    </div>
  );
}
