import type { MetadataRoute } from "next";
import { configured, service } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://idolacontest.my.id";
  const links: MetadataRoute.Sitemap = [
    "",
    "/daftar",
    "/lomba/fotogenik",
    "/lomba/mewarnai",
    "/galeri",
    "/hasil",
    "/timeline",
    "/faq",
    "/syarat-ketentuan",
    "/kebijakan-privasi",
  ].map((p) => ({
    url: base + p,
    changeFrequency: "weekly",
    priority: p ? 0.7 : 1,
  }));
  if (configured()) {
    for (let offset = 0; offset < 49000; offset += 1000) {
      const { data, error } = await service()
        .from("public_gallery")
        .select("slug,created_at")
        .order("slug")
        .range(offset, offset + 999);
      if (error) throw new Error("Sitemap tidak dapat dimuat.");
      links.push(
        ...data.map((w) => ({
          url: `${base}/finalis/${w.slug}`,
          lastModified: w.created_at,
          priority: 0.6,
        })),
      );
      if (data.length < 1000) break;
    }
  }
  return links;
}
