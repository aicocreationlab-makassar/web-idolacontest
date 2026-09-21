# PRD — Idola Contest Season 1

## 1. Ringkasan
Idola Contest adalah platform kompetisi kreatif anak Indonesia untuk ekspresi, kreativitas, keberanian, dan karya anak.

Target utama: orang tua, khususnya ibu dengan anak usia Preschool, PAUD, TK, dan SD di seluruh Indonesia. Mayoritas akses diperkirakan dari smartphone.

Jenis lomba:
1. **Fotogenik — Cita Citaku**
2. **Mewarnai — Cita Citaku**

## 2. Tujuan Season 1
- Akuisisi peserta secara masif dalam periode singkat.
- Membuat brand tampak profesional dan terpercaya.
- Mempermudah registrasi via HP.
- Memberi social proof melalui galeri finalis.
- Membuat halaman finalis yang mudah dibagikan.
- Memberi admin dashboard operasional yang rapi.
- Menyiapkan fondasi Season 2 tanpa redesign besar.

## 3. Timeline
- Registrasi: 21 Sep 2026 – 06 Okt 2026
- Deadline submission global: 06 Okt 2026
- Penilaian: 07 Okt 2026
- Pengumuman: 08 Okt 2026
- Persiapan hadiah: 09–12 Okt 2026
- Pengiriman: mulai 13 Okt 2026

Countdown harus membaca `registration_close_at` dari database. Setelah deadline, registrasi dan submission ditutup server-side.

## 4. Branding
Nama: **Idola Contest**  
Instagram: **@idola.contest**  
Tagline: **Saatnya Si Kecil Bersinar!**

Visual: colorful, glossy 3D, kid-friendly, playful, tetapi tetap profesional. Gunakan aset logo yang sudah ada di folder **LOGO IDOLA CONTEST**. Jangan generate ulang logo.

Elemen visual: bintang, kamera, polaroid, pensil warna, crayon, palette, awan, confetti, orbit ribbon.

Palet: Sky Blue, Candy Pink, Sunshine Yellow, Purple, Mint Green, White.

## 5. Halaman publik
- `/`
- `/daftar`
- `/cek-status`
- `/lomba/fotogenik`
- `/lomba/mewarnai`
- `/galeri`
- `/finalis/[slug]`
- `/hasil`
- `/timeline`
- `/faq`
- `/syarat-ketentuan`
- `/kebijakan-privasi`

Admin:
- `/admin/login`
- `/admin/dashboard`
- `/admin/peserta`
- `/admin/pendaftaran`
- `/admin/karya`
- `/admin/penilaian`
- `/admin/hasil`
- `/admin/klaim-hadiah`
- `/admin/pengiriman`
- `/admin/settings`

## 6. Homepage
Hero:
- Badge: `IDOLA CONTEST — SEASON 1`
- Headline: `Saatnya Si Kecil Bersinar!`
- Subheadline: `Kompetisi kreatif anak Indonesia untuk menunjukkan senyum, kreativitas, dan karya terbaik si kecil.`
- CTA utama: `Daftar Sekarang`
- CTA sekunder: `Lihat Finalis`
- Live countdown
- Badge `KUOTA TERBATAS`

Kuota harus berasal dari konfigurasi admin, bukan angka palsu.

Section homepage:
1. Hero
2. Dua jenis lomba
3. Keunggulan
4. Paket penghargaan
5. Timeline
6. Cara daftar
7. Galeri finalis
8. Kriteria penilaian
9. Info penting
10. FAQ
11. Final CTA

Mobile wajib punya sticky CTA `Daftar Sekarang`.

## 7. Hadiah
- Piala Gold Marmer
- Medali Juara Nasional
- Piagam Penghargaan
- Plakat Marmer
- Akses platform pembuatan worksheet anak unlimited

## 8. Transparansi biaya
Registrasi: **Rp20.000**  
BSI **7341301558** a.n. **Riswan Ramadhan**

Klaim paket penghargaan setelah pengumuman: **Rp120.000**, termasuk gratis ongkir seluruh Indonesia.

Consent wajib:
`Saya memahami bahwa biaya registrasi lomba adalah Rp20.000 dan terdapat biaya klaim paket penghargaan Rp120.000 setelah pengumuman, termasuk ongkir ke seluruh Indonesia.`

## 9. Alur registrasi
Follow Instagram → isi form → kode registrasi → transfer Rp20.000 → konfirmasi admin → admin verifikasi → peserta resmi → kirim karya → pending review → approve → tampil di galeri.

Sumber registrasi:
- `website`
- `instagram_dm`
- `admin_manual`

Jika via website, peserta isi sendiri. Jika via DM, admin input melalui dashboard. Keduanya memakai model data sama.

## 10. Form pendaftaran
Gunakan multi-step form.

### Data anak
- Nama lengkap
- Usia
- Jenis lomba
- Jenjang/kategori
- Nama sekolah
- Kelas
- Cita-cita anak

Fotogenik:
- Preschool
- PAUD
- TK
- SD Kelas 1–2
- SD Kelas 3–4
- SD Kelas 5–6

Mewarnai:
- PAUD
- TK
- SD Kelas 1–2
- SD Kelas 3–4
- SD Kelas 5–6

