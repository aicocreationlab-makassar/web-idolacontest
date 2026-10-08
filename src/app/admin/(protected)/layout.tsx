import Link from "next/link";
import { redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data";
import { themeFor, seasonPhase } from "@/lib/season";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Realtime } from "@/components/realtime";
import { AdminNotifications } from "@/components/admin-notifications";

export const dynamic = "force-dynamic";

const phaseLabel: Record<string, string> = {
  idle: "Belum ada season aktif",
  upcoming: "Pendaftaran belum dibuka",
  registration: "Pendaftaran dibuka",
  submission: "Pengumpulan karya",
  judging: "Masa penilaian",
  announcement: "Pengumuman & klaim",
  shipping: "Pengiriman hadiah",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role = "";
  let name = "";
  try {
    const context = await admin();
    role = context.profile.role;
    name = context.profile.display_name;
  } catch {
    redirect("/admin/login");
  }
  const season = await getActiveSeason();
  const theme = themeFor(season?.theme_key);
  return (
    <div className="admin-shell">
      <AdminSidebar role={role} name={name} />
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span>Idola Contest</span>
            <b>Ruang Pengelola</b>
          </div>
          <Link
            className="admin-season-chip"
            href="/admin/settings"
            style={{
              background: `linear-gradient(120deg, ${theme.primary}, ${theme.primaryLight})`,
            }}
            title="Buka pengaturan season"
          >
            <span aria-hidden="true">{theme.motifs[0]}</span>
            <span>
              <b>{season ? `${season.name} · ${season.theme_title}` : "Tanpa season aktif"}</b>
              <small>{phaseLabel[seasonPhase(season)]}</small>
            </span>
          </Link>
        </header>
        <div className="admin-page">
          {role !== "judge" && <AdminNotifications />}
          <Realtime />
          {children}
        </div>
      </div>
    </div>
  );
}
