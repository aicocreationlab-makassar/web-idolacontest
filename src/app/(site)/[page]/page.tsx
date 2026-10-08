import { notFound } from "next/navigation";
import { Faq, Fees, PageHeading } from "@/components/shared";
import { getActiveSeason } from "@/lib/data";
import { formatDate, seasonTimeline } from "@/lib/season";
export const dynamic = "force-dynamic";
const titles: Record<string, string> = {
  timeline: "Catat setiap momennya.",
  faq: "Pertanyaan yang sering ditanyakan.",
  "syarat-ketentuan": "Syarat & ketentuan.",
  "kebijakan-privasi": "Privasi keluarga adalah prioritas.",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  return { title: titles[(await params).page] || "Halaman tidak ditemukan" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!titles[page]) notFound();
  const season = await getActiveSeason();
  const themeTitle = season?.theme_title || "Cita Citaku";
  return (
    <div className="wrap section max-w-4xl">
      <PageHeading
        title={titles[page]}
        eyebrow={`Idola Contest · ${season?.name || "Season baru"}${season ? ` · Tema ${season.theme_title}` : ""}`}
      />
      {page === "faq" ? (
        <Faq season={season} />
      ) : page === "timeline" ? (
        <div className="stack">
          {seasonTimeline(season).map((stop, i) => (
            <article className="card" key={stop.key}>
              <span className="number">{i + 1}</span>
              <p className="eyebrow">{stop.date}</p>
              <h3 className="my-3">{stop.label}</h3>
              <p className="muted">{stop.detail}</p>
            </article>
          ))}
          <p className="muted">Seluruh waktu menggunakan WIB (Asia/Jakarta).</p>
        </div>
      ) : page === "syarat-ketentuan" ? (
        <div className="card stack">
          <h2 className="text-2xl">Keikutsertaan & karya</h2>
          <p>
            Orang tua/wali mendaftarkan anak dengan identitas yang benar dan
            persetujuan publikasi. Preschool hanya mengikuti fotogenik. Tema
            kedua lomba pada {season?.name || "season ini"} adalah {themeTitle}.
            Karya harus milik peserta dan tidak melanggar hak pihak lain.
          </p>
          <p>
            Pendaftaran menjadi resmi setelah pembayaran diverifikasi. Kode
            registrasi bersifat rahasia. Peserta bertanggung jawab menyimpan
            kode dan mengirim karya sebelum tenggat pribadi.
          </p>
          <Fees />
          <h3>Review dan penilaian</h3>
          <p>
            Admin dapat meminta revisi atau menolak karya yang tidak sesuai.
            Publikasi dilakukan setelah review. Penilaian mengikuti kriteria
            yang tercantum pada halaman lomba. Peringkat dihitung otomatis
            dengan membandingkan peserta pada jenis lomba dan kategori usia
            yang sama; Best Social Media terpisah dari skor juri utama.
          </p>
          <h3>Sportivitas</h3>
          <p>
            Kecurangan, manipulasi karya, identitas, engagement, atau tindakan
            tidak sportif dapat menyebabkan diskualifikasi, pembatalan
            penghargaan, atau pembatasan kompetisi berikutnya.
          </p>
          <h3>Pembayaran & pengiriman</h3>
          <p>
            Simpan bukti transfer dan hubungi admin untuk verifikasi, koreksi
            pembayaran, atau permintaan pengembalian dana. Keputusan
            pengembalian dikonfirmasi penyelenggara sesuai kondisi transaksi.
            Klaim penghargaan dilakukan setelah hasil dipublikasikan. Pengiriman
            mulai {season ? formatDate(season.shipping_at) : "tanggal yang diumumkan"}{" "}
            dengan kurir pilihan admin.
          </p>
          <p>
            Hubungi @idola.contest untuk pertanyaan atau keberatan sebelum
            melakukan pembayaran.
          </p>
        </div>
      ) : (
        <div className="card stack">
          <h2 className="text-2xl">Data yang kami gunakan</h2>
          <p>
            Idola Contest mengumpulkan nama dan usia anak, sekolah, cita-cita,
            foto/karya, data orang tua, WhatsApp, Instagram, alamat, serta
            catatan transaksi untuk administrasi kompetisi, review, komunikasi,
            dan pengiriman penghargaan.
          </p>
          <h3>Publikasi dengan persetujuan</h3>
          <p>
            Hanya nama publik, kategori, jenis lomba, kota/kabupaten, provinsi,
            dan karya yang disetujui ditampilkan ke publik. Alamat lengkap,
            WhatsApp, nama orang tua, catatan admin, dan rincian pembayaran
            tidak masuk galeri.
          </p>
          <h3>Penyimpanan & akses</h3>
          <p>
            Foto awal, karya pending, dan worksheet disimpan privat di Supabase.
            Akses file privat menggunakan tautan sementara. Akses admin dibatasi
            menurut peran dan perubahan dicatat. Data alamat dapat digunakan
            oleh kurir untuk pengiriman paket.
          </p>
          <h3>Hak orang tua/wali</h3>
          <p>
            Hubungi @idola.contest untuk meminta koreksi, penarikan publikasi,
            akses, atau penghapusan data. Admin memverifikasi permintaan untuk
            melindungi anak. Catatan transaksi yang masih diperlukan untuk
            penyelesaian kewajiban dapat dipertahankan sesuai kebutuhan.
          </p>
          <h3>Retensi dan perangkat</h3>
          <p>
            Data disimpan selama diperlukan untuk kompetisi dan penyelesaian
            klaim. Pengelola meninjau dan menghapus data yang tidak lagi
            diperlukan. Cookie digunakan untuk sesi admin; kode sukses disimpan
            sementara pada sesi browser peserta. Halaman privat dan API tidak
            disimpan dalam cache offline.
          </p>
          <p>
            Jangan membagikan kode registrasi kepada publik. Kode memberikan
            akses ke status, worksheet, dan pengiriman karya.
          </p>
        </div>
      )}
    </div>
  );
}
