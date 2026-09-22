"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, PartyPopper, Sparkles, X } from "lucide-react";
import { SUCCESS_EVENT, SUCCESS_STORAGE_KEY } from "@/lib/success-event";

export function SuccessPopup() {
  const [message, setMessage] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (event: Event) => {
      clearTimeout(timer);
      setMessage((event as CustomEvent<string>).detail || "Berhasil disimpan!");
      timer = setTimeout(() => setMessage(""), 4200);
    };
    window.addEventListener(SUCCESS_EVENT, show);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(SUCCESS_EVENT, show);
    };
  }, []);

  useEffect(() => {
    try {
      const pending = JSON.parse(
        sessionStorage.getItem(SUCCESS_STORAGE_KEY) || "null",
      ) as { message?: string; createdAt?: number } | null;
      if (
        pending?.message &&
        pending.createdAt &&
        Date.now() - pending.createdAt < 15000
      ) {
        sessionStorage.removeItem(SUCCESS_STORAGE_KEY);
        queueMicrotask(() =>
          window.dispatchEvent(
            new CustomEvent(SUCCESS_EVENT, { detail: pending.message }),
          ),
        );
      }
    } catch {
      // Storage can be disabled; live events continue to work.
    }
  }, [pathname]);

  if (!message) return null;

  return (
    <div className="success-popup-layer" role="status" aria-live="polite">
      <div className="success-popup-card">
        <button
          type="button"
          className="success-popup-close"
          aria-label="Tutup pemberitahuan"
          onClick={() => {
            sessionStorage.removeItem(SUCCESS_STORAGE_KEY);
            setMessage("");
          }}
        >
          <X />
        </button>
        <div className="success-popup-art" aria-hidden="true">
          <span className="success-orb">
            <Check />
          </span>
          <PartyPopper className="success-party" />
          <Sparkles className="success-sparkle one" />
          <Sparkles className="success-sparkle two" />
        </div>
        <span className="eyebrow">YEAY, BERHASIL!</span>
        <h2>Semuanya sudah beres</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
