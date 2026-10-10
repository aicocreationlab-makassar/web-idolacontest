"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
export function MobileCta() {
  const path = usePathname();
  if (path.startsWith("/admin") || path.startsWith("/daftar")) return null;
  return (
    <div className="mobile-cta">
      <Link className="btn mobile-cta-button" href="/daftar">
        <Sparkles size={16} aria-hidden="true" /> Daftar Sekarang{" "}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
