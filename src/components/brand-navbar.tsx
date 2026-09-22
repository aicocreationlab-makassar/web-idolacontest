"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
const links = [
  ["/", "Beranda"],
  ["/#lomba", "Lomba"],
  ["/galeri", "Galeri"],
  ["/timeline", "Timeline"],
  ["/#hadiah", "Hadiah"],
  ["/faq", "FAQ"],
];
export function BrandNavbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
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
            Idola Contest<small>SAATNYA SI KECIL BERSINAR!</small>
          </span>
        </Link>
        <div className="desktop-nav">
          {links.map(([url, label]) => (
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
      {open && (
        <div className="mobile-menu wrap" id="mobile-menu">
          <div className="mobile-menu-panel">
            {[...links, ["/cek-status", "Cek status"]].map(([url, label]) => (
              <Link
                key={url}
                href={url}
                onClick={(event) => followSection(event, url)}
              >
                {label}
                <ArrowRight size={18} />
              </Link>
            ))}
            <Link className="btn" href="/daftar" onClick={() => setOpen(false)}>
              Yuk, daftar sekarang!
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
