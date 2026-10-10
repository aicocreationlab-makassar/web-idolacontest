import { notFound } from "next/navigation";
import Image from "next/image";
import { cache } from "react";
import { configured, service } from "@/lib/supabase/server";
import { publicImage } from "@/lib/data";
import { categoryLabel } from "@/lib/business-rules";
import { Share } from "@/components/share";
export const dynamic = "force-dynamic";
const get = cache(async (slug: string) => {
  if (!configured() || !/^[a-f0-9]{24}$/.test(slug)) return null;
  // A finalist page keeps working after its season ends, so shared links and
  // Cek Status cards of earlier seasons still open.
  const { data, error } = await service()
    .from("public_gallery")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("Galeri tidak dapat dimuat.");
  if (!data) return null;
  const { data: season } = await service()
    .from("seasons")
    .select("name,theme_title")
    .eq("id", data.season_id)
    .maybeSingle();
  return { ...data, season };
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const d = await get((await params).slug);
  return d
    ? {
        title: `${d.public_name} — Finalis`,
        openGraph: {
          title: `Karya ${d.public_name} — Idola Contest`,
          images: [publicImage(d.public_file_path)],
        },
      }
    : { title: "Finalis tidak ditemukan" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await get(slug);
  if (!d) notFound();
  const url = `https://idolacontest.my.id/finalis/${slug}`;
  return (
    <div className="wrap section grid2 items-center">
      <Image
        src={publicImage(d.public_file_path)}
        width={720}
        height={720}
        sizes="(max-width:760px) 90vw, 45vw"
        className="rounded-3xl w-full h-auto"
        alt={`Karya ${d.public_name}`}
        priority
      />
      <div className="stack">
        <span className="pill">
          ✦ FINALIS IDOLA CONTEST{d.season?.name ? ` · ${d.season.name.toUpperCase()}` : ""}
        </span>
        <h1 className="text-5xl">{d.public_name}</h1>
        <p>
          {d.competition_type === "coloring" ? "Mewarnai" : "Fotogenik"} ·{" "}
          {categoryLabel(d.category)}
        </p>
        <p className="muted">
          {d.regency_name}, {d.province_name}
        </p>
        <p>Tema: {d.season?.theme_title || "Cita Citaku"}</p>
        <Share url={url} name={d.public_name} />
      </div>
    </div>
  );
}
