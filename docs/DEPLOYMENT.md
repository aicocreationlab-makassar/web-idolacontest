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
Buat user via Supabase Auth, lalu insert `admin_profiles` dengan role `super_admin`. Jangan simpan password default di repo.

## Build checks
```bash
npm run lint
npm run typecheck
npm run build
```

Semua harus lolos.

## PWA
Pastikan manifest, service worker, icon 192, icon 512, apple-touch-icon, theme color, standalone, offline fallback.

## Smoke test
Homepage, registration, image compression, regions, code, payment pending/paid, status, admin login, submission, approve, gallery, finalist share, results publish, claim, shipping.

## Performance
Target Lighthouse >=90 untuk Performance, Accessibility, Best Practices, SEO.

## Backup
Backup sebelum penutupan registrasi, penilaian, pengumuman, dan pengiriman.
