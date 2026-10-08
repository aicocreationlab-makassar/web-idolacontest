"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  UserPlus,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { browser } from "@/lib/supabase/client";

type Connection = "connecting" | "live" | "polling";
type Toast = {
  id: number;
  title: string;
  body: string;
  url: string;
  kind: "registration" | "submission" | "info";
};

const watched = [
  "registrations",
  "payments",
  "submissions",
  "claim_invoices",
  "shipments",
  "results",
  "judging_scores",
  "seasons",
];

/**
 * Keeps admin pages current. Supabase Realtime drives instant refreshes and
 * in-app alerts; it re-subscribes with backoff whenever the socket drops, and a
 * polling fallback guarantees updates even while the socket is down. The
 * indicator shows which mode is active.
 */
export function Realtime() {
  const router = useRouter();
  const [connection, setConnection] = useState<Connection>("connecting");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const db = browser();
    let disposed = false;
    let live = false;
    let channel: RealtimeChannel | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 400);
    };

    const pushToast = (toast: Omit<Toast, "id">) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((list) => [...list.slice(-2), { ...toast, id }]);
      window.setTimeout(
        () => setToasts((list) => list.filter((item) => item.id !== id)),
        9000,
      );
    };

    const subscribe = async () => {
      if (disposed) return;
      if (channel) {
        const old = channel;
        channel = null;
        await db.removeChannel(old).catch(() => {});
      }
      // Make sure the socket carries the admin session before joining.
      const { data } = await db.auth.getSession();
      if (data.session?.access_token)
        await db.realtime.setAuth(data.session.access_token);
      if (disposed) return;

      let next = db.channel(`admin-operations-${Date.now()}`);
      for (const table of watched)
        next = next.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            refresh();
            if (payload.eventType === "INSERT" && table === "registrations") {
              const row = payload.new as {
                id?: string;
                competition_type?: string;
                registration_code?: string;
              };
              pushToast({
                kind: "registration",
                title: "Pendaftar baru masuk",
                body: `${row.registration_code || "Peserta baru"} · ${row.competition_type === "coloring" ? "Mewarnai" : "Fotogenik"}`,
                url: row.id ? `/admin/peserta/${row.id}` : "/admin/pendaftaran",
              });
            }
            if (payload.eventType === "INSERT" && table === "submissions")
              pushToast({
                kind: "submission",
                title: "Karya baru dikirim",
                body: "Ada karya baru yang menunggu pemeriksaan.",
                url: "/admin/karya",
              });
          },
        );
      channel = next;
      next.subscribe((status, error) => {
        if (disposed || channel !== next) return;
        console.info("[realtime]", status, error?.message ?? "");
        if (status === "SUBSCRIBED") {
          attempt = 0;
          live = true;
          setConnection("live");
          refresh();
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          live = false;
          setConnection("polling");
          attempt += 1;
          clearTimeout(retryTimer);
          retryTimer = setTimeout(
            () => void subscribe(),
            Math.min(30000, 2000 * 2 ** Math.min(attempt, 4)),
          );
        }
      });
    };
    void subscribe();

    // Fallback polling: every 20 s while the socket is down, every 60 s while
    // it is live (only when the tab is visible) to catch anything missed.
    let lastPoll = Date.now();
    const poll = window.setInterval(() => {
      const interval = live ? 60000 : 20000;
      if (Date.now() - lastPoll < interval) return;
      if (document.visibilityState !== "visible") return;
      lastPoll = Date.now();
      router.refresh();
    }, 5000);
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        if (!live) void subscribe();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    const onOnline = () => void subscribe();
    window.addEventListener("online", onOnline);

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "push") {
        refresh();
        const payload = event.data.payload as {
          title: string;
          body: string;
          url: string;
        };
        pushToast({
          kind: "info",
          title: payload.title,
          body: payload.body,
          url: payload.url,
        });
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);

    return () => {
      disposed = true;
      clearTimeout(refreshTimer);
      clearTimeout(retryTimer);
      clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
      if (channel) void db.removeChannel(channel);
    };
  }, [router]);

  return (
    <>
      <p className={`admin-realtime ${connection}`} role="status">
        {connection === "live" ? (
          <>
            <Wifi aria-hidden="true" /> Realtime terhubung
          </>
        ) : connection === "polling" ? (
          <>
            <WifiOff aria-hidden="true" /> Realtime terputus · menyambung ulang,
            data diperbarui otomatis tiap 20 detik
          </>
        ) : (
          <>
            <RefreshCw aria-hidden="true" /> Menghubungkan realtime…
          </>
        )}
      </p>
      {toasts.length > 0 && (
        <div className="admin-toasts" aria-live="polite">
          {toasts.map((toast) => (
            <div className={`admin-toast ${toast.kind}`} key={toast.id}>
              <span aria-hidden="true">
                {toast.kind === "registration" ? <UserPlus /> : <ImageIcon />}
              </span>
              <a href={toast.url}>
                <b>{toast.title}</b>
                <small>{toast.body}</small>
              </a>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() =>
                  setToasts((list) =>
                    list.filter((item) => item.id !== toast.id),
                  )
                }
              >
                <X />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
