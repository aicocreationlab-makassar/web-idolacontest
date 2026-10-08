# Admin Guide — Idola Contest

## Login

`/admin/login` — hanya akun admin resmi. Peran: `super_admin`, `admin`, `judge` (juri hanya melihat menu Penilaian).

## Pasang sebagai aplikasi (PWA admin)

Halaman `/admin/*` memakai manifest khusus (`/admin/manifest.webmanifest`, scope `/admin/`, start URL `/admin/dashboard`) dan service worker sendiri (`/admin-sw.js`). Memasang dari halaman admin selalu membuka ruang pengelola, bukan website publik.

- **iPhone/iPad:** buka `/admin/dashboard` di Safari → Bagikan → *Tambah ke Layar Utama* → buka dari ikon **Idola Admin** → ketuk **Aktifkan notifikasi** pada kartu di atas dashboard → Izinkan.
- **Android/Chrome:** kartu “Pasang Idola Admin” menampilkan tombol *Pasang sekarang*; notifikasi juga bisa diaktifkan tanpa memasang.
- Satu akun boleh mengaktifkan notifikasi di beberapa perangkat. Pendaftar baru dan karya baru dikirim sebagai push notification secara langsung dari server saat data masuk.
- Tidak perlu mengatur kunci VAPID: server membuat kuncinya sekali dan menyimpannya di tabel `app_config` (migration `202610090001`). Variabel `NEXT_PUBLIC_VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` hanya dipakai bila memang diisi.
- Di mode aplikasi (PWA) bilah atas dan tombol menu otomatis turun di bawah status bar iPhone.

Indikator di atas halaman menunjukkan koneksi realtime: **Realtime terhubung** (pembaruan instan + toast pendaftar baru) atau **Realtime terputus · memperbarui otomatis tiap 20 detik** (mode cadangan).

## Dashboard

Menampilkan total peserta, perlu diperiksa, pembayaran lunas, karya perlu diperiksa, karya sudah dinilai, juara diumumkan, klaim lunas, paket terkirim, serta sebaran per kategori/provinsi/sumber. Setiap kartu bisa diklik menuju halaman kerjanya. Filter season default = season aktif.

## Salin pesan DM personal

Di setiap baris Pendaftaran Masuk, Data Peserta, Juara & Hasil, Klaim Hadiah, Pengiriman, dan di halaman detail peserta ada panel **Pesan DM untuk Mommy {nama}**. Sistem memilih tahap yang sedang berlaku (kode registrasi terbit, pengingat/verifikasi pembayaran, worksheet siap, pengingat/penerimaan/revisi karya, karya tampil di galeri, pengumuman juara, invoice klaim, klaim lunas, resi, paket diterima, terima kasih) dan menyusun pesan hangat-profesional berisi kode registrasi, cara cek status, nominal/rekening, nomor invoice, kurir dan resi sesuai data peserta. Ketuk **Salin pesan** lalu tempel di DM Instagram. Tahap lain bisa dipilih dari menu.

## Pendaftaran masuk & peserta

Data website masuk otomatis dengan source `website`, payment `pending`, foto privat. Buka **Periksa detail peserta** → approve/reject → verifikasi pembayaran → status peserta `verified` hanya bila review `approved` dan pembayaran `paid`.

## Worksheet mewarnai

Buka detail peserta mewarnai yang sudah lunas → unggah worksheet (gambar A4). Peserta mengunduhnya lewat Cek Status.

## Review karya

Karya baru berstatus `pending_review`. Setujui dulu, lalu publikasikan ke galeri secara terpisah. Karya yang disetujui otomatis masuk antrean penilaian.

## Penilaian juri

Menu **Penilaian Juri** menampilkan setiap karya yang disetujui, dikelompokkan per jenis lomba dan kategori usia. Juri menggeser/mengetik lima nilai 0–100; total berbobot (30/25/20/15/10) tampil langsung. Nilai yang sudah pernah disimpan terisi kembali dan dapat diperbarui.

Begitu nilai disimpan, database **otomatis meranking** semua peserta pada jenis lomba + kategori yang sama (rata-rata skor seluruh juri; seri diputus oleh waktu kirim karya lebih awal) dan menetapkan:

| Peringkat | Penghargaan |
| --- | --- |
| 1–3 | Juara Utama 1–3 |
| 4–6 | Juara Harapan 1–3 |
| 7–9 | Juara Favorit 1–3 |

Juara Umum dan Best Social Media ditetapkan manual.

## Data pemenang permanen

