---
name: full-audit
description: Run a full audit of the 20TwentyScore app (Next.js/React/TypeScript, Prisma+Postgres, NextAuth, Stripe) covering test coverage (unit + e2e gaps), accessibility, performance, SEO, responsive/UX, security, code quality (typing, duplication, bad patterns, dead code), and README/feature alignment. Appends new findings to a persistent AUDIT.md checklist in the repo (existing checked-off items are preserved). Use when the user asks to audit, review the health of, or find improvements for the whole app — not for reviewing a single PR/diff.
---

# Full site audit

Produces a holistic health report for **20TwentyScore**, a Next.js 16 / React 19 / TypeScript
(strict mode) T20 cricket scorecard app. It has both a frontend (pages/components/context) and a
real backend surface: Next.js API routes under `pages/api/` backed by Prisma + Postgres, auth via
NextAuth (`pages/api/auth/[...nextauth].ts`), and billing via Stripe (`pages/api/stripe/*`). This
is NOT a PR/diff review — lint (`tsc --noEmit` + Biome), Knip (dead-export/dependency check), and
unit tests are already enforced as CI gates on every PR (see `.github/workflows/pull_request_audit.yml`),
so **do not re-check whether the app lints/type-checks/builds/passes Knip — it already does**.
This audit looks at things no single PR's gates catch: coverage gaps on untouched files,
e2e/integration coverage, cross-cutting site quality (a11y, perf, SEO, security, UX), and code
quality that passing gates don't guarantee (e.g. `any` and unsafe casts still compile cleanly —
see category 8).

Note: individual category skills already exist in this repo (`.claude/skills/security.md`,
`accessibility.md`, `performance.md`, `test.md`, `quality.md`, `product.md`) as narrower,
single-issue-per-run tools. Some of their "Known project patterns" notes (e.g. "no backend",
"no user authentication") are now **stale** — the app has grown auth, a database, and Stripe
billing since those were written. Treat this audit as the source of truth for current state and
call out stale assumptions in those other skill files as a code-quality/roadmap finding if found.

## When to run this

User asks to "audit the site", "find ways to improve the app", "do a full review", or similar
whole-app requests. If they ask about a single PR or the current diff, use a diff/PR review
instead.

## Output

Findings live in a single persistent file at the repo root: **`AUDIT.md`**. This is not a
one-off report — it's a living checklist that accumulates across runs. Each run **appends**,
never replaces:

- `AUDIT.md` has one `## <n>. <Category>` section per category below, in the same order, each
  containing a flat markdown checklist (`- [ ] finding text (found: YYYY-MM-DD)`).
