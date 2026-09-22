# Admin Guide — Idola Contest Season 1

## Login
`/admin/login` — hanya akun admin resmi.

## Dashboard
Tampilkan total registrasi, pending, paid, lomba per jenis, submission pending/approved, peserta per kategori/provinsi, sumber registrasi, claim, shipping.

## Registrasi website
Data masuk otomatis dengan source `website`, payment `pending`, foto private. Admin verifikasi bukti transfer dan ubah menjadi `paid`.

## Review pendaftaran
Buka **Pendaftaran Masuk** dari sidebar. Data terbaru tampil lebih dulu dan dapat difilter berdasarkan season, lomba, kategori, status review, pembayaran, provinsi, atau sumber.

1. Pilih **Periksa detail peserta** untuk melihat seluruh isian formulir dan foto privat.
2. Pilih `approved` bila data valid, atau `rejected` bila pendaftaran ditolak. Catatan internal opsional tersimpan di audit log.
3. Verifikasi pembayaran secara terpisah. Kode peserta berstatus `verified` hanya jika review pendaftaran `approved` dan pembayaran `paid`.

Perubahan pada pendaftaran, pembayaran, karya, klaim, dan pengiriman memperbarui halaman admin melalui Supabase Realtime. Jika daftar kosong, halaman menampilkan status kosong dan bukan error.

## Admin melalui ponsel
Halaman `/admin` memiliki sidebar geser, tabel berbentuk kartu pada layar kecil, dan manifest PWA khusus dengan start URL `/admin/dashboard`. Pasang PWA dari halaman admin agar aplikasi langsung membuka ruang pengelola.

## Registrasi DM
Admin buka `Tambah Peserta`, isi data, source `instagram_dm`, simpan. Kode registrasi dibuat otomatis.

## Payment verification
Status: pending, paid, rejected, refunded. Semua perubahan masuk audit log.

## Worksheet mewarnai
Buka peserta → lihat foto dan cita-cita → buat worksheet → upload ke `worksheets-private` → tandai ready → peserta mengakses lewat flow aman.

## Review karya
Submission awal `pending_review`. Admin dapat approve, request revision, reject. Setelah approve, publication bisa diaktifkan dan public copy dibuat.

## Penilaian
Mewarnai: 30/25/20/15/10.  
Fotogenik: 30/25/20/15/10.

Sistem menghitung total otomatis.

## Hasil
Award: Juara Utama 1–3, Harapan 1–3, Favorit 1–3, Juara Umum, Best Social Media. Best Social Media terpisah dari core judging.

`/hasil` baru dipublish setelah admin set publish.

## Klaim hadiah
Generate invoice Rp120.000, peserta membayar, admin mark paid.

## Pengiriman
Mulai 13 Oktober 2026. Isi courier, tracking number, status.

## Export
CSV export untuk peserta, payment, hasil, klaim, pengiriman. Filter aktif harus ikut export.

## Data publik
Jangan publish WA, alamat, nama orang tua, notes, data pembayaran, atau private URLs.

## Hapus data season
Super admin dapat menghapus satu pendaftaran beserta file privat/publik terkait dari halaman detail. Gunakan purge media pada Pengaturan Season untuk menghapus seluruh media season setelah backup dan verifikasi manual.
