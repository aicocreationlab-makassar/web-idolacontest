import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/admin/", "/api/", "/cek-status", "/daftar/sukses"];
  return {
    rules: [
      {
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "Bingbot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
        ],
        allow: "/",
        disallow: privatePaths,
      },
      { userAgent: "*", allow: "/", disallow: privatePaths },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id"}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id",
  };
}
