---

# FILE: README.md

# Idola Contest — Season 1

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


---

# FILE: MASTER_PROMPT.md

# MASTER PROMPT — BUILD IDOLA CONTEST

You are a senior full-stack engineer, product engineer, database architect, security-minded SaaS developer, and senior UI/UX designer.

Build a production-ready platform named **Idola Contest**. This is NOT a mockup, NOT a static landing page, and NOT a design-only task.

Read and follow every file in this repository, especially:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SUPABASE.md`
- `docs/ADMIN-GUIDE.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/IMPLEMENTATION-PLAN.md`

Tech requirements:

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth for ADMIN ONLY
- Supabase Storage
- Supabase Realtime
- Zod
- React Hook Form
- PWA
- client-side image compression
- mobile-first design

Brand:

- Idola Contest
- @idola.contest
- tagline: Saatnya Si Kecil Menjadi Idola!
- Season 1
- colorful, glossy 3D, playful, kid-friendly, professional

Search project assets for `LOGO IDOLA CONTEST` and use the existing logo. Do not create a replacement logo. Use recognizable official-style WhatsApp and Instagram icons.

Participants do not log in. Only admins authenticate. Participants use registration codes.

Build all public and admin routes described in the PRD.

Fees:

- registration Rp20.000
- BSI 7341301558 a.n. Riswan Ramadhan
- claim package after announcement Rp120.000 including free shipping across Indonesia

Fees must be disclosed transparently before registration.

Season 1:

- registration: 21 Sep 2026 – 06 Oct 2026
- judging: 07 Oct 2026
- announcement: 08 Oct 2026
- prize preparation: 09–12 Oct 2026
- shipping starts: 13 Oct 2026

Competitions:
Photogenic: Preschool, PAUD, TK, SD 1–2, SD 3–4, SD 5–6.
Coloring: PAUD, TK, SD 1–2, SD 3–4, SD 5–6. Preschool MUST NOT be selectable.
Theme: Cita Citaku.

Coloring uses personalized worksheets based on the child's photo/face and dream profession.

Submission deadline: `MIN(registration date + 7 days, 06 Oct 2026)`.

Uploads must never become public automatically. Flow: private upload → pending review → admin approve → publish → gallery.

Registration codes must be random, unique, and non-sequential, e.g. `IDC-S1-F7K3M9Q2`.

Registration form must include all child, parent, address, competition, dream job, social, consent, and photo fields from the PRD. Use cascading Indonesian region dropdowns behind a Next.js internal API adapter. Max final image 2MB, with client-side compression for oversized files.

Admin dashboard must include totals, filters, search, realtime, CSV export, participant detail, payment verification, moderation, worksheet upload, judging, awards, claims, shipping, and audit log.

PWA is required. Target Lighthouse >= 90 in Performance, Accessibility, Best Practices, SEO.

Do not expose private participant data. Do not expose Supabase service role to the browser. Protect admin routes server-side. Use RLS. Centralize business rules. Add loading/error/empty states.

Do not stop after UI generation. Finish migrations, RLS, storage, real integrations, status lookup, admin, moderation, gallery, results, claims, shipping, PWA, docs.

Run `lint`, `typecheck`, and `build`, and fix all errors before completion.

---

# FILE: AI_EXECUTION_PROMPT.md

# AI EXECUTION PROMPT

Paste this into your AI coding agent after placing this documentation bundle in the project root.

---

You are responsible for implementing this project end-to-end.

Before writing code, READ THESE FILES IN FULL:

1. `README.md`
2. `MASTER_PROMPT.md`
3. `docs/PRD.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DATABASE.md`
6. `docs/SUPABASE.md`
7. `docs/ADMIN-GUIDE.md`
8. `docs/DEPLOYMENT.md`
9. `docs/SECURITY.md`
10. `docs/IMPLEMENTATION-PLAN.md`
11. `.env.example`

Treat them as project requirements and source of truth.

Do not start by giving me only an explanation. Do not stop at a UI prototype. Do not replace backend behavior with mock data.

## Step 1 — Inspect

- inspect the repository;
- inspect assets;
- locate `LOGO IDOLA CONTEST`;
- detect package manager;
- detect whether Next.js already exists.

If repo is empty, initialize a production-ready Next.js App Router TypeScript project.

Create a concise checklist aligned with `docs/IMPLEMENTATION-PLAN.md`, then execute it without asking for approval between milestones unless a genuinely blocking external credential is required.

## Milestone 1

Implement foundation, Tailwind, brand system, Supabase clients, migrations, RLS, Season 1 seed, storage documentation/setup, admin auth, protected admin shell, PWA base.

Run lint, typecheck, build. Fix all failures.

## Milestone 2

Implement homepage, competition pages, multi-step registration, Indonesian region adapter, postcode fallback, image compression, secure registration code, success page, WhatsApp confirmation, status lookup, participant admin table, payment verification.

Run lint, typecheck, build. Fix all failures.

## Milestone 3

Implement worksheet management, secure worksheet access, submission upload, private storage, moderation, approve/revision/reject, publication, gallery, finalist profile, share, OpenGraph, judging, weighted scoring.

Run lint, typecheck, build. Fix all failures.

## Milestone 4

Implement results, awards, publish switch, claim invoice, claim payment status, shipping, tracking, CSV export, audit log, realtime dashboard.

Run lint, typecheck, build. Fix all failures.

## Milestone 5

Perform security/privacy review, rate limiting, accessibility, responsive QA, image performance, PWA checks, SEO, sitemap, robots, loading/error/empty states.

Final commands:

```bash
npm run lint
npm run typecheck
npm run build
```

If a script is missing, add the correct script to `package.json`.

## Non-negotiable

- No participant login.
- Admin login only.
- Public gallery shows approved work only.
- Pending uploads stay private.
- Private participant data never appears in public queries.
- Service role key never reaches client.
- Preschool cannot register for coloring.
- Registration/submission deadlines enforced server-side.
- Random non-sequential registration code.
- Final image max 2MB; offer client-side compression.
- Mobile-first.
- PWA enabled.
- Use existing Idola Contest logo.
- Use recognizable WhatsApp and Instagram brand icons.
- Fees transparent.
- Multi-season architecture.
- Admin mutations audit logged.
- Build must pass.

## Missing credentials

Do not block development. Create adapters, `.env.example`, safe fallbacks, and documentation. Continue building what can be built. Never invent credentials.

## Final report

Return:

1. implemented features;
2. migrations;
3. routes;
4. admin features;
5. required env variables;
6. remaining manual Supabase steps;
7. lint result;
8. typecheck result;
9. build result;
10. known limitations.

Report actual completed work, not vague claims.

---

# FILE: docs/PRD.md

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
Tagline: **Saatnya Si Kecil Menjadi Idola!**

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
- Headline: `Saatnya Si Kecil Menjadi Idola!`
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

---

# FILE: docs/ARCHITECTURE.md

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

---

# FILE: docs/DATABASE.md

# Database Design — Idola Contest

Gunakan UUID primary keys dan `created_at`/`updated_at`.

## `seasons`

- id
- name
- slug unique
- registration_open_at
- registration_close_at
- submission_global_close_at
- judging_at
- announcement_at
- shipping_at
- quota nullable
- is_active
- created_at
- updated_at

## `participants`

- id
- full_name
- public_name
- age
- school_name
- parent_name
- whatsapp
- instagram_username
- address_line
- province_code/name
- regency_code/name
- district_code/name
- village_code/name
- postal_code
- created_at
- updated_at

## `registrations`

- id
- season_id
- participant_id
- registration_code unique
- competition_type
- category
- dream_job
- class_label nullable
- registration_source
- registration_status
- payment_status
- consent_parent_guardian
- consent_publication
- consent_terms
- consent_fee
- created_at
- updated_at

Enums:

- competition_type: `photogenic`, `coloring`
- source: `website`, `instagram_dm`, `admin_manual`
- status: `registered`, `verified`, `cancelled`, `disqualified`
- payment: `pending`, `paid`, `rejected`, `refunded`
- category: `preschool`, `paud`, `tk`, `sd_1_2`, `sd_3_4`, `sd_5_6`

## `participant_media`

- id
- registration_id
- storage_path
- mime_type
- size_bytes
- status
- created_at

## `submissions`

- id
- registration_id
- submission_type
- private_file_path
- public_file_path nullable
- status
- publication_status
- submitted_at
- reviewed_at nullable
- reviewed_by nullable
- review_note nullable
- created_at
- updated_at

Statuses: `not_submitted`, `pending_review`, `approved`, `revision_required`, `rejected`.

Publication: `hidden`, `approved`.

## `worksheets`

- id
- registration_id
- private_file_path
- version
- created_by
- created_at

## `judging_scores`

- id
- submission_id
- judge_id
- criteria jsonb
- total_score numeric
- notes nullable
- created_at
- updated_at

## `results`

- id
- registration_id
- final_score
- award_code
- is_published
- published_at nullable
- created_at
- updated_at

## `payments`

- id
- registration_id
- payment_type (`registration`, `award_claim`)
- amount
- status
- verified_by nullable
- verified_at nullable
- admin_note nullable
- created_at
- updated_at

## `claim_invoices`

- id
- registration_id
- invoice_number unique
- amount default 120000
- status (`draft`, `issued`, `paid`, `cancelled`)
- created_at
- paid_at nullable

## `shipments`

- id
- registration_id
- courier
- tracking_number nullable
- shipping_status (`waiting`, `prepared`, `shipped`, `delivered`)
- shipped_at nullable
- delivered_at nullable
- created_at
- updated_at

## `admin_profiles`

- user_id fk auth.users
- display_name
- role (`super_admin`, `admin`, `judge`)
- created_at

## `admin_audit_logs`

- id
- admin_user_id
- action
- entity_type
- entity_id
- before_data jsonb nullable
- after_data jsonb nullable
- created_at

## `event_settings`

- id
- season_id
- key
- value jsonb
- created_at
- updated_at

## Indexes

Index: registration_code, season_id, competition_type, category, payment_status, publication_status, province_code, created_at, submission.status, shipment.shipping_status.

## Constraints

- coloring tidak boleh preschool;
- consent wajib true untuk public registration;
- code unique;
- public_file_path hanya bila publication approved;
- award result satu per registration per season.

## Deadline

`effectiveSubmissionDeadline = min(registrationCreatedAt + 7 days, season.submissionGlobalCloseAt)`

Wajib divalidasi server-side.

---

# FILE: docs/SUPABASE.md

# Supabase Setup — Idola Contest

## Services

Gunakan PostgreSQL, Auth, Storage, Realtime.

## Auth

Hanya admin. Peserta tidak punya akun.

## Storage buckets

- `participant-private` — private
- `submission-private` — private
- `worksheets-private` — private
- `gallery-public` — public hanya untuk hasil approved

## Upload flow

Foto awal: validasi → kompres → upload private → simpan path.

Submission: private → pending_review → admin approve → buat public copy → gallery.

## RLS

Public tidak boleh select seluruh participants, registrations, payments, claims, shipments, admin profiles.

Public gallery hanya approved projection.

## Registration endpoint

Public form memanggil server route, Zod validation, insert server-side, return minimum data.

## Status endpoint

`POST /api/status` dengan registration code. Return hanya public name, status bayar, lomba, kategori, submission status. Tambahkan rate limiting.

## Realtime

Aktifkan hanya tabel yang diperlukan: registrations, payments, submissions, claim invoices, shipments.

## Service role

`SUPABASE_SERVICE_ROLE_KEY` hanya server, tidak boleh `NEXT_PUBLIC_`.

## Storage security

Private files via signed URL berumur pendek. Public bucket hanya approved.

## Backup

Sebelum penilaian/pengumuman, lakukan backup dan export data penting.

## Seed

Seed Season 1, event settings, timeline, fee values. Jangan seed password plaintext.

---

# FILE: docs/ADMIN-GUIDE.md

# Admin Guide — Idola Contest Season 1

## Login

`/admin/login` — hanya akun admin resmi.

## Dashboard

Tampilkan total registrasi, pending, paid, lomba per jenis, submission pending/approved, peserta per kategori/provinsi, sumber registrasi, claim, shipping.

## Registrasi website

Data masuk otomatis dengan source `website`, payment `pending`, foto private. Admin verifikasi bukti transfer dan ubah menjadi `paid`.

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

---

# FILE: docs/DEPLOYMENT.md

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

---

# FILE: docs/SECURITY.md

# Security & Privacy — Idola Contest

Platform memproses data anak dan orang tua. Gunakan prinsip data-minimum, least privilege, server-side authorization, private-by-default, explicit consent, dan auditability.

## Admin

Supabase Auth, server-side protected routes, role check, audit log. Frontend-only guard tidak cukup.

## Secret

Jangan expose `SUPABASE_SERVICE_ROLE_KEY`, private API keys, atau credentials.

## Public data minimization

Public: public name, competition, category, city, province, approved media.

Private: full address, WhatsApp, parent name, payment details, admin notes, private media.

## Registration endpoint

Zod validation, rate limit, anti-spam, normalized inputs, input length limits, safe file validation.

## Status lookup

Registration code berentropy tinggi, rate limit, response minimum, no wildcard search.

## Upload

Validasi MIME, extension, file size, decode image, generated filename. Maksimum final 2MB.

## Storage

Private via signed URL singkat. Public hanya approved content.

## Consent

Simpan parent/guardian consent, publication consent, terms consent, fee consent dan timestamp.

## Audit

Catat payment, publish/unpublish, submission approval, award, claim, shipping.

## Logging

Jangan log full address, full WhatsApp, signed URL, secrets.

## Legal

Wajib S&K dan Privacy Policy yang menjelaskan tujuan data, publikasi, pembayaran, pengiriman, dan penanganan pelanggaran.

---

# FILE: docs/IMPLEMENTATION-PLAN.md

# Implementation Plan

## Milestone 1 — Foundation

- Next.js + TS strict
- Tailwind + brand tokens
- Supabase clients
- migrations
- RLS
- storage docs/setup
- admin auth
- protected admin shell
- PWA base
- Season 1 seed

Gate: lint, typecheck, build.

## Milestone 2 — Acquisition

- homepage
- competition pages
- timeline/prizes/fees
- multi-step registration
- cascading regions
- postcode fallback
- image compression
- registration code
- success page
- WhatsApp confirmation
- status lookup
- admin participant list
- payment verification

Gate: end-to-end registration works, private data protected, build passes.

## Milestone 3 — Competition Engine

- worksheet upload/access
- submission upload
- private storage
- moderation
- approve/publish
- gallery
- finalist page
- share + OG
- judging + weighted score

Gate: pending never public, approved appears, scoring correct.

## Milestone 4 — Operations

- results
- awards
- result publish switch
- claim invoice
- claim payment
- shipping
- CSV export
- audit log
- realtime dashboard

Gate: admin operations end-to-end.

## Milestone 5 — Hardening

- rate limiting
- error/loading/empty states
- accessibility
- responsive QA
- PWA
- SEO
- sitemap/robots
- security review
- Lighthouse

Final gate: lint + typecheck + build all pass.

---

# FILE: .env.example

NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_INSTAGRAM_USERNAME=idola.contest
NEXT_PUBLIC_WHATSAPP_NUMBER=

REGION_API_BASE_URL=
POSTAL_CODE_API_BASE_URL=

# Optional

SENTRY_DSN=
