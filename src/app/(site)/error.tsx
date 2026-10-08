"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="wrap section stack">
      <h1 className="text-4xl">Ada yang belum berhasil dimuat.</h1>
      <p>Silakan coba lagi. Data yang sudah tersimpan tidak berubah.</p>
      <button className="btn" onClick={reset}>
        Coba lagi
      </button>
    </div>
  );
}
