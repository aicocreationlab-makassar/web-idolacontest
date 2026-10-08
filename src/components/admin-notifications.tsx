"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Smartphone } from "lucide-react";
import { showSuccess } from "@/lib/success-event";
import { isIos, isStandalone } from "./admin-pwa";

type NotificationState =
  | "checking"
  | "unsupported"
  | "needs-install"
  | "disabled"
  | "enabled"
  | "denied"
  | "no-key";

function applicationServerKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

/** `navigator.serviceWorker.ready` never resolves without a registration; bound it. */
async function readyRegistration(timeoutMs = 6000) {
  const registered = await navigator.serviceWorker.getRegistration("/admin/");
  if (registered?.active) return registered;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<ServiceWorkerRegistration>((_, reject) =>
      window.setTimeout(() => reject(new Error("timeout")), timeoutMs),
    ),
  ]);
}

export function AdminNotifications() {
  const [state, setState] = useState<NotificationState>("checking");
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState("");
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  const inspect = useCallback(async () => {
    if (!publicKey) {
      setState("no-key");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    if (!("PushManager" in window) || !("Notification" in window)) {
      setState(isIos() && !isStandalone() ? "needs-install" : "unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    try {
      const registration = await readyRegistration();
      const subscription = await registration.pushManager.getSubscription();
      setState(subscription ? "enabled" : "disabled");
    } catch {
      setState("disabled");
    }
  }, [publicKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => void inspect(), 0);
    const again = () => void inspect();
    window.addEventListener("focus", again);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", again);
    };
  }, [inspect]);

  async function enable() {
    if (!publicKey) return;
    setBusy(true);
    setDetail("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "disabled");
        setDetail(
          permission === "denied"
            ? "Izin notifikasi diblokir browser. Buka pengaturan situs untuk mengizinkan."
            : "Izin belum diberikan. Ketuk lagi dan pilih Izinkan.",
        );
        return;
      }
      const registration = await readyRegistration(10000);
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(publicKey),
        }));
      const response = await fetch("/api/admin/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState("enabled");
      showSuccess(
        "Perangkat ini akan menerima notifikasi pendaftar dan karya baru secara langsung.",
        "admin",
        "Notifikasi admin aktif!",
      );
    } catch (error) {
      const message = (error as Error).message;
      setDetail(
        message === "timeout"
          ? "Service worker belum siap. Muat ulang halaman lalu coba lagi."
          : message || "Notifikasi belum dapat diaktifkan. Coba lagi.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await readyRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/admin/push-subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setState("disabled");
      showSuccess(
        "Notifikasi pada perangkat ini sudah dimatikan.",
        "admin",
        "Notifikasi dimatikan",
      );
    } catch {
      setDetail("Notifikasi belum dapat dimatikan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const copy: Record<NotificationState, string> = {
    checking: "Memeriksa status notifikasi perangkat ini…",
    unsupported:
      "Browser ini belum mendukung notifikasi push. Gunakan Chrome/Safari terbaru.",
    "needs-install":
      "Di iPhone/iPad, pasang dulu Idola Admin ke layar utama (Bagikan → Tambah ke Layar Utama), buka dari ikon aplikasi, lalu aktifkan notifikasi di sini.",
    disabled:
      "Aktifkan agar pendaftar baru dan karya baru langsung muncul sebagai notifikasi di HP ini.",
    enabled:
      "Aktif — pendaftar baru dan karya baru langsung muncul sebagai notifikasi.",
    denied:
      "Izin notifikasi diblokir. Buka pengaturan situs/aplikasi di HP untuk mengizinkannya.",
    "no-key": "Kunci VAPID belum dipasang di server (.env).",
  };

  return (
    <section className={`admin-push-card ${state}`}>
      <span className="admin-push-icon" aria-hidden="true">
        {state === "enabled" ? <BellRing /> : state === "disabled" ? <Bell /> : <Smartphone />}
      </span>
      <div>
        <b>Notifikasi realtime di HP</b>
        <p>{copy[state]}</p>
        {detail && (
          <p className="admin-push-detail" role="alert">
            {detail}
          </p>
        )}
      </div>
      {state === "enabled" ? (
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={() => void disable()}
        >
          <BellOff /> Matikan
        </button>
      ) : (
        <button
          type="button"
          className="btn"
          disabled={busy || state !== "disabled"}
          onClick={() => void enable()}
        >
          <Bell /> {busy ? "Mengaktifkan…" : "Aktifkan notifikasi"}
        </button>
      )}
    </section>
  );
}
