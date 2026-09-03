# Product Roadmap — 20TwentyScore

The scoring engine works and saves to `localStorage`, but `next-auth`, Prisma/Postgres, and
Stripe are already dependencies without (per the README's current feature list) being wired into
any feature yet — the biggest near-term win is finishing that wiring so a match survives past one
browser. Everything below is scored against four jobs:

- **Acquisition** — brings new visitors in
- **Engagement** — deepens a single visit
- **Retention** — earns a repeat visit
- **Fun** — no metric, just delight

Every feature is broken into a **PR sequence** — each step small enough for a human to review in
about 15 minutes. Genuinely atomic changes are left as one PR.

**Before any of the below:** confirm how much of `next-auth`/Prisma/Stripe is actually wired up
(check `pages/api/`, `prisma/schema.prisma`, and whether a sign-in flow exists) — the steps here
assume they're installed-but-largely-unwired, per the README's current localStorage-only feature
list; adjust if that's stale.

## Now (ship in weeks — reuses existing infra)

### 1. Sign-in — *Retention*
Wire up `next-auth` so a user has an identity to save matches against — the prerequisite for
everything else here.

1. **Infra (Mise en Place):** configure a `next-auth` provider (e.g. email or a single OAuth
   provider) and the sign-in page, using the already-installed `@next-auth/prisma-adapter`.
2. Session-aware nav (sign in/out state), reusing the existing Emotion styling patterns.

### 2. Save matches to the database — *Retention*
Persist a finished (or in-progress) match to Postgres via Prisma, scoped to the signed-in user,
instead of only `localStorage`.

1. Prisma schema/migration for a `Match` model capturing the existing scoring state shape.
2. API route to save/load a match by ID, scoped to `req.user`.
3. Wire the existing save/load UI to the new API, falling back to `localStorage` when signed out.

### 3. Match history list — *Retention, Engagement*
Once matches are saved server-side (feature 2), a page listing a user's past matches.

1. Query: a user's saved matches, most recent first — pure function + tests.
2. Match history page rendering the list, linking into each saved match's scorecard.

## Next (this quarter — moderate new build)

### 4. Shareable scorecard — *Acquisition, Fun*
A read-only, public link for a completed match's scorecard — something to send to teammates.

1. A public share-slug field on the `Match` model (from feature 2) — migration + generator
   function + tests.
2. A read-only shared-scorecard page rendering it, no auth required.

---
*20TwentyScore — product roadmap, 2 September 2026*
