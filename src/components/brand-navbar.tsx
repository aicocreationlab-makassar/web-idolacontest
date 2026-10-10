"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { ToyIcon } from "./toy-icon";
import { MascotAvatars, type Ambassador } from "./ambassadors";
const links: Array<[string, string, string]> = [
  ["/", "Beranda", "home"],
  ["/#lomba", "Lomba", "palette"],
  ["/galeri", "Galeri", "camera"],
  ["/timeline", "Timeline", "clock"],
  ["/#hadiah", "Hadiah", "trophy"],
  ["/faq", "FAQ", "sparkle"],
  ["/cek-status", "Cek status", "check"],
];
export function BrandNavbar({
  ambassadors = [],
}: {
  ambassadors?: Ambassador[];
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  // The drawer is portaled to <body> so the header's stacking context cannot trap it.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  function followSection(
    event: React.MouseEvent<HTMLAnchorElement>,
    url: string,
  ) {
    setOpen(false);
    if (url === "/#hadiah" && path === "/") {
      event.preventDefault();
      document.getElementById("hadiah")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.history.replaceState(null, "", "/#hadiah");
    }
  }
  return (
    <header className="brand-header">
      <nav className="wrap brand-nav" aria-label="Navigasi utama">
        <Link className="brand-lockup" href="/" onClick={() => setOpen(false)}>
          <Image
            src="/logo.webp"
            alt="Logo asli Idola Contest"
            width={66}
            height={66}
            priority
          />
          <span>
            Idola Contest<small>SAATNYA SI KECIL MENJADI IDOLA!</small>
          </span>
        </Link>
        <div className="desktop-nav">
          {links.slice(0, 6).map(([url, label]) => (
            <Link
              key={url}
              className={path === url ? "active" : ""}
              href={url}
              onClick={(event) => followSection(event, url)}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <a
            className="social-circle"
            href="https://instagram.com/idola.contest"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram Idola Contest"
          >
            <FaInstagram size={21} />
          </a>
          <Link className="btn nav-cta" href="/daftar">
            Daftar Sekarang <ArrowRight size={17} />
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {mounted &&
        createPortal(
          <div
            className={`mobile-drawer${open ? " open" : ""}`}
            aria-hidden={!open}
          >
            <button
              type="button"
              className="mobile-drawer-backdrop"
              aria-label="Tutup menu"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            />
            <nav
              className="mobile-drawer-panel"
              id="mobile-menu"
              aria-label="Menu"
            >
              <div className="mobile-drawer-head">
                <b>Menu</b>
                <button
                  type="button"
                  className="mobile-drawer-close"
                  aria-label="Tutup menu"
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              {links.map(([url, label, icon], i) => (
                <Link
                  key={url}
                  href={url}
                  className={`mobile-drawer-link${path === url ? " active" : ""}`}
                  style={{ "--i": i } as React.CSSProperties}
                  tabIndex={open ? 0 : -1}
                  onClick={(event) => followSection(event, url)}
                >
                  <ToyIcon name={icon} size={38} />
                  {label}
                  <ArrowRight size={18} />
                </Link>
              ))}
              <Link
                className="btn"
                href="/daftar"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                Yuk, daftar sekarang!
              </Link>
              {ambassadors.length > 0 && (
                <div className="mobile-drawer-mascots">
                  <MascotAvatars
                    ambassadors={ambassadors}
                    size={40}
                    mood="wave"
                  />
                  <span>
                    {ambassadors.map((item) => item.name).join(" & ")} menunggu
                    kamu di panggung!
                  </span>
                </div>
              )}
            </nav>
          </div>,
          document.body,
        )}
    </header>
  );
}
