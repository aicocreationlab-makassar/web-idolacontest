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
