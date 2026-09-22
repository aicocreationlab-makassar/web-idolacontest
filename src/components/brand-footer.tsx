import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { WaveDivider, StarDecoration, CloudDecoration } from "./decorations";
export function BrandFooter() {
  return (
    <footer className="brand-footer">
      <WaveDivider flip />
      <StarDecoration className="footer-star" />
      <CloudDecoration className="footer-cloud" />
      <div className="wrap footer-grid">
        <div>
          <Link className="brand-lockup" href="/">
            <Image
              src="/logo.webp"
              width={70}
              height={70}
              alt="Idola Contest"
            />
            <span>
              Idola Contest<small>SAATNYA SI KECIL MENJADI IDOLA!</small>
            </span>
          </Link>
          <p>
            Wadah kreativitas anak Indonesia untuk berkarya, berani tampil, dan
            bersinar.
          </p>
        </div>
        <div>
          <h3>Jelajahi</h3>
          <Link href="/lomba/fotogenik">Lomba Fotogenik</Link>
          <Link href="/lomba/mewarnai">Lomba Mewarnai</Link>
          <Link href="/galeri">Galeri Finalis</Link>
          <Link href="/timeline">Timeline</Link>
          <Link href="/hasil">Hasil & Penghargaan</Link>
        </div>
        <div>
          <h3>Informasi</h3>
          <Link href="/faq">Pertanyaan Umum</Link>
          <Link href="/cek-status">Cek Status</Link>
          <Link href="/syarat-ketentuan">Syarat & Ketentuan</Link>
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/admin/login">Login Admin</Link>
        </div>
        <div>
          <h3>Tetap Terhubung</h3>
          <a
            href="https://instagram.com/idola.contest"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram size={22} /> @idola.contest
          </a>
          {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            >
              <FaWhatsapp size={22} /> WhatsApp Admin
            </a>
          )}
          <span className="footer-note">
            ★ Dari Indonesia,
            <br />
            untuk mimpi anak Indonesia.
          </span>
        </div>
      </div>
      <div className="wrap footer-bottom">
        © 2026 Idola Contest. Setiap anak punya sinarnya sendiri.{" "}
        <span>Dengan warna, karya, dan keberanian. ✦</span>
      </div>
    </footer>
  );
}
