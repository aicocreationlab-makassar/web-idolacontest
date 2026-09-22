"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { browser } from "@/lib/supabase/client";

export function Realtime() {
  const router = useRouter();

  useEffect(() => {
    const db = browser();
    let timer: ReturnType<typeof setTimeout>;
    const fallback = window.setInterval(() => router.refresh(), 30000);
    const refreshOnFocus = () => router.refresh();
    window.addEventListener("focus", refreshOnFocus);
    let channel = db.channel("admin-operations");

    for (const table of [
      "registrations",
      "payments",
      "submissions",
      "claim_invoices",
      "shipments",
    ]) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          clearTimeout(timer);
          timer = setTimeout(() => router.refresh(), 500);
        },
      );
    }

    channel.subscribe();

    return () => {
      clearTimeout(timer);
      clearInterval(fallback);
      window.removeEventListener("focus", refreshOnFocus);
      void db.removeChannel(channel);
    };
  }, [router]);

  return (
    <p className="admin-realtime" role="status">
      <span aria-hidden="true">●</span> Pembaruan otomatis aktif
    </p>
  );
}
