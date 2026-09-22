import { notFound } from "next/navigation";
import { Faq, Fees, PageHeading } from "@/components/shared";
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
  return (
    <div className="wrap section max-w-4xl">
      <PageHeading title={titles[page]} eyebrow="Idola Contest · Season 1" />
      {page === "faq" ? (
        <Faq />
      ) : page === "timeline" ? (
        <div className="stack">
          {[
            [
              "21 September – 6 Oktober 2026",
              "Pendaftaran & pengumpulan karya",
              "Batas kirim individu: 7 hari setelah registrasi atau penutupan global, mana yang lebih awal.",
            ],
            [
              "7 Oktober 2026",
              "Penilaian juri",
              "Karya dinilai dengan lima kriteria berbobot.",
            ],
            [
              "8 Oktober 2026",
              "Pengumuman",
              "Hasil tersedia setelah admin mempublikasikan di website dan @idola.contest.",
            ],
            [
              "9–12 Oktober 2026",
              "Persiapan penghargaan",
              "Konfirmasi klaim, pembayaran, dan alamat melalui admin.",
            ],
            [
              "Mulai 13 Oktober 2026",
              "Pengiriman",
              "Nomor resi dapat dilihat melalui Cek Status.",
            ],
          ].map(([d, t, p], i) => (
            <article className="card" key={d}>
              <span className="number">{i + 1}</span>
              <p className="eyebrow">{d}</p>
              <h3 className="my-3">{t}</h3>
              <p className="muted">{p}</p>
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
            kedua lomba adalah Cita Citaku. Karya harus milik peserta dan tidak
            melanggar hak pihak lain.
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
            yang tercantum pada halaman lomba; Best Social Media terpisah dari
            skor juri utama.
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
            mulai 13 Oktober 2026 dengan kurir pilihan admin.
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
