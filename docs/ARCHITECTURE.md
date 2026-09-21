# Architecture — Idola Contest

## Prinsip
- Mobile-first
- Server-first
- Cepat di jaringan seluler
- Aman untuk data anak
- Scalable ke Season berikutnya
- Data publik dan privat terpisah
- Tidak ada login peserta

## Stack
Frontend: Next.js App Router, TypeScript, Tailwind, React Hook Form, Zod.  
Backend: Next.js server routes/actions, Supabase PostgreSQL, Auth, Storage, Realtime.  
PWA: manifest, service worker, installable, offline fallback.

## Domain modules
```txt
src/
  app/
  components/
  features/
    registrations/
    participants/
    competitions/
    submissions/
    judging/
    gallery/
    payments/
    claims/
    shipping/
    admin/
    locations/
  lib/
    supabase/
    validation/
    auth/
    formatting/
    business-rules/
  types/
```

## Server Components
Gunakan Server Components sebagai default. Client hanya untuk multi-step form, compression, realtime widget, confetti, interactive filter, PWA prompt, dan animation ringan.

## Shared business rules
Buat fungsi terpusat:
- `calculateSubmissionDeadline`
- `validateCompetitionCategory`
- `generateRegistrationCode`
- `formatRupiah`
- `canPublishSubmission`
- `canAcceptRegistration`
- `canAcceptSubmission`
- `getActiveSeason`

## Registration flow
Browser → server validation → Zod → DB → code generation → private photo storage → success.

## Submission flow
Upload private → `pending_review` → admin review → approve → optimized public copy → gallery.

Pending file tidak boleh punya public URL.

## Status lookup
Gunakan server endpoint dengan registration code. Return data minimum. Tambahkan rate limit. Jangan return alamat, WhatsApp, atau catatan internal.

## Admin auth
Supabase Auth dengan role `super_admin`, `admin`, `judge`. Semua `/admin/*` protected server-side.

## Realtime
Gunakan untuk registrations, payments, submissions, claims, shipments. Hindari realtime untuk data publik yang tidak perlu.

## Region adapter
Buat interface provider agar vendor bisa diganti tanpa ubah form. Sediakan internal routes untuk provinces, regencies, districts, villages. Cache respons.

## Image handling
Validasi MIME, extension, file size. Kompres jika >2MB, target <=1.8MB. Gunakan generated filename, bukan filename user.

## Performance
No heavy hero video. Gunakan Next/Image, WebP/AVIF, lazy load, pagination, cache, minimal JS.