- **Before writing anything**, read the current `AUDIT.md` in full (create it from the template
  below if it doesn't exist yet).
- For each category, compare this run's findings against what's already listed in that section:
  - If a finding already exists (same issue, same file/route — wording may differ slightly),
    **do not duplicate it**. Leave the existing line untouched.
  - If an existing unchecked item no longer reproduces (verify, don't assume — re-check it),
    check it off and add `(resolved: YYYY-MM-DD, verified during audit)` rather than deleting
    the line, so there's a record.
  - **Never touch a line that's already checked off (`- [x]`)** — those are the user's own
    record of completed work. Leave them exactly as-is, in place.
  - Genuinely new findings get appended to the bottom of that section's list as new `- [ ]`
    items, dated.
- Add a line to the `## Run log` section at the top with today's date and a one-line summary
  (e.g. "2026-08-31 — 4 new findings (2 a11y, 1 security, 1 code quality), 1 item resolved").
- Do not renumber, reorder, or rewrite prose outside the checklists — this file is meant to be
  readable as a diff over time.

Do not modify application code during the audit unless the user explicitly asks you to fix
something after seeing the report — this skill is read-only/diagnostic aside from editing
`AUDIT.md` itself.

### AUDIT.md template (use this structure if the file doesn't exist yet)

```markdown
# Site Audit

Living checklist maintained by the `full-audit` skill. Findings are appended, never rewritten;
check an item off (`- [x]`) once you've fixed it and it won't be touched again. Re-running the
audit adds new findings to the bottom of each section and leaves checked items alone.

## Run log

- YYYY-MM-DD — initial audit

## 1. Test coverage — unit gaps and e2e

## 2. Accessibility

## 3. Performance

## 4. SEO / metadata

## 5. Responsive / UX

## 6. Security

## 7. README / feature alignment

## 8. Code quality
```

## How to run it

Fan out the categories below as parallel forks or a general-purpose subagent per category (they
are independent and read-heavy — keep the raw output out of your main context). Have each one
**report findings back as text**, not write to `AUDIT.md` directly — only you should touch that
file, in a single merge pass at the end, so the dedup/checked-item rules above are applied
consistently in one place. Categories needing the browser (a11y/perf/responsive/e2e-walkthrough)
should run together in one browser-driving pass since they all need the app running.

Before starting, check whether a dev server is already running; if not, start it yourself for
the duration of the audit (`yarn dev`, port 3000 — a Postgres connection via
`POSTGRES_PRISMA_URL` is required for auth/saves/seasons/stripe routes to work; if no local/dev
database is configured, note that as a limitation rather than blocking the rest of the audit),
and stop it when done unless the user is already running it.

### 1. Test coverage — unit gaps and e2e

- Run `yarn test --coverage` and parse the table. Coverage is collected from `pages/**`,
  `components/**`, and `context/**` only (see `jest.config.ts`) — `utils/` is **not** in
  `collectCoverageFrom`; call that config gap out once rather than repeatedly flagging every
  uncovered `utils/` file as if it were a normal gap. List every file below full coverage and
  call out any with no spec file at all (spec files live next to source as `*.spec.tsx`/
  `*.spec.ts`, except `pages/` specs which must live under `__tests__/pages/` to avoid Next.js
  treating them as routes).
- API routes under `pages/api/` (`auth/[...nextauth]`, `account`, `saves`, `seasons`,
  `stripe/create-checkout-session`, `stripe/create-portal-session`, `stripe/webhook`,
  `stripe/sync-subscription`) are server-side handlers — confirm whether any have unit/
  integration coverage; if none do, that's a coverage gap worth its own line per route.
- **E2e coverage**: Playwright is installed (`e2e/full-game.e2e.ts`, `playwright.config.ts`,
  `yarn test:e2e`) — re-check what it actually covers rather than assuming. Walk these flows in
  the browser via `claude-in-chrome` as a manual substitute for whatever e2e doesn't already
  cover:
  - Sign in via NextAuth (`pages/auth/signin.tsx`) and sign out
  - Full match flow: setup → scoreboard → ball-by-ball scoring → summary (this is likely what
    `full-game.e2e.ts` already covers — verify, don't duplicate as a finding if it does)
  - Save/load a game via the `saves` API and `SaveCard` UI
  - Seasons list and season detail (`pages/seasons/index.tsx`, `pages/seasons/[id].tsx`)
  - Stripe upgrade flow: `UpgradeCTA` → checkout session → account page reflecting subscription
    state (mock/stub Stripe rather than hitting live Stripe if actually executing this)
  For each flow, report whether it currently has automated coverage (unit-level mocks don't
  count as e2e) and, if not, propose a specific new e2e spec file name and scope.

### 2. Accessibility

- Automated pass per route (axe via browser console injection, or Lighthouse a11y score through
  `claude-in-chrome`) — CI already runs `@axe-core/cli` against `/` only; extend the check to the
  other routes it doesn't cover (`scoreboard`, `match`, `summary`, `seasons`, `account`,
  `dashboard`, `auth/signin`).
- Manual: focus management and ARIA on interactive elements, colour contrast (Emotion-styled
  components), semantic heading structure, keyboard-only completion of a full scoring flow and
  the sign-in flow. Cross-check against the seed list already tracked in
  `.claude/skills/accessibility.md` — don't re-report issues already listed there as new; do
  verify whether any marked "fixed" have actually shipped.

### 3. Performance

- Lighthouse performance score and Core Web Vitals (LCP, CLS, INP) per route
- Next.js build output (`yarn build`): bundle size per route, unused JS/CSS, images not using
  `next/image`, missing code-splitting (`dynamic()`) for heavy/rarely-used components
- Context re-render cost: `context/GameContext.tsx` provider value stability, since it wraps the
  whole app
- API route response time for `saves`, `seasons`, and `account` endpoints under a simple manual
  check (these hit Postgres via Prisma)

### 4. SEO / metadata

- `components/meta/meta.tsx` and `pages/_document.tsx`: title/meta description per route, Open
  Graph tags, presence of `sitemap.xml`/`robots.txt` in `public/`, semantic heading structure per
  route, whether `public/images/temp-seo-image.jpg` (the filename suggests it's a placeholder) is
  still a placeholder that should be replaced

### 5. Responsive / UX

- Screenshot each route at ~375px and ~1280px via `claude-in-chrome` — cover both marketing/auth
  pages (`index`, `auth/signin`) and app pages (`scoreboard`, `match`, `summary`, `teams`,
  `seasons`, `account`, `dashboard`)
- Console errors on load/navigation (`read_console_messages`), broken links, dead-end states
  (e.g. what happens on a failed save, an expired session, a failed Stripe checkout)

### 6. Security

- Auth flow review: NextAuth session/cookie config (`HttpOnly`, `Secure`, `SameSite`), whether
  `pages/api/account`, `pages/api/saves/*`, and `pages/api/seasons/*` correctly verify the
  session before returning/mutating a given user's data (no IDOR — one user reading/writing
  another user's save or season by guessing an id)
- Stripe: webhook signature verification in `pages/api/stripe/webhook.ts`, no secret keys
  exposed to the client bundle, checkout/portal session creation scoped to the authenticated user
- Dependency vulnerabilities: `yarn audit --level high`
- Security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`) — check `next.config.js`/`next.config.ts` for a `headers()` function
- `.env*` files and Prisma connection strings not committed; no secrets hardcoded in
  `pages/api/**`

### 7. README / feature alignment

There's no separate roadmap document — use `README.md`'s "Features" and "Tech stack" sections as
the source of truth to diff against what's actually live in `main`:

- The README currently describes only client-side scoring + localStorage persistence and does
  not mention accounts, sign-in, saved games via the database, seasons, or Stripe
  subscriptions/billing — all of which exist in `pages/` and `pages/api/`. Flag this as a
  documentation gap (README understates the app) rather than a roadmap-alignment issue in the
  "checked but not shipped" sense.
- Flag the reverse case too: anything the README claims that no longer matches the live app
  (e.g. if localStorage save/load has actually been superseded by the database-backed `saves`
  API, the README should say so).

### 8. Code quality

A passing lint/type-check/build/Knip run only proves the code compiles cleanly and has no
unused exports — not that it's precisely typed, non-duplicated, or free of other bad patterns.
`.claude/skills/quality.md` covers this incrementally one finding at a time; this category does
a broader sweep in one pass.

- **Strict typing** — explicit `any`, unsafe `as Type` casts, missing return type annotations on
  exported functions, non-null assertions (`!`) that could be replaced with a proper guard,
  params/props typed as `object` or `{}`, Prisma query results spread into UI props without a
  narrower type.
- **Code duplication** — repeated logic across `components/`, `context/`, and API routes under
  `pages/api/` (e.g. duplicated session-check or Prisma-client boilerplate across
  `account`/`saves`/`seasons` handlers that should share a helper), values inlined 3+ times that
  should be a named constant.
- **Bad patterns** — `useEffect` with missing or overly broad dependency arrays, state mutation
  instead of returning new values from `gameReducer`, magic numbers/strings, inline `style=`
  props in `.tsx` files that should be Emotion styles, prop drilling more than 2 levels where
  `useGameScore()`/`useOvers()`/`useMostRecentAction()` already exist.
- **Dead code** — exported symbols not imported anywhere (Knip should catch most of this, but
  re-check anything in `knip.json`'s `ignoreExportsUsedInFile`/`ignoreDependencies` lists, since
  those suppress real Knip findings and can go stale), commented-out code blocks left in files,
  and files like `public/icons/backup.txt` or `public/favicon/code.txt` that look like leftover
  scratch files rather than shipped assets.

## Notes

- This is a personal/small project — keep findings proportionate. Don't recommend enterprise-
  scale tooling (e.g. a full CI a11y pipeline) as a "blocker"; note it as a "nice to have" instead
  unless it's actually broken for a real user.
- Cite every finding with a route, file:line, or screenshot — no vague "could be improved"
  entries.
- **Every checklist item must be independently reviewable as one small PR** — if a finding is
  actually a bundle of unrelated or large changes (e.g. "add e2e coverage for account flows",
  "improve accessibility across the app", "harden all API routes"), split it into several
  separate `- [ ]` lines, each scoped to a single reviewable change (e.g. one line per flow's e2e
  spec, one line per route's a11y fix, one line per API route's auth check). Never write a
  checklist item a reviewer couldn't approve or reject on its own without also weighing in on
  unrelated changes bundled into it.
