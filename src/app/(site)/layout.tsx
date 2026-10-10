import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/site-chrome";
import { Pwa } from "@/components/pwa";
import { SuccessPopup } from "@/components/success-popup";
import { BackgroundAudio } from "@/components/background-audio";
import { NavigationEffects } from "@/components/navigation-effects";
import { getActiveSeason } from "@/lib/data";
import { themeFor } from "@/lib/season";
import { categoryAgeText, resolveContent } from "@/lib/contest-modes";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getActiveSeason();
  const content = resolveContent(season);
  const theme = season?.theme_title || "Cita Citaku";
  const description =
    content.mode === "national"
      ? `${content.hero_title}: lomba fotogenik dan mewarnai online untuk anak Indonesia kategori ${content.categories.map((c) => `${c.label} ${categoryAgeText(c)}`).join(" dan ")}. Ikuti Idola Contest ${season?.name || ""} bertema ${theme}, hadiah uang tunai, piala, dan sertifikat.`
      : `Lomba online anak Indonesia untuk fotogenik dan mewarnai. Ikuti Idola Contest ${season?.name || ""} bertema ${theme}, tampilkan kreativitas dan kepercayaan diri si kecil.`;
  return {
    title: {
      default: "Idola Contest — Saatnya Si Kecil Menjadi Idola!",
      template: "%s | Idola Contest",
    },
    description,
    keywords: [
      "lomba online anak Indonesia",
      "lomba anak Indonesia",
      "lomba fotogenik anak",
      "lomba mewarnai online",
      "lomba mewarnai anak",
      `kompetisi anak ${new Date().getFullYear()}`,
      "Idola Contest",
      "lomba PAUD TK SD",
      "lomba anak nasional online",
      "lomba bayi dan anak",
    ],
    alternates: { canonical: site },
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
    openGraph: {
      title: "Idola Contest — Lomba Online Anak Indonesia",
      description:
        "Lomba fotogenik dan mewarnai online untuk anak Indonesia dari PAUD, TK, hingga SD.",
      siteName: "Idola Contest",
      url: site,
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
}

export async function generateViewport(): Promise<Viewport> {
  const season = await getActiveSeason();
  return {
    themeColor: themeFor(season?.theme_key).primary,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const season = await getActiveSeason();
  const content = resolveContent(season);
  const theme = season?.theme_title || "Cita Citaku";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${site}/#organization`,
                name: "Idola Contest",
                url: site,
                logo: `${site}/logo.png`,
                sameAs: ["https://instagram.com/idola.contest"],
              },
              {
                "@type": "WebSite",
                "@id": `${site}/#website`,
                name: "Idola Contest",
                url: site,
                inLanguage: "id-ID",
                publisher: { "@id": `${site}/#organization` },
              },
              ...["fotogenik", "mewarnai"].map((competition) => ({
                "@type": "Event",
                name: `Lomba ${competition === "fotogenik" ? "Fotogenik" : "Mewarnai"} Online Anak Indonesia`,
                description: `Lomba ${competition} anak Indonesia bertema ${theme} oleh Idola Contest.`,
                eventAttendanceMode:
                  "https://schema.org/OnlineEventAttendanceMode",
                eventStatus: "https://schema.org/EventScheduled",
                startDate: season?.registration_open_at || "2026-09-21T00:00:00+07:00",
                endDate: season?.registration_close_at || "2026-10-06T23:59:59+07:00",
                url: `${site}/lomba/${competition}`,
                image: `${site}/logo.png`,
                organizer: { "@id": `${site}/#organization` },
                offers: {
                  "@type": "Offer",
                  price: String(content.registration_fee),
                  priceCurrency: "IDR",
                  availability: "https://schema.org/InStock",
                  url: `${site}/daftar`,
                },
              })),
            ],
          }).replaceAll("<", "\\u003c"),
        }}
      />
      <a className="skip" href="#main">
        Lewati ke konten
      </a>
      <SiteChrome ambassadors={content.ambassadors}>{children}</SiteChrome>
      <SuccessPopup mascots={content.ambassadors} />
      <BackgroundAudio />
      <NavigationEffects />
      <Pwa />
    </>
  );
}
