"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Camera,
  Check,
  Copy,
  KeyRound,
  PartyPopper,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  SUCCESS_EVENT,
  SUCCESS_STORAGE_KEY,
  type SuccessPayload,
  type SuccessVariant,
} from "@/lib/success-event";

const titles: Record<SuccessVariant, string> = {
  celebrate: "Yeay, berhasil!",
  star: "Bintang baru terdaftar!",
  camera: "Fotonya sudah siap!",
  copy: "Berhasil disalin!",
  upload: "Upload berhasil!",
  admin: "Data admin diperbarui!",
  delete: "Data berhasil dihapus!",
  login: "Selamat datang kembali!",
  share: "Siap dibagikan!",
};

function PopupIcon({ variant }: { variant: SuccessVariant }) {
  if (variant === "camera") return <Camera />;
  if (variant === "copy") return <Copy />;
  if (variant === "upload") return <Upload />;
  if (variant === "admin") return <ShieldCheck />;
  if (variant === "delete") return <Trash2 />;
  if (variant === "login") return <KeyRound />;
  if (variant === "share") return <Share2 />;
  if (variant === "star") return <Star />;
  return <Check />;
}

export function SuccessPopup() {
  const [payload, setPayload] = useState<SuccessPayload | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (event: Event) => {
      clearTimeout(timer);
      const detail = (event as CustomEvent<SuccessPayload>).detail;
      setPayload(detail);
      timer = setTimeout(() => setPayload(null), 4600);
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
      ) as SuccessPayload | null;
      if (pending?.message && Date.now() - pending.createdAt < 15000) {
        sessionStorage.removeItem(SUCCESS_STORAGE_KEY);
        queueMicrotask(() =>
          window.dispatchEvent(
            new CustomEvent(SUCCESS_EVENT, { detail: pending }),
          ),
        );
      }
    } catch {
      // Storage can be disabled; live events continue to work.
    }
  }, [pathname]);

  if (!payload) return null;

  return (
    <div
      className={`success-popup-layer success-${payload.variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="success-popup-card">
        <button
          type="button"
          className="success-popup-close"
          aria-label="Tutup pemberitahuan"
          onClick={() => {
            sessionStorage.removeItem(SUCCESS_STORAGE_KEY);
            setPayload(null);
          }}
        >
          <X />
        </button>
        <div className="success-popup-art" aria-hidden="true">
          <span className="success-orb">
            <PopupIcon variant={payload.variant} />
          </span>
          <PartyPopper className="success-party" />
          <Sparkles className="success-sparkle one" />
          <Sparkles className="success-sparkle two" />
        </div>
        <span className="eyebrow">IDOLA CONTEST</span>
        <h2>{payload.title || titles[payload.variant]}</h2>
        <p>{payload.message}</p>
      </div>
    </div>
  );
}
