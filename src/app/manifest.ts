import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Idola Contest",
    short_name: "Idola",
    description: "Saatnya Si Kecil Menjadi Idola!",
    start_url: "/",
    display: "standalone",
    id: "/",
    scope: "/",
    orientation: "portrait-primary",
    categories: ["education", "kids", "entertainment"],
    background_color: "#f2fbff",
    theme_color: "#139ae4",
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
  };
}
