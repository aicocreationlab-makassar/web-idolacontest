# Setup and operations

## Local application

Use Node.js 24 LTS (Node >=20.9 compatible with Next.js 16) and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Without Supabase credentials, informational pages render, gallery/results have empty states, admin login and participant mutations return an explicit unavailable error. No participant records are fabricated or persisted locally.

## Supabase project

1. Create a Supabase project. Apply every SQL file in `supabase/migrations` in ascending filename order, either via the SQL editor or `supabase db push` after linking the project. Do not apply the same seed twice.
2. Migrations create tables, constraints, RLS, narrow public views, transactional RPCs, audit triggers, four buckets, Realtime publication, and Season 1.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` in local/hosting secrets. Never prefix the service key with `NEXT_PUBLIC_`.
4. Disable public signup in Supabase Auth. Create an admin using the Supabase dashboard, then run the following with its actual UUID:

```sql
insert into public.admin_profiles(user_id,display_name,role)
values ('REPLACE-WITH-AUTH-USER-UUID','Nama Pengelola','super_admin');
```

5. Configure Supabase Auth Site URL to the production HTTPS domain. Do not put passwords in SQL, source control, or seed files. Create judge accounts separately with `role='judge'`.
6. Confirm buckets `participant-private`, `submission-private`, `worksheets-private` are private. `gallery-public` alone is public. There are deliberately no browser upload/write policies: uploads pass through authorized server routes. Signed private URLs expire after 60 seconds.
7. Confirm Realtime is enabled for registrations, payments, submissions, claim_invoices, shipments. RLS limits subscribers to authorized admins; judges do not subscribe to the operational dashboard.
8. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, and `NEXT_PUBLIC_WHATSAPP_NUMBER` to an international number containing digits only (e.g. 62...). No phone number is invented when absent.
9. Complete the live smoke checklist below before launch, then enable backups and test restore procedures.

## Regions and postcode

The internal `/api/regions/[level]` adapter defaults to the current [Emsifa v2 dataset](https://www.emsifa.com/api-wilayah-indonesia/) (38 provinces). The provider contract accepts JSON arrays `{id:string,name:string}` or the v2 `{data:[...],meta:{...}}` envelope at `provinces.json`, `regencies/{id}.json`, `districts/{id}.json`, and `villages/{id}.json`. Numeric and dotted region IDs are supported. Provider data is cached for one day. Server-side registration rechecks the full parent-child hierarchy and derives names from the provider.

For a replacement provider, set `REGION_API_BASE_URL` to an endpoint with that contract or adapt `src/lib/locations.ts`. If the region provider is down, registration fails safely and the form offers retry; it never invents location data.

Optional `POSTAL_CODE_API_BASE_URL` receives `?village={code}` and returns `{postal_code:"12345"}`. If absent, failed, or invalid, the parent enters the required five digits manually.

## Roles

- `super_admin`: all operational screens and season date/quota settings.
- `admin`: participants, payments, worksheets, moderation, judging, results, claims, shipping, CSV and audit.
- `judge`: approved submissions, signed access to approved work, and own scores. No contact/address/payment records. Scores use five numeric values from 0–100; weighted total is recomputed in PostgreSQL.

Every operational write goes through a permission-checked RPC with audit triggers in the same transaction. Clients cannot directly write tables, even with an authenticated admin JWT. The service key is imported only by server modules.

## Workflow

1. Parent registers, or an admin uses `/admin/pendaftaran` for DM/manual input. Both require complete consent and obey the same dates/quota.
2. Verify the bank transfer outside the application, then set payment to paid. There is no automatic bank integration or WhatsApp delivery service.
3. For coloring, create a personalized worksheet manually from the child's photo/dream job and upload a JPG/PNG/WebP image. Versions are retained. Parents obtain the latest version via their secret registration code.
4. Participant uploads work privately before the effective deadline. Existing pending/approved work blocks duplicate uploads; revision/rejection allows a new version before the deadline.
5. Review work. Approval and publication are separate actions. Publication creates an optimized public copy; unpublish removes that public object and hides the projection. Unpublish first before changing an approved work's review or refunding its registration payment.
6. Judges enter scores. Set an award; the final score is the average of human judges' weighted totals. Best Social Media is a separate award selection, not a modification to any judge criterion.
7. Publish results only on/after the configured announcement time. Issue a Rp120.000 invoice. Verify claim payment, then enter courier/status/tracking. Shipped/delivered requires the shipping start date, paid claim and tracking number.
8. Export CSV from the relevant operational screen. Search, season, competition, category, province, payment and source filters carry through to the entire export. CSV cells are escaped against spreadsheet formula injection.

## Seasons and time

Season 1 uses `Asia/Makassar` (UTC+08 / WITA), based on the workspace timezone; all public deadline labels state WITA. End of registration/submission is 6 October 2026 23:59:59 WITA. Confirm this timezone with the organizer before launch if WIB was intended.

Quota is null unless configured; no fake remaining-quota counter is shown. The active season is selected from the database. To create a future season, insert its complete dates with a unique uppercase slug (e.g. `S2`), add event settings, then deactivate the old season and activate the new one in a single transaction. Only one active season is allowed. Existing registrations retain their original season references.

## Hosting and security operations

- Deploy on a Node-capable Next.js host. Sharp runs in the Node runtime; this is not a static export.
- Rate limits live in PostgreSQL, shared across instances; database failure fails closed. Behind Vercel the trusted platform header is used. On another host, set `TRUST_PROXY=true` only when the proxy overwrites `X-Forwarded-For`; otherwise all callers share the safe fallback bucket.
- Configure an upstream request-size cap around 3 MB and abuse controls. Server upload parsing also enforces a bounded body, decoding, supported format, pixel count, and 2 MB final size.
- Registration codes are 96-bit random bearer capabilities. Do not post them publicly. Status lookup is exact-match, POST-only, rate limited, and returns no address, WhatsApp, parent name, or admin notes.
- Storage writes and SQL transactions are separate services. Failed database writes attempt object cleanup. Periodically reconcile orphaned objects after provider/network failures, and retry interrupted unpublish operations. Never delete an object referenced by an active private record.
- Public copies may have been downloaded by others before unpublication. Handle guardian withdrawal requests promptly; deletion cannot recall external copies.
- Service worker caches only the generic offline page and icon. API/admin/status/registration responses are never cached offline.
- `SENTRY_DSN` is reserved but no telemetry SDK is enabled; never assume monitoring is active merely because this variable is set.

## Live acceptance checklist

- Register one photogenic and one coloring test participant using real region selections; verify private storage, code, amount and all four consent values.
- Confirm Preschool coloring rejection using both UI and direct API.
- Verify payment as admin; check public status response contains no family contact or address.
- Upload worksheet, download with code, verify expiry and denial for invalid/unpaid codes.
- Submit before deadline; test rejection after deadline and for pending payment. Pending work must not be accessible through gallery/storage public URLs.
- Approve then publish; verify gallery/filter/finalist/OG/share. Unpublish and verify public object removal.
- Use separate judge and admin sessions to verify roles, scores, publication timing, invoice, claim payment, shipping and realtime.
- Check CSV filters, escaping, audit records and browser back behavior after logout.
- Check HTTPS PWA installation/offline fallback on a physical phone; measure production Lighthouse before claiming target >=90.

## Sources used for framework setup

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase server-side clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
