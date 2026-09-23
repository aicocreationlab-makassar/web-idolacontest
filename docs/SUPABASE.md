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

Migration `202609220002_registration_review.sql` menambahkan keputusan review pendaftaran, sinkronisasi akses peserta, metrik dashboard, serta RPC `admin_review_registration`. Jalankan seluruh migration secara berurutan. Periksa koneksi, schema review, login, dan role admin tanpa mencetak rahasia dengan:

Migration `202609220003_short_registration_codes.sql` mengizinkan kode baru yang lebih singkat dan mudah dibaca, misalnya `IDC-AHMAD-K7P9X2Q4`. Format lama tetap diterima agar kode peserta lama tetap berfungsi. Terapkan migration ini sebelum deployment aplikasi terbaru.

Migration `202609230001_optional_postcode_wib.sql` menjadikan kode pos opsional, memperbarui RPC registrasi agar menyimpan kode pos kosong sebagai `NULL`, dan mengubah jadwal Season 1 serta metadata timeline menjadi WIB (`Asia/Jakarta`).

Migration `202609240001_admin_push_notifications.sql` menambahkan penyimpanan privat subscription Web Push milik admin. Jalankan migration ini sebelum mengaktifkan notifikasi pada PWA admin. Data endpoint push tidak boleh dibaca dari browser atau halaman publik.

```bash
npm run check:supabase
```

## Service role

`SUPABASE_SERVICE_ROLE_KEY` hanya server, tidak boleh `NEXT_PUBLIC_`.

## Storage security

Private files via signed URL berumur pendek. Public bucket hanya approved.

## Backup

Sebelum penilaian/pengumuman, lakukan backup dan export data penting.

## Seed

Seed Season 1, event settings, timeline, fee values. Jangan seed password plaintext.
