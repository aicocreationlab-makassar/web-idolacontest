import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * Rendered in place of admin data that could not be loaded. Server-side so the
 * real reason (for example a missing migration) survives production builds,
 * where thrown server errors are redacted.
 */
export function LoadError({ message }: { message: string }) {
  const migrationHint = /migration|Fungsi database|Skema database/i.test(message);
  return (
    <div className="card stack admin-error" role="alert">
      <span className="admin-push-icon" aria-hidden="true">
        <AlertTriangle />
      </span>
      <h2>Ada data yang belum berhasil dimuat.</h2>
      <p>{message}</p>
      {migrationHint && (
        <p className="notice">
          Buka Supabase → SQL Editor, jalankan file{" "}
          <code>supabase/migrations/202610080001_season_themes_auto_rankings.sql</code>
          , lalu muat ulang halaman ini. Perintah <code>npm run check:supabase</code>{" "}
          memastikan semuanya sudah terpasang.
        </p>
      )}
      <div className="actions">
        <Link className="btn" href="?">
          Muat ulang
        </Link>
        <Link className="btn secondary" href="/admin/dashboard">
          Ke dashboard
        </Link>
      </div>
    </div>
  );
}