Preschool tidak boleh muncul untuk mewarnai.

### Data orang tua
- Nama orang tua/wali
- Nomor WhatsApp aktif
- Username Instagram

### Alamat
- Jalan / nomor rumah
- Provinsi
- Kabupaten/Kota
- Kecamatan
- Kelurahan/Desa
- Kode Pos

Gunakan cascading dropdown lokasi Indonesia melalui internal Next.js API adapter. Kode pos gunakan provider terpisah bila tersedia, dengan fallback input manual 5 digit.

### Upload foto peserta
Format: JPG/JPEG/PNG/WEBP. Maksimal final 2 MB. Jika lebih, tawarkan kompresi client-side dengan target <=1.8 MB.

## 11. Consent dan privasi anak
Wajib:
- persetujuan orang tua/wali;
- izin publikasi;
- persetujuan S&K;
- persetujuan biaya.

Jangan tampilkan publik: alamat lengkap, WhatsApp, nama orang tua, detail pembayaran, catatan admin.

Galeri publik hanya: foto/karya approved, nama publik, lomba, kategori, kota/kabupaten, provinsi.

## 12. Nomor registrasi
Contoh: `IDC-S1-F7K3M9Q2`

Harus random, non-sequential, unik, cukup sulit ditebak.

## 13. Success page
Tampilkan pesan sukses, nomor registrasi, tombol salin kode, konfirmasi WhatsApp, dan cek status.

Pesan WhatsApp default:
`Halo Admin Idola Contest, saya telah mendaftarkan [Nama Anak] dengan nomor registrasi [CODE]. Saya ingin melakukan konfirmasi pembayaran registrasi.`

## 14. Cek status
Route `/cek-status`, tanpa login user.

Pending: jelaskan data sudah tersimpan, arahkan pembayaran jika belum transfer, dan minta menunggu verifikasi jika sudah transfer.

Paid: tampilkan confetti ringan dan pesan `Yeay! Pembayaranmu Sudah Terverifikasi!`, serta CTA ke instruksi lomba dan admin.

## 15. Lomba Mewarnai
Tema: **Cita Citaku**

Peserta: PAUD, TK, SD 1–2, SD 3–4, SD 5–6.

Keunikan: admin membuat worksheet personal berdasarkan wajah/foto anak dan cita-citanya.

Alur: daftar → admin buat worksheet → admin upload → peserta menerima → print A4 → mewarnai → upload hasil → review → approve → galeri.

Alat warna diperbolehkan: crayon, pensil warna, spidol, oil pastel, watercolor, poster color, kombinasi media.

Peserta boleh menambah objek pendukung, tetapi tidak boleh mengubah komposisi utama secara berlebihan.

Deadline: `MIN(registration_date + 7 hari, 06 Oktober 2026)`.

Penilaian:
- Kerapian & Teknik: 30
- Harmoni dan Keseimbangan Warna: 25
- Kreativitas Pemilihan Warna: 20
- Kesesuaian Tema: 15
- Detail & Komposisi: 10

## 16. Lomba Fotogenik
Tema: **Cita Citaku**

Peserta: Preschool, PAUD, TK, SD 1–2, SD 3–4, SD 5–6.

Boleh: kostum profesi, atribut cita-cita, properti sederhana, background bertema.

Deadline: `MIN(registration_date + 7 hari, 06 Oktober 2026)`.

Penilaian:
- Ekspresi & Rasa Percaya Diri: 30
- Kreativitas Interpretasi Tema: 25
- Pose & Komposisi Foto: 20
- Kualitas Teknis Foto: 15
- Originalitas & Overall Impression: 10

Jangan gunakan AI untuk menilai kecantikan atau karakteristik wajah anak.

## 17. Kategori hasil
- Juara Utama 1, 2, 3
- Juara Harapan 1, 2, 3
- Juara Favorit 1, 2, 3
- Juara Umum
- Best Social Media

Best Social Media terpisah dari skor juri utama.

## 18. Galeri
Route `/galeri`.

Filter: lomba, kategori, provinsi. Search: nama finalis.

Hanya `publication_status = approved`.

## 19. Halaman finalis
Route `/finalis/[slug]`.

Tampilkan foto/karya, nama publik, lomba, kategori, kota, provinsi, tema. Tambahkan WhatsApp share, copy link, dan OpenGraph metadata.

## 20. Pengumuman dan klaim
Pengumuman: **08 Oktober 2026** melalui `@idola.contest` dan halaman `/hasil` setelah dipublish admin.

Klaim paket: **Rp120.000**, gratis ongkir seluruh Indonesia.

Pembayaran: BSI **7341301558** a.n. **Riswan Ramadhan**.

## 21. Pengiriman
Mulai 13 Oktober 2026. Kurir dapat berupa AnterAja, J&T, SiCepat, atau pilihan admin.

Status: waiting, prepared, shipped, delivered.

## 22. Sportivitas
Kecurangan, manipulasi karya, identitas, engagement, atau tindakan tidak sportif dapat menyebabkan diskualifikasi, pembatalan penghargaan, atau pembatasan mengikuti kompetisi berikutnya.
