"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const ENTRY_KEY = "idola-admin-history-entry";

/**
 * Back button shown on every admin page except the dashboard. It goes back
 * within the admin when this tab navigated here; opened directly (PWA start,
 * push notification, shared link) it falls back to the parent page instead of
 * leaving the admin.
 */
export function AdminBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(ENTRY_KEY))
        sessionStorage.setItem(ENTRY_KEY, String(window.history.length));
    } catch {
      // Without storage the fallback link is used.
    }
  }, []);

  if (pathname === "/admin" || pathname === "/admin/dashboard") return null;
  const fallback = pathname.startsWith("/admin/peserta/")
    ? "/admin/peserta"
    : "/admin/dashboard";

  return (
    <button
      type="button"
      className="admin-back"
      aria-label="Kembali"
      onClick={() => {
        let entry = Infinity;
        try {
          entry = Number(sessionStorage.getItem(ENTRY_KEY) ?? Infinity);
        } catch {}
        if (window.history.length > entry) router.back();
        else router.push(fallback);
      }}
    >
      <ArrowLeft aria-hidden="true" />
      <span>Kembali</span>
    </button>
  );
}