Saat juara diumumkan, sistem membuat **data pemenang** (tabel `winners`) lengkap dengan salinan karya di `gallery-public/winners/`. Data ini:

- tampil di halaman publik `/hasil` sebagai karya juara beserta penghargaannya (tab per season),
- muncul di Cek Status peserta sebagai foto karya juara dan penghargaan (menggantikan tampilan finalis), bahkan setelah data pendaftaran dihapus,
- tetap ada ketika data pendaftaran/peserta dihapus atau publikasi galeri ditarik,
- hanya hilang bila dihapus lewat tombol **Hapus data pemenang** di bagian bawah Juara & Hasil (hapus permanen dari database dan storage).

Menyembunyikan hasil (Sembunyikan hasil / Sembunyikan semua hasil kategori) juga menghapus data pemenang beserta salinan karyanya.

Pemenang yang diumumkan sebelum fitur ini ada mendapat salinan karyanya otomatis saat halaman `/hasil` atau Juara & Hasil dibuka (maksimal 12–24 per muat), atau sekaligus lewat `npm run winners:sync`.

## Juara & hasil

Papan peringkat per kategori diperbarui realtime. Untuk setiap peserta tersedia **Atur**: ganti penghargaan secara manual (atau kembalikan ke otomatis) dan **Umumkan juara / Sembunyikan hasil**. Tombol **Umumkan semua juara kategori ini** memublikasikan satu kategori sekaligus.

Saat juara diumumkan:

- nilai peserta dikunci,
- invoice klaim Rp120.000 + tagihan `award_claim` diterbitkan otomatis,
- halaman `/hasil` dan Cek Status peserta langsung menampilkan penghargaan.

## Klaim hadiah

Daftar seluruh juara yang diumumkan beserta invoice. Setelah transfer diterima, ketuk **Tandai klaim lunas**. Status lain (menunggu/dibatalkan) ada di *Ubah status lain*. Status klaim tampil di Cek Status peserta.

## Pengiriman

Menampilkan juara yang klaimnya lunas. Isi kurir, nomor resi, dan status (menunggu → disiapkan → dikirim → diterima). Status *dikirim/diterima* wajib punya nomor resi. Tidak ada lagi gerbang tanggal; admin yang menentukan kapan mengirim. Resi langsung tampil di Cek Status.

## Season & tema

Menu **Season & Tema** (admin dan super admin):

1. **Buat season baru** → isi nama, kode (mis. `S2`), tema lomba (mis. *Pahlawanku*), tagline, pilih **tampilan website** (Langit Ceria, Senja Hangat, Petualangan Hutan, Dunia Permen, Samudra Biru, Galaksi Impian — tiap tampilan mengubah warna header, hero, tombol, dekorasi, dan stiker 3D), lalu seluruh timeline (WIB) dan kuota.
2. **Simpan season** → season tersimpan nonaktif.
3. **Aktifkan season ini** → season lama dinonaktifkan, website publik langsung berganti tema, jadwal, dan teks tema di beranda, timeline, FAQ, halaman lomba, galeri, dan Cek Status.
4. Season bisa diubah kapan saja (tema & timeline). Super admin dapat menghapus season nonaktif tanpa peserta dan membersihkan foto season.
5. Season yang jadwalnya sudah lewat ditandai **Jadwal selesai · data peserta tetap tersimpan**; data pendaftaran dan peserta tetap tampil normal di menu admin.
6. **Tarik semua publikasi karya season ini** (zona berbahaya tiap season) menyembunyikan seluruh karya season dari galeri dan menghapus file publiknya dari storage secara permanen. Data pendaftaran, nilai, dan data pemenang tidak ikut terhapus.

Semua perintah hapus di admin (peserta, foto season, publikasi, data pemenang) menghapus baris database dan objek storage secara permanen, bukan sekadar menyembunyikan.

## Cek Status peserta

Dengan kode registrasi, orang tua melihat pelacak perjalanan: pendaftaran → pembayaran → karya → penilaian → pengumuman juara → klaim → pengiriman, termasuk penghargaan, invoice, status klaim, kurir, dan resi. Semua berubah otomatis mengikuti tindakan admin.

## Audit log

Setiap perubahan (termasuk ranking otomatis dan invoice otomatis) tercatat dengan data sebelum/sesudah.

## Jika ada yang gagal dimuat

Pesan error admin sekarang menjelaskan penyebabnya (mis. “Klaim hadiah belum dibayar…”, “Fungsi database belum tersedia. Terapkan migration terbaru…”). Jalankan `npm run check:supabase` untuk memastikan skema, RPC, dan kunci push sudah lengkap.
