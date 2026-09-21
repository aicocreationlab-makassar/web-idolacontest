"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
export function MobileCta() {
  const path = usePathname();
  if (path.startsWith("/admin") || path.startsWith("/daftar")) return null;
  return (
    <div className="mobile-cta">
      <Link className="btn" href="/daftar">
        Daftar Sekarang ↗
      </Link>
    </div>
  );
}
