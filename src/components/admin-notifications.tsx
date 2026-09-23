"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { showSuccess } from "@/lib/success-event";

type NotificationState =
  "checking" | "unsupported" | "disabled" | "enabled" | "denied";

function applicationServerKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export function AdminNotifications() {
  const [state, setState] = useState<NotificationState>("checking");
  const [busy, setBusy] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  useEffect(() => {
    async function inspectPermission() {
      await Promise.resolve();
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setState(subscription ? "enabled" : "disabled");
      } catch {
        setState("unsupported");
      }
    }
    void inspectPermission();
  }, []);

  async function enable() {
    if (!publicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "disabled");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
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
        "Perangkat ini akan menerima kabar pendaftaran dan karya baru.",
        "admin",
        "Notifikasi admin aktif!",
      );
    } catch (error) {
      showSuccess(
        (error as Error).message || "Notifikasi belum dapat diaktifkan.",
        "admin",
        "Coba aktifkan kembali",
      );
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
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
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`admin-push-card ${state}`}>
      <span className="admin-push-icon" aria-hidden="true">
        {state === "enabled" ? <Bell /> : <Smartphone />}
      </span>
      <div>
        <b>Notifikasi PWA di HP</b>
        <p>
          {state === "enabled"
            ? "Aktif — pendaftaran dan karya baru akan muncul sebagai notifikasi."
            : state === "unsupported"
              ? "Pasang PWA Admin ke layar utama HP, lalu buka kembali untuk mengaktifkan notifikasi."
              : state === "denied"
                ? "Izin diblokir. Buka pengaturan situs di HP untuk mengizinkannya."
                : !publicKey
                  ? "Konfigurasi notifikasi belum dipasang pada server."
                  : "Aktifkan agar kabar pendaftaran dan karya baru langsung masuk ke HP admin."}
        </p>
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
          disabled={
            busy ||
            state === "checking" ||
            state === "denied" ||
            state === "unsupported" ||
            !publicKey
          }
          onClick={() => void enable()}
        >
          <Bell /> {busy ? "Mengaktifkan…" : "Aktifkan notifikasi"}
        </button>
      )}
    </section>
  );
}
