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
