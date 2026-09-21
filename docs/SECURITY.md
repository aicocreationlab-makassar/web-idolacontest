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
