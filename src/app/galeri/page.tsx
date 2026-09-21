import { galleryPage, publicImage, type GalleryFilters } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { categories, competitions } from "@/lib/business-rules";
import { PageHeading } from "@/components/shared";
export const dynamic = "force-dynamic";
export const metadata = { title: "Galeri finalis" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GalleryFilters>;
}) {
  const filters = await searchParams;
  const { items, count, page, seasons } = await galleryPage(filters);
  const q = new URLSearchParams(
    Object.entries(filters).filter(([k, v]) => k !== "page" && !!v),
  );
  return (
    <div className="wrap section">
      <PageHeading
        eyebrow="Panggung bintang kecil"
        title="Mimpi mereka, inspirasi kita."
        description="Jelajahi karya finalis yang sudah disetujui dan dipublikasikan."
      />
      <form className="card grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <label className="field">
          Cari nama
          <input name="q" defaultValue={filters.q} maxLength={120} />
        </label>
        <label className="field">
          Lomba
          <select name="competition" defaultValue={filters.competition}>
            <option value="">Semua lomba</option>
            {Object.entries(competitions).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Kategori
          <select name="category" defaultValue={filters.category}>
            <option value="">Semua kategori</option>
            {Object.entries(categories).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Provinsi
          <input
            name="province"
            defaultValue={filters.province}
            maxLength={120}
          />
        </label>
        <label className="field">
          Season
          <select name="season" defaultValue={filters.season}>
            <option value="">Semua season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn self-end">Cari finalis</button>
      </form>
      {items.length ? (
        <div className="grid3">
          {items.map((i) => (
            <Link className="card" href={`/finalis/${i.slug}`} key={i.slug}>
              <Image
                src={publicImage(i.public_file_path)}
                width={360}
                height={360}
                sizes="(max-width:760px) 90vw, 30vw"
                alt={`Karya ${i.public_name}`}
                className="rounded-xl aspect-square object-cover w-full"
              />
              <span className="eyebrow block mt-5">
                {competitions[i.competition_type as keyof typeof competitions]}{" "}
                · {categories[i.category as keyof typeof categories]}
              </span>
              <h3 className="mt-2">{i.public_name}</h3>
              <p className="muted text-sm">
                {i.regency_name}, {i.province_name}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="notice">
          Belum ada karya yang sesuai. Karya hanya muncul setelah disetujui dan
          dipublikasikan admin.
        </p>
      )}
      <div className="actions">
        {page > 1 && (
          <Link className="btn secondary" href={`?${q}&page=${page - 1}`}>
            Sebelumnya
          </Link>
        )}
        <span>
          {count} finalis · Halaman {page}
        </span>
        {page * 12 < count && (
          <Link className="btn secondary" href={`?${q}&page=${page + 1}`}>
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}
