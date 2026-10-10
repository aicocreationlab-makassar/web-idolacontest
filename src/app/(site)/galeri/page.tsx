import { galleryPage, publicImage, type GalleryFilters } from "@/lib/data";
import Link from "next/link";
import { competitions } from "@/lib/business-rules";
import { resolveContent } from "@/lib/contest-modes";
import { PageHeading } from "@/components/shared";
import { GalleryGrid } from "@/components/gallery-grid";
export const dynamic = "force-dynamic";
export const metadata = { title: "Galeri finalis" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GalleryFilters>;
}) {
  const filters = await searchParams;
  const { items, count, page, season } = await galleryPage(filters);
  const content = resolveContent(season);
  const q = new URLSearchParams(
    Object.entries(filters).filter(
      ([k, v]) => k !== "page" && k !== "season" && !!v,
    ),
  );
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "page" && key !== "highlight" && key !== "season" && Boolean(value),
  ).length;
  return (
    <div className="wrap section">
      <PageHeading
        eyebrow={season ? `Panggung ${season.name} · Tema ${season.theme_title}` : "Panggung bintang kecil"}
        title="Mimpi mereka, inspirasi kita."
        description={
          season
            ? "Jelajahi karya finalis season aktif yang sudah disetujui dan dipublikasikan. Pemenang season sebelumnya tetap tampil di halaman Hasil."
            : "Galeri season berikutnya sedang disiapkan."
        }
      />
      <nav className="gallery-competition-tabs" aria-label="Pilih jenis lomba">
        <Link
          className={filters.competition === "photogenic" ? "active" : ""}
          href="/galeri?competition=photogenic"
        >
          Lomba Fotogenik
        </Link>
        <Link
          className={filters.competition === "coloring" ? "active" : ""}
          href="/galeri?competition=coloring"
        >
          Lomba Mewarnai
        </Link>
      </nav>
      <details className="gallery-filter" open={activeFilterCount > 0}>
        <summary>
          <span>Filter galeri</span>
          <small>
            {activeFilterCount
              ? `${activeFilterCount} filter aktif`
              : "Buka jika ingin mencari peserta tertentu"}
          </small>
        </summary>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {content.categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
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
          <button className="btn self-end">Terapkan filter</button>
        </form>
      </details>
      {items.length ? (
        <GalleryGrid
          themeTitle={season?.theme_title || "Cita Citaku"}
          highlighted={filters.highlight}
          items={items.map((item) => ({
            ...item,
            imageUrl: publicImage(item.public_file_path),
          }))}
        />
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
