import { redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin-sidebar";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role = "";
  try {
    role = (await admin()).profile.role;
  } catch {
    redirect("/admin/login");
  }
  return (
    <div className="admin-shell">
      <AdminSidebar role={role} />
      <div className="admin-workspace">
        <header className="admin-topbar"><div><span>Idola Contest</span><b>Ruang Pengelola</b></div><span className="admin-live-dot">Sistem aktif</span></header>
        <div className="admin-page">{children}</div>
      </div>
    </div>
  );
}
