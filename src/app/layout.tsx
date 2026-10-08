import type { Metadata } from "next";
import { getActiveSeason } from "@/lib/data";
import { themeFor } from "@/lib/season";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "aos/dist/aos.css";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id",
  ),
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const season = await getActiveSeason();
  const theme = themeFor(season?.theme_key);
  return (
    <html
      lang="id"
      data-season-theme={theme.key}
      data-season={season?.slug || ""}
    >
      <body>{children}</body>
    </html>
  );
}
