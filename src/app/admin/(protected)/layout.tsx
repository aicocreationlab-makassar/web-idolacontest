import Link from "next/link";
import { redirect } from "next/navigation";
import { admin } from "@/lib/supabase/server";
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
  const pages =
    role === "judge"
      ? ["penilaian"]
      : [
          "dashboard",
          "peserta",
          "pendaftaran",
          "karya",
          "penilaian",
          "hasil",
          "klaim-hadiah",
          "pengiriman",
          "settings",
          "audit",
        ];
  return (
    <div className="wrap section">
      <span className="eyebrow">Ruang pengelola · {role}</span>
      <nav className="admin-nav">
        {pages.map((p) => (
          <Link href={`/admin/${p}`} key={p}>
            {p.replaceAll("-", " ")}
          </Link>
        ))}
        <form action="/api/admin/logout" method="post">
          <button className="btn secondary">Keluar</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
