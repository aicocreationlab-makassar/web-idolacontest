import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/site-chrome";

import { Pwa } from "@/components/pwa";
import { SuccessPopup } from "@/components/success-popup";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id",
  ),
  title: {
    default: "Idola Contest — Saatnya Si Kecil Bersinar!",
    template: "%s | Idola Contest",
  },
  description:
    "Kompetisi fotogenik dan mewarnai anak Indonesia. Tema Cita Citaku. Registrasi Rp20.000; klaim penghargaan Rp120.000 termasuk ongkir.",
  manifest: "/manifest.webmanifest",
  applicationName: "Idola Contest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Idola" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    siteName: "Idola Contest",
    url: "https://idolacontest.my.id",
    images: ["/logo.png"],
    locale: "id_ID",
    type: "website",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Idola Contest",
              url: "https://idolacontest.my.id",
              logo: "https://idolacontest.my.id/logo.png",
              sameAs: ["https://instagram.com/idola.contest"],
            }).replaceAll("<", "\\u003c"),
          }}
        />
        <a className="skip" href="#main">
          Lewati ke konten
        </a>
        <SiteChrome>{children}</SiteChrome>
        <SuccessPopup />
        <Pwa />
      </body>
    </html>
  );
}
