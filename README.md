# Idola Contest — Season 1

## Menjalankan aplikasi

Implementasi Next.js berada di `src/`. Gunakan Node.js 24 dan npm:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Isi kredensial Supabase untuk menggunakan pendaftaran dan admin. Tanpa kredensial, halaman informasi tetap dapat dibuka; operasi database tidak memakai data mock.

Panduan setup, migrasi, akun admin, dan alur operasional: [docs/RUNBOOK.md](docs/RUNBOOK.md).

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright test
```

`npm test` menguji aturan bisnis dan migrasi/alur PostgreSQL menggunakan PGlite lokal. Pengujian browser tanpa kredensial ada di `e2e/`. Pengujian Auth, Storage, dan Realtime pada Supabase live tetap diperlukan sebelum peluncuran.

Dokumentasi produk dan implementasi untuk membangun **Idola Contest**, platform kompetisi kreatif anak Indonesia.

**Brand:** Idola Contest  
**Instagram:** `@idola.contest`  
**Tagline:** **Saatnya Si Kecil Menjadi Idola!**
**Season aktif:** Season 1

## Stack wajib

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth untuk admin saja
- Supabase Storage
- Supabase Realtime
- Zod
- React Hook Form
- PWA
- Client-side image compression
- Mobile-first responsive UI

## Dokumen

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SUPABASE.md`
- `docs/ADMIN-GUIDE.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/IMPLEMENTATION-PLAN.md`
- `MASTER_PROMPT.md`
- `AI_EXECUTION_PROMPT.md`
- `.env.example`

## Timeline Season 1

- Pendaftaran: **21 September 2026 – 06 Oktober 2026**
- Penilaian: **07 Oktober 2026**
- Pengumuman: **08 Oktober 2026**
- Penyiapan hadiah: **09–12 Oktober 2026**
- Pengiriman serentak: mulai **13 Oktober 2026**

## Biaya

Registrasi: **Rp20.000**  
BSI **7341301558** a.n. **Riswan Ramadhan**

Klaim paket penghargaan setelah pengumuman: **Rp120.000** termasuk **gratis ongkir seluruh Indonesia**.

## Cara memakai

Letakkan folder ini di root project, lalu berikan `AI_EXECUTION_PROMPT.md` kepada AI coding agent. AI wajib membaca seluruh dokumen sebelum coding dan harus menyelesaikan backend, database, RLS, admin, submission, gallery, PWA, lint, typecheck, dan build — bukan hanya membuat UI.
