"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);
  const message = error.message || "";
  const migrationHint =
    /function|column|migration|does not exist|skema|fungsi/i.test(message);
  return (
    <div className="card stack admin-error">
      <span className="admin-push-icon" aria-hidden="true">
        <WifiOff />
      </span>
      <h2>Ada data yang belum berhasil dimuat.</h2>
      <p>{message || "Koneksi ke database terputus sesaat."}</p>
      {migrationHint && (
        <p className="notice">
          Pastikan file migration terbaru di <code>supabase/migrations</code>{" "}
          sudah dijalankan pada project Supabase, lalu muat ulang halaman ini.
        </p>
      )}
      <div className="actions">
        <button className="btn" onClick={reset}>
          <RefreshCw /> Muat ulang
        </button>
        <Link className="btn secondary" href="/admin/dashboard">
          Ke dashboard
        </Link>
      </div>
    </div>
  );
}
