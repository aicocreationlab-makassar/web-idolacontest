import type { MetadataRoute } from "next";
import { configured, service } from "@/lib/supabase/server";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id";
  const pages: Array<
    [string, MetadataRoute.Sitemap[number]["changeFrequency"], number]
  > = [
    ["", "daily", 1],
    ["/daftar", "weekly", 0.9],
    ["/lomba/fotogenik", "weekly", 0.95],
    ["/lomba/mewarnai", "weekly", 0.95],
    ["/galeri", "daily", 0.9],
    ["/hasil", "daily", 0.85],
    ["/timeline", "weekly", 0.7],
    ["/faq", "monthly", 0.7],
    ["/syarat-ketentuan", "yearly", 0.3],
    ["/kebijakan-privasi", "yearly", 0.3],
  ];
  const links: MetadataRoute.Sitemap = pages.map(
    ([path, frequency, priority]) => ({
      url: base + path,
      lastModified: "2026-09-23",
      changeFrequency: frequency,
      priority,
    }),
  );
  if (configured()) {
    for (let offset = 0; offset < 49000; offset += 1000) {
      const { data, error } = await service()
        .from("public_gallery")
        .select("slug,created_at")
        .order("slug")
        .abortSignal(AbortSignal.timeout(5000))
        .range(offset, offset + 999);
      if (error) break;
      links.push(
        ...data.map((w) => ({
          url: `${base}/finalis/${w.slug}`,
          lastModified: w.created_at,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
      );
      if (data.length < 1000) break;
    }
  }
  return links;
}
