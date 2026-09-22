import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Admin Idola Contest",
    short_name: "Idola Admin",
    description: "Kelola pendaftaran dan karya Idola Contest dari ponsel.",
    start_url: "/admin/dashboard",
    id: "/admin/dashboard",
    scope: "/admin/",
    display: "standalone",
    orientation: "any",
    background_color: "#f3f7fc",
    theme_color: "#2753a2",
    lang: "id",
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
  });
}
