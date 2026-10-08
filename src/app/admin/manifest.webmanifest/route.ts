import { NextResponse } from "next/server";

// Dedicated manifest for the admin PWA: installing from any /admin page
// opens the dashboard, never the public site.
export function GET() {
  return NextResponse.json(
    {
      name: "Idola Admin",
      short_name: "Idola Admin",
      description:
        "Kelola pendaftaran, penilaian, juara, klaim hadiah, dan pengiriman Idola Contest dari HP.",
      start_url: "/admin/dashboard?source=pwa",
      id: "/admin/",
      scope: "/admin/",
      display: "standalone",
      display_override: ["standalone", "minimal-ui"],
      orientation: "portrait",
      background_color: "#f3f7fc",
      theme_color: "#153a77",
      lang: "id",
      categories: ["business", "productivity"],
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      shortcuts: [
        { name: "Pendaftaran masuk", url: "/admin/pendaftaran?source=pwa" },
        { name: "Penilaian", url: "/admin/penilaian?source=pwa" },
        { name: "Hasil & juara", url: "/admin/hasil?source=pwa" },
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
