"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Registers the admin service worker (scope /admin/) and shows a one-tap
 * install guide until the admin runs the panel as an installed app.
 */
export function AdminPwa() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/admin-sw.js", { scope: "/admin/" })
        .then((registration) => registration.update().catch(() => {}))
        .catch(() => {});
    const dismissed = (() => {
      try {
        return sessionStorage.getItem("idola-admin-install-dismissed") === "1";
      } catch {
        return false;
      }
    })();
    const timer = window.setTimeout(() => {
      setIos(isIos());
      setVisible(!isStandalone() && !dismissed);
    }, 0);
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", capture);
    const installed = () => setVisible(false);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!visible) return null;

  return (
    <aside className="admin-install-card" role="note">
      <span className="admin-install-icon" aria-hidden="true">
        <Download />
      </span>
      <div>
        <b>Pasang Idola Admin di layar utama HP</b>
        {ios ? (
          <p>
            Buka halaman ini di Safari, ketuk <Share size={14} aria-label="Bagikan" />{" "}
            <b>Bagikan</b>, lalu pilih <SquarePlus size={14} aria-hidden="true" />{" "}
            <b>Tambah ke Layar Utama</b>. Aplikasi akan selalu terbuka di halaman
            admin dan notifikasi bisa diaktifkan.
          </p>
        ) : installPrompt ? (
          <p>Satu ketukan untuk memasang aplikasi admin dengan notifikasi.</p>
        ) : (
          <p>
            Buka menu browser lalu pilih <b>Instal aplikasi</b> atau{" "}
            <b>Tambahkan ke layar utama</b>.
          </p>
        )}
      </div>
      <div className="admin-install-actions">
        {installPrompt && (
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await installPrompt.prompt();
              const choice = await installPrompt.userChoice;
              if (choice.outcome === "accepted") setVisible(false);
            }}
          >
            Pasang sekarang
          </button>
        )}
        <button
          type="button"
          className="admin-install-close"
          aria-label="Sembunyikan panduan pasang"
          onClick={() => {
            setVisible(false);
            try {
              sessionStorage.setItem("idola-admin-install-dismissed", "1");
            } catch {}
          }}
        >
          <X />
        </button>
      </div>
    </aside>
  );
}
