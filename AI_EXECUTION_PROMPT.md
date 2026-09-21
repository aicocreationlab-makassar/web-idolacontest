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
