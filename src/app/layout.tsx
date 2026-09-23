import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/site-chrome";

import { Pwa } from "@/components/pwa";
import { SuccessPopup } from "@/components/success-popup";
import { BackgroundAudio } from "@/components/background-audio";
import { NavigationEffects } from "@/components/navigation-effects";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "aos/dist/aos.css";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id",
  ),
  title: {
    default: "Idola Contest — Saatnya Si Kecil Menjadi Idola!",
    template: "%s | Idola Contest",
  },
  description:
    "Lomba online anak Indonesia untuk fotogenik dan mewarnai. Ikuti Idola Contest bertema Cita Citaku, tampilkan kreativitas dan kepercayaan diri si kecil.",
  keywords: [
    "lomba online anak Indonesia",
    "lomba anak Indonesia",
    "lomba fotogenik anak",
    "lomba mewarnai online",
    "lomba mewarnai anak",
    "kompetisi anak 2026",
    "Idola Contest",
    "lomba PAUD TK SD",
  ],
  alternates: { canonical: "https://idolacontest.my.id" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  applicationName: "Idola Contest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Idola" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "Idola Contest — Lomba Online Anak Indonesia",
    description:
      "Lomba fotogenik dan mewarnai online untuk anak Indonesia dari PAUD, TK, hingga SD.",
    siteName: "Idola Contest",
    url: "https://idolacontest.my.id",
    images: ["/logo.png"],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Idola Contest — Lomba Online Anak Indonesia",
    description: "Lomba fotogenik dan mewarnai online untuk anak Indonesia.",
    images: ["/logo.png"],
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
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://idolacontest.my.id/#organization",
                  name: "Idola Contest",
                  url: "https://idolacontest.my.id",
                  logo: "https://idolacontest.my.id/logo.png",
                  sameAs: ["https://instagram.com/idola.contest"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://idolacontest.my.id/#website",
                  name: "Idola Contest",
                  url: "https://idolacontest.my.id",
                  inLanguage: "id-ID",
                  publisher: {
                    "@id": "https://idolacontest.my.id/#organization",
                  },
                },
                ...["fotogenik", "mewarnai"].map((competition) => ({
                  "@type": "Event",
                  name: `Lomba ${competition === "fotogenik" ? "Fotogenik" : "Mewarnai"} Online Anak Indonesia`,
                  description: `Lomba ${competition} anak Indonesia bertema Cita Citaku oleh Idola Contest.`,
                  eventAttendanceMode:
                    "https://schema.org/OnlineEventAttendanceMode",
                  eventStatus: "https://schema.org/EventScheduled",
                  startDate: "2026-09-21T00:00:00+07:00",
                  endDate: "2026-10-06T23:59:59+07:00",
                  url: `https://idolacontest.my.id/lomba/${competition}`,
                  image: "https://idolacontest.my.id/logo.png",
                  organizer: {
                    "@id": "https://idolacontest.my.id/#organization",
                  },
                  offers: {
                    "@type": "Offer",
                    price: "20000",
                    priceCurrency: "IDR",
                    availability: "https://schema.org/InStock",
                    url: "https://idolacontest.my.id/daftar",
                  },
                })),
              ],
            }).replaceAll("<", "\\u003c"),
          }}
        />
        <a className="skip" href="#main">
          Lewati ke konten
        </a>
        <SiteChrome>{children}</SiteChrome>
        <SuccessPopup />
        <BackgroundAudio />
        <NavigationEffects />
        <Pwa />
      </body>
    </html>
  );
}
