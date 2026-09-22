import { notFound } from "next/navigation";
import Link from "next/link";
import { categories, criteria, weights } from "@/lib/business-rules";
import { Fees, PageHeading } from "@/components/shared";
import { ToyArt } from "@/components/decorations";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return { title: `Lomba ${(await params).slug}` };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!["fotogenik", "mewarnai"].includes(slug)) notFound();
  const coloring = slug === "mewarnai";
  return (
    <div className="wrap section">
      <PageHeading
        eyebrow="Tema: Cita Citaku"
        title={
          coloring
            ? "Warnakan mimpi si kecil."
            : "Biarkan percaya dirinya bersinar."
        }
        description={
          coloring
            ? "Worksheet personal berdasarkan foto anak dan profesi impiannya. Cetak A4, berkreasi, lalu kirim hasilnya."
            : "Kostum profesi, atribut cita-cita, properti sederhana, dan latar bertema boleh digunakan."
        }
      />
      <div className="grid2">
        <div className="card stack">
          <ToyArt
            kind={coloring ? "palette" : "camera"}
            className="art-icon-modern"
          />
          <h2 className="text-2xl">
            Lomba {coloring ? "Mewarnai" : "Fotogenik"}
          </h2>
          <p>
            Kategori:{" "}
            {Object.entries(categories)
              .filter(([key]) => !coloring || key !== "preschool")
              .map(([, v]) => v)
              .join(", ")}
            .
          </p>
          {coloring && (
            <p>
              Alat: crayon, pensil warna, spidol, oil pastel, watercolor, poster
              color, atau kombinasi. Boleh menambah objek pendukung tanpa
              mengubah komposisi utama secara berlebihan.
            </p>
          )}
          <p>
            Karya dikirim maksimal 7 hari setelah registrasi atau 6 Oktober 2026
            pukul 23.59 WIB, mana yang lebih awal. Gambar JPG, PNG, atau WebP
            maksimum 2 MB.
          </p>
          <p>
            Unggahan bersifat privat sampai disetujui dan dipublikasikan admin.
          </p>
          <Link className="btn" href="/daftar">
            Daftar Sekarang ↗
          </Link>
        </div>
        <div className="stack">
          <div className="card">
            <h3>Kriteria penilaian</h3>
            {criteria[coloring ? "coloring" : "photogenic"].map((v, i) => (
              <div
                className="flex justify-between gap-4 border-b border-purple/10 py-4"
                key={v}
              >
                <span>{v}</span>
                <b className="text-purple">{weights[i]}%</b>
              </div>
            ))}
            <p className="text-sm muted mt-5">
              Dinilai oleh juri manusia. Tidak ada penilaian kecantikan atau
              karakteristik wajah oleh AI.
            </p>
          </div>
          <Fees />
        </div>
      </div>
    </div>
  );
}
