"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  FilePlus2,
  Images,
  LogOut,
  Medal,
  PackageCheck,
  Paintbrush,
  ScrollText,
  Settings,
  Star,
  Trophy,
  UsersRound,
} from "lucide-react";

const allPages = [
  ["dashboard", "Ringkasan", BarChart3],
  ["pendaftaran", "Pendaftaran Masuk", ClipboardCheck],
  ["peserta", "Data Peserta", UsersRound],
  ["tambah-peserta", "Tambah Peserta", FilePlus2],
  ["karya", "Review Karya", Images],
  ["penilaian", "Penilaian", Star],
  ["hasil", "Hasil & Juara", Trophy],
  ["klaim-hadiah", "Klaim Hadiah", Medal],
  ["pengiriman", "Pengiriman", PackageCheck],
  ["settings", "Pengaturan", Settings],
  ["audit", "Audit Log", ScrollText],
] as const;

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const pages = role === "judge" ? allPages.filter(([key]) => key === "penilaian") : allPages;

  return (
    <aside className="admin-sidebar">
      <Link href="/admin/dashboard" className="admin-brand">
        <Image src="/logo.webp" width={54} height={54} alt="Idola Contest" priority />
        <span>Idola Contest<small>ADMIN CENTER</small></span>
      </Link>
      <div className="admin-role"><Paintbrush size={17}/><span>Masuk sebagai</span><b>{role.replace("_", " ")}</b></div>
      <nav aria-label="Menu admin">
        {pages.map(([key, label, Icon]) => {
          const href = `/admin/${key}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={key} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><Icon/><span>{label}</span></Link>;
        })}
      </nav>
      <form action="/api/admin/logout" method="post" className="admin-logout">
        <button type="submit"><LogOut/><span>Keluar</span></button>
      </form>
    </aside>
  );
}
