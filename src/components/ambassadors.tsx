"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { ToyIcon } from "./toy-icon";

export type Ambassador = {
  name: string;
  award: string;
  tagline: string;
  image: string;
  avatar: string;
};

function joinNames(items: Ambassador[]) {
  const names = items.map((item) => item.name);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/** Bouncing head avatars: the mascot form used in popups, loaders and strips. */
export function MascotAvatars({
  ambassadors,
  size = 64,
  mood = "bounce",
  className = "",
}: {
  ambassadors: Ambassador[];
  size?: number;
  mood?: "bounce" | "cheer" | "wave" | "still";
  className?: string;
}) {
  if (!ambassadors.length) return null;
  return (
    <span
      className={`mascot-avatars mood-${mood} ${className}`.trim()}
      style={{ "--mascot-size": `${size}px` } as React.CSSProperties}
      aria-label={`Maskot ${joinNames(ambassadors)}`}
      role="img"
    >
      {ambassadors.map((item, i) => (
        <span className="mascot-avatar" key={item.name} style={{ "--i": i } as React.CSSProperties}>
          <Image src={item.avatar} alt="" width={size * 2} height={size * 2} unoptimized />
        </span>
      ))}
    </span>
  );
}

/** Thin promo bar under the navbar on every page of the season. */
export function AmbassadorStrip({ ambassadors }: { ambassadors: Ambassador[] }) {
  const path = usePathname();
  if (!ambassadors.length || path.startsWith("/admin")) return null;
  return (
    <Link className="ambassador-strip" href="/#ambassador" aria-label="Kenalan dengan brand ambassador">
      <MascotAvatars ambassadors={ambassadors} size={36} mood="wave" />
      <span className="ambassador-strip-text">
        <b>{joinNames(ambassadors)}</b>
        <small>Brand Ambassador · juara Season 1, sekarang wajah season ini</small>
      </span>
      <span className="ambassador-strip-cta">
        Kenalan <ArrowRight size={14} />
      </span>
    </Link>
  );
}

/** Full-size spotlight section with the ambassadors' photos, awards and taglines. */
export function AmbassadorSpotlight({
  ambassadors,
  seasonName,
  registrationOpen,
}: {
  ambassadors: Ambassador[];
  seasonName: string;
  registrationOpen: boolean;
}) {
  if (!ambassadors.length) return null;
  return (
    <section className="section wrap ambassador-section" id="ambassador">
      <div className="national-section-head">
        <span className="candy-banner" data-tone="yellow">
          <ToyIcon name="crown" size={34} /> Brand Ambassador
        </span>
        <p>
          {joinNames(ambassadors)} adalah juara Season 1 yang kini menjadi wajah {seasonName}.
          Mereka bukti nyata: ikut, berkarya, dan menang!
        </p>
      </div>
      <div className="ambassador-grid">
        {ambassadors.map((item, i) => (
          <article className="ambassador-card" key={item.name} style={{ "--i": i } as React.CSSProperties}>
            <span className="ambassador-bubble">{item.tagline}</span>
            <div className="ambassador-photo">
              <Image
                src={item.image}
                alt={`${item.name}, brand ambassador Idola Contest`}
                width={450}
                height={600}
                sizes="(max-width:760px) 70vw, 320px"
                unoptimized
              />
            </div>
            <div className="ambassador-meta">
              <h3>{item.name}</h3>
              <span className="candy-pill" data-tone="pink">
                <ToyIcon name="trophy" size={24} /> {item.award}
              </span>
            </div>
          </article>
        ))}
      </div>
      {registrationOpen && (
        <div className="actions justify-center">
          <Link className="btn" href="/daftar">
            Ikuti jejak {joinNames(ambassadors)} <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}

/** Small mascot peeking from the corner with a tap-to-open speech bubble. */
export function AmbassadorPeek({ ambassadors }: { ambassadors: Ambassador[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const storedHidden = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem("idola:peek-hidden") === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const hidden = dismissed || storedHidden;
  useEffect(() => {
    if (ambassadors.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ambassadors.length), 6000);
    return () => clearInterval(timer);
  }, [ambassadors.length]);
  if (!ambassadors.length || hidden || path.startsWith("/admin") || path.startsWith("/daftar"))
    return null;
  const mascot = ambassadors[index % ambassadors.length];
  return (
    <div className={`ambassador-peek${open ? " open" : ""}`}>
      {open && (
        <div className="ambassador-peek-bubble" role="dialog" aria-label={`Pesan dari ${mascot.name}`}>
          <button
            type="button"
            className="ambassador-peek-close"
            aria-label="Tutup"
            onClick={() => {
              setOpen(false);
              setDismissed(true);
              try {
                sessionStorage.setItem("idola:peek-hidden", "1");
              } catch {
                /* ignore */
              }
            }}
          >
            <X size={14} />
          </button>
          <b>Halo, aku {mascot.name}!</b>
          <p>{mascot.tagline}</p>
          <Link className="btn" href="/daftar" onClick={() => setOpen(false)}>
            Yuk, ikut daftar <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <button
        type="button"
        className="ambassador-peek-button"
        aria-label={open ? "Tutup pesan maskot" : `Sapa ${mascot.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="mascot-avatars mood-wave" style={{ "--mascot-size": "64px" } as React.CSSProperties}>
          <span className="mascot-avatar" key={mascot.name}>
            <Image src={mascot.avatar} alt="" width={128} height={128} unoptimized />
          </span>
        </span>
        <span className="ambassador-peek-hint">Hai!</span>
      </button>
    </div>
  );
}
