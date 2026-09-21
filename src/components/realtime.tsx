"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browser } from "@/lib/supabase/client";
export function Realtime() {
  const router = useRouter();
  const [status, setStatus] = useState("Menghubungkan…");
  useEffect(() => {
    const db = browser();
    let timer: ReturnType<typeof setTimeout>;
    let channel = db.channel("admin-operations");
    for (const table of [
      "registrations",
      "payments",
      "submissions",
      "claim_invoices",
      "shipments",
    ])
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          clearTimeout(timer);
          timer = setTimeout(() => router.refresh(), 500);
        },
      );
    channel.subscribe((s) =>
      setStatus(
        s === "SUBSCRIBED"
          ? "Realtime aktif"
          : s === "CHANNEL_ERROR"
            ? "Koneksi realtime terputus; muat ulang halaman."
            : s,
      ),
    );
    return () => {
      clearTimeout(timer);
      void db.removeChannel(channel);
    };
  }, [router]);
  return (
    <p className="text-sm muted mb-5" role="status">
      ● {status}
    </p>
  );
}
