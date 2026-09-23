# Deployment — Idola Contest

## Prasyarat

- Node.js LTS kompatibel
- npm/pnpm
- Supabase
- hosting Next.js seperti Vercel
- domain
- env vars

## Setup

1. Buat Supabase project.
2. Jalankan migrations.
3. Buat indexes.
4. Aktifkan RLS.
5. Buat storage buckets.
6. Setup policies.
7. Seed Season 1.
8. Buat akun admin.

## Admin

Buat user via Supabase Auth, lalu insert `admin_profiles` dengan role `super_admin`. Untuk bootstrap dari environment server, isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD`, lalu jalankan `npm run setup:admin`. Segera ganti password bootstrap setelah login pertama.

Pastikan migration terbaru sudah terpasang dan verifikasi integrasi:

```bash
npm run check:supabase
```

## Build checks

```bash
npm run lint
npm run typecheck
npm run build
```

Semua harus lolos.

## PWA

Pastikan manifest, service worker, icon 192, icon 512, apple-touch-icon, theme color, standalone, offline fallback.

Untuk notifikasi admin, pasang tiga environment variable VAPID dari `.env.example`, jalankan migration `202609240001_admin_push_notifications.sql`, lalu deploy ulang. Buka PWA admin dari HTTPS dan tekan **Aktifkan notifikasi**. Pada iPhone/iPad, tambahkan situs ke Home Screen lebih dahulu sebelum meminta izin notifikasi.

## SEO dan indexing

Pastikan `NEXT_PUBLIC_SITE_URL=https://idolacontest.my.id`, lalu periksa `/robots.txt` dan `/sitemap.xml` setelah deploy. Daftarkan sitemap resmi di Google Search Console dan Bing Webmaster Tools. Halaman admin, API, cek status, serta halaman sukses tetap dilarang untuk crawler karena berhubungan dengan data privat.

## Smoke test

Homepage, registration, image compression, regions, code, payment pending/paid, status, admin login, submission, approve, gallery, finalist share, results publish, claim, shipping.

## Performance

Target Lighthouse >=90 untuk Performance, Accessibility, Best Practices, SEO.

## Backup

Backup sebelum penutupan registrasi, penilaian, pengumuman, dan pengiriman.
