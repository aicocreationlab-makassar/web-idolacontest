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
