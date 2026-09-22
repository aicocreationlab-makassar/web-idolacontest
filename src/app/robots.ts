import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/cek-status", "/daftar/sukses"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id"}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id",
  };
}
