import { MobileCta } from "@/components/mobile-cta";
import type { Metadata, Viewport } from "next";
import {BrandNavbar} from "@/components/brand-navbar";
import {BrandFooter} from "@/components/brand-footer";

import { Pwa } from "@/components/pwa";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Idola Contest — Saatnya Si Kecil Bersinar!",
    template: "%s | Idola Contest",
  },
  description:
    "Kompetisi fotogenik dan mewarnai anak Indonesia. Tema Cita Citaku. Registrasi Rp20.000; klaim penghargaan Rp120.000 termasuk ongkir.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  openGraph: { images: ["/logo.png"], locale: "id_ID", type: "website" },
};
export const viewport: Viewport = {
  themeColor: "#1299e4",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#main">
          Lewati ke konten
        </a>
        <BrandNavbar/>
        <main id="main">{children}</main>
        <BrandFooter/>
        <MobileCta />
        <Pwa />
      </body>
    </html>
  );
}
