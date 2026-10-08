import { NextResponse } from "next/server";
import { getActiveSeason } from "@/lib/data";
import { themeFor } from "@/lib/season";

// Public-site manifest. Served by a route handler (not the manifest.ts file
// convention) so that only public pages link to it; admin pages link to
// /admin/manifest.webmanifest and install as a separate app.
export async function GET() {
  const season = await getActiveSeason();
  const theme = themeFor(season?.theme_key);
  return NextResponse.json(
    {
      name: "Idola Contest",
      short_name: "Idola",
      description: season?.tagline || "Saatnya Si Kecil Menjadi Idola!",
      start_url: "/",
      display: "standalone",
      id: "/",
      scope: "/",
      orientation: "portrait-primary",
      categories: ["education", "kids", "entertainment"],
      background_color: theme.soft,
      theme_color: theme.primary,
      lang: "id",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
