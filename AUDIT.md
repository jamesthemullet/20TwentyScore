# Site Audit

Living checklist maintained by the `full-audit` skill. Findings are appended, never rewritten;
check an item off (`- [x]`) once you've fixed it and it won't be touched again. Re-running the
audit adds new findings to the bottom of each section and leaves checked items alone.

## Run log

- 2026-09-01 — initial audit: 62 findings (24 unit coverage, 10 API test gaps, 5 e2e gaps, 10 a11y, 6 perf, 5 SEO, 8 responsive/UX, 5 security, 6 README, 20 code quality; some items span multiple categories in this count). 3 items independently verified as already fixed.
- 2026-09-01 — scheduled maintenance: resolved "Jest `collectCoverageFrom` misses `utils/` and `lib/`" (section 1) by adding `utils/**` and `lib/**` globs to `jest.config.ts`.
- 2026-09-03 — scheduled maintenance: resolved "`pages/seasons/[id].tsx` has no spec file" (section 1) by adding `__tests__/pages/seasons-id.spec.tsx`, covering the season name/back-link, description, empty state, and rendered `SaveCard`s.
- 2026-09-04 — scheduled maintenance: resolved "`pages/seasons/index.tsx` coverage gap" (section 1) by adding tests for `createSeason` (blank-name guard, success, API-error, and thrown-error paths) and `getServerSideProps` (unauthenticated redirect, free-tier short-circuit, premium-tier season mapping) to `__tests__/pages/seasons-index.spec.tsx`; file is now at 100% coverage.

## 1. Test coverage — unit gaps and e2e

- [x] Jest `collectCoverageFrom` (jest.config.ts) only globs `pages/**`, `components/**`, `context/**` — `utils/` and `lib/` are invisible to the coverage report even though both have real logic and their own spec files (e.g. `utils/scorecardStats.spec.ts`, `lib/subscription.spec.ts`), so regressions there won't show as coverage drops (found: 2026-09-01) (resolved: 2026-09-01, PR #433)
- [ ] `lib/gameSaveTitle.spec.ts` currently fails: its regex `/\d{1,2} \w{3}$/` doesn't match a 4-char month abbreviation like `"1 Sept"` (found: 2026-09-01)
- [ ] `pages/match.tsx` is at 81.08% stmts / 7.22% branch / 15.38% funcs — largest coverage gap in the app (uncovered: 31-35, 38-44, 62, 89-101, 103-115, 121-136, 139-156, 159, 289-329, 371, 442-577, 672-685) (found: 2026-09-01)
- [ ] `pages/dashboard.tsx` is at 77.46% stmts / 70.83% branch / 50% funcs (uncovered: 59-74, 78-123, 159-166, 244-295) (found: 2026-09-01)
- [x] `pages/seasons/index.tsx` is at 79.32% stmts / 85.71% branch / 20% funcs (uncovered: 35-57, 120-151) (found: 2026-09-01) (resolved: 2026-09-04, PR #TBD)
- [x] `pages/seasons/[id].tsx` has no spec file at all — 0% coverage; add `__tests__/pages/seasons-id.spec.tsx` (found: 2026-09-01) (resolved: 2026-09-03, PR #437)
- [ ] `pages/account.tsx` is at 82.96% stmts / 87.5% branch / 25% funcs (uncovered: 27-42, 91-113) (found: 2026-09-01)
- [ ] `pages/summary.tsx` is at 91.68% stmts / 84.61% branch (uncovered: 59-61, 68-108) (found: 2026-09-01)
- [ ] `pages/index.tsx` is at 97.03% stmts / 78.57% branch (uncovered: 14-17, 39-41) (found: 2026-09-01)
- [ ] `pages/teams.tsx` is at 100% stmts / 95.65% branch (uncovered: line 36) (found: 2026-09-01)
- [ ] `pages/setup.tsx` is at 100% stmts / 96.15% branch (uncovered: line 58) (found: 2026-09-01)
- [ ] `pages/_app.tsx` has no spec file — 0% coverage (found: 2026-09-01)
- [ ] `pages/_document.tsx` has no spec file — 0% coverage (found: 2026-09-01)
- [ ] `context/GameContext.tsx` has no dedicated spec file (only incidentally covered via other tests); func coverage is 71.87% (uncovered: line 400) — add `context/GameContext.spec.tsx` (found: 2026-09-01)
- [ ] `context/AccountContext.tsx` func coverage is only 66.66% despite 100% stmt/branch coverage (found: 2026-09-01)
- [ ] `components/auth/UserMenu.tsx` is at 94.97% stmts / 90.9% branch / 57.14% funcs (uncovered: 37-41, 59, 65-67) (found: 2026-09-01)
- [ ] `components/nav/nav.tsx` is at 98.87% stmts / 68.42% branch / 75% funcs (uncovered: 21-22) (found: 2026-09-01)
- [ ] `components/player/player.tsx` is at 94.85% stmts / 80% funcs (uncovered: 42-48) (found: 2026-09-01)
- [ ] `components/premium/UpgradeCTA.tsx` is at 98.73% stmts / 81.81% branch (uncovered: 20-21) (found: 2026-09-01)
- [ ] `components/saves/SaveCard.tsx` branch coverage is 55.55%, func coverage 66.66% despite 100% stmt coverage (uncovered: 28-37, 110) (found: 2026-09-01)
- [ ] `components/scorecard/scorecard.tsx` branch coverage is 94.73% (uncovered: line 106) (found: 2026-09-01)
- [ ] `components/scoring/scoring.tsx` is at 99.44% stmts / 94.11% branch / 84.21% funcs (uncovered: 39-40) (found: 2026-09-01)
- [ ] `components/team/team.tsx` branch coverage is 91.66% (uncovered: 34-35) (found: 2026-09-01)
- [ ] `components/core/buttons.tsx`, `components/core/heading.tsx`, `components/core/home-container.tsx` each have no dedicated spec file — 100% coverage is incidental via other tests only, not directly asserted (found: 2026-09-01)
- [ ] `pages/api/auth/[...nextauth].ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/account/index.ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/saves/index.ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/saves/[id].ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/seasons/index.ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/seasons/[id].ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/stripe/create-checkout-session.ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/stripe/create-portal-session.ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `pages/api/stripe/webhook.ts` has no spec/test file — 0% coverage; highest priority of the untested API routes since signature verification + event-handling logic spans 118 lines entirely untested (found: 2026-09-01)
- [ ] `pages/api/stripe/sync-subscription.ts` has no spec/test file — 0% coverage (found: 2026-09-01)
- [ ] `e2e/full-game.e2e.ts` is currently broken: clicking "Start New Match" navigates to `/setup` (per `newGame()` → `router.push("/setup")`), but the test asserts `toHaveURL('/match')` immediately after and never fills in the setup form or clicks "Start Match", so the scoreboard/scoring/summary steps never actually run — fix it to go through `/setup` first (found: 2026-09-01)
- [ ] No e2e coverage for sign in via NextAuth (`pages/auth/signin.tsx`) or sign out — add `e2e/auth.e2e.ts` covering sign-in with a test credentials/OAuth provider, sign-out, and session-gated UI (e.g. Dashboard link) appearing/disappearing (found: 2026-09-01)
- [ ] No e2e coverage for saving a game via the saves API and loading it back through `SaveCard` — add `e2e/saves.e2e.ts` covering: play a partial match, save it (authenticated), navigate to dashboard, click a `SaveCard` to resume, assert game state is restored (found: 2026-09-01)
- [ ] No e2e coverage for the seasons list or season detail pages (`pages/seasons/index.tsx`, `pages/seasons/[id].tsx`) — add `e2e/seasons.e2e.ts` covering the list view and drilling into a season's detail page with real data (found: 2026-09-01)
- [ ] No e2e coverage for the Stripe upgrade flow (`UpgradeCTA` → checkout session → account page reflecting subscription) — add `e2e/stripe-upgrade.e2e.ts` covering clicking `UpgradeCTA`, completing/mocking a test-mode Stripe Checkout session, and asserting `pages/account.tsx` reflects the upgraded subscription state after webhook/sync processing (found: 2026-09-01)

## 2. Accessibility

- [ ] `/` (home): axe/Accented reports "Document does not have a main landmark" and "Page must have a level-one heading", but DOM inspection shows one `<main>` and one `<h1>` are actually present — investigate whether this is a timing/observer quirk in the dev-only Accented tool or reproduces with a real screen reader (found: 2026-09-01)
- [ ] `components/header/header.tsx`: the seed a11y list's "site title rendered as `<p>`" note is stale — it's now `StyledHeading = styled(Link)` (an `<a>` with `aria-label`), not a `<p>`/heading — decide if the app title should be a heading element, and update `.claude/skills/accessibility.md` to match current code (found: 2026-09-01)
- [ ] `components/premium/UpgradeCTA.tsx` `subscribe()`: on a failed/non-OK checkout-session request, the `catch` only resets `loading` to `null` with no user-visible error, unlike `pages/account.tsx`'s `openBillingPortal` which renders `<ErrorMessage role="alert">` on failure — user is left with a silently-reset button (found: 2026-09-01)
- [ ] `pages/account.tsx` `SectionLabel` and `components/premium/UpgradeCTA.tsx` `PricePeriod` both use `color: #767676` at ~11-12px on white (~4.48:1 contrast, under the small-text 4.5:1 threshold with little margin) — concrete instances of the borderline grey already flagged generically in `.claude/skills/accessibility.md`; darken to `#757575` or below (found: 2026-09-01)
- [ ] `components/nav/nav.tsx`: mobile dropdown `<ul id="mobile-nav-menu">` is still only hidden via CSS `display: none`, with no `aria-hidden`/`hidden` toggle — remains in the accessibility tree when visually collapsed (pre-existing item in `.claude/skills/accessibility.md`, still unresolved) (found: 2026-09-01)
- [ ] `pages/summary.tsx` `MatchCentre`: still has no accessible heading/label announcing the score-comparison section to screen readers (pre-existing item in `.claude/skills/accessibility.md`, still unresolved) (found: 2026-09-01)
- [ ] `pages/scoreboard.tsx` is a "coming soon" stub not linked from `components/nav/nav.tsx` — an orphaned/dead-end route only reachable by typing the URL directly; add a nav entry with a "coming soon" affordance or remove routing until built (found: 2026-09-01)
- [x] `components/core/buttons.tsx` `SquareButton` no longer has `&:focus { outline: 0 }` — now has `&:focus-visible { outline: 3px solid #005fcc; }` matching `PrimaryButton`/`SecondaryButton` (resolved: 2026-09-01, verified during audit)
- [x] `components/nav/nav.tsx` `BurgerButton` now has `aria-expanded={isDropdownOpen}` and `aria-controls="mobile-nav-menu"` wired to state (resolved: 2026-09-01, verified during audit)
- [x] `pages/teams.tsx` `InitialsBadge` now renders visible text (e.g. "T1"/"T2") plus an adjacent `TeamName` — identity is no longer conveyed by colour alone (resolved: 2026-09-01, verified during audit)

## 3. Performance

- [ ] `yarn build` (Turbopack) no longer prints a First-Load-JS/route size table the way the older webpack build did — bundle-size regressions are harder to spot in CI output; nice-to-have: add `@next/bundle-analyzer` or read `.next/static/chunks` sizes in CI (found: 2026-09-01)
- [ ] Largest JS chunk after build is ~204KB, next largest ~100KB — no action needed now, just a baseline to watch as features grow (found: 2026-09-01)
- [ ] `components/premium/UpgradeCTA.tsx` only renders for free-tier users on `/account` — nice-to-have candidate for `dynamic()` code-splitting since no components currently use it (found: 2026-09-01)
- [ ] `context/AccountContext.tsx` fetches `/api/account` via `useEffect` on every authenticated page load, since `AccountProvider` wraps the whole app in `pages/_app.tsx` — nice-to-have: scope/defer this fetch to routes that actually need tier/subscription data (`/account`, premium-gated flows) (found: 2026-09-01)
- [ ] Authenticated-path response timing for `pages/api/saves`, `pages/api/seasons`, `pages/api/account` (the actual Postgres round trip via Prisma) could not be measured in this pass — no session was available; needs manual timing with a logged-in session (found: 2026-09-01)
- [x] `context/GameContext.tsx` `GameProvider` — provider values for `GameScoreContext`, `OversContext`, `MostRecentActionContext` are all properly wrapped in `useMemo` with correct dependency arrays; `context/AccountContext.tsx` likewise memoizes its context value — no re-render fix needed (verified during audit, 2026-09-01)

## 4. SEO / metadata

- [ ] `public/` has no `sitemap.xml`, and `public/robots.txt` doesn't reference one — add a sitemap and a `Sitemap:` directive in `robots.txt` (found: 2026-09-01)
- [ ] `public/images/temp-seo-image.jpg` is used site-wide as the `og:image`/`twitter:image` via `components/meta/meta.tsx:13` — filename indicates it's a placeholder; replace with a real branded image (found: 2026-09-01)
- [ ] `pages/seasons/[id].tsx:35-36` builds the page title/description from `season.name` with no visible guard for the loading/undefined state — verify `Meta` doesn't briefly render `undefined | 20Twenty Score` while the season is fetching (found: 2026-09-01)

## 5. Responsive / UX

- [ ] `pages/account.tsx`, `pages/dashboard.tsx`, `pages/auth/signin.tsx`, `pages/seasons/index.tsx`, `pages/seasons/[id].tsx` have no `@media` queries at all, relying on `max-width`/`%` containers and `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` — not visually confirmed at 375px in this pass; verify manually, particularly `dashboard.tsx`'s card grid against a narrow viewport with padding (found: 2026-09-01)
- [ ] Console shows a recurring `[HMR] Invalid message: {"type":"isrManifest",...} TypeError: Cannot read properties of undefined (reading 'components')` on every route in dev mode (Next.js 16/Turbopack dev-server HMR bug, not app code) — confirm it doesn't appear in a production build/deploy (found: 2026-09-01)
- [ ] `components/premium/UpgradeCTA.tsx` failed-checkout UX dead end: user clicks "Subscribe monthly/annually", sees "Redirecting…", and on failure is silently returned to the normal button state with zero feedback (same root cause as the a11y finding above) (found: 2026-09-01)
- [ ] `pages/auth/signin.tsx` has no link back to the marketing/home page and no nav header — the only way out for a user who lands there unintentionally is the browser back button; nice-to-have: add a "back to home" link (found: 2026-09-01)
- [ ] Automated 375px/1280px viewport screenshots could not be captured in this pass (browser automation's `resize_window` had no effect in this environment) — needs manual verification in a real browser/devtools device toolbar (found: 2026-09-01, limitation)
- [x] `components/nav/nav.tsx` and `components/header/header.tsx` both have a 768px burger-menu breakpoint; `pages/index.tsx`, `pages/setup.tsx`, `pages/teams.tsx`, `pages/summary.tsx`, `pages/match.tsx` all have matching `@media` rules — responsive coverage looks reasonably thorough for the main flow pages (verified during audit, 2026-09-01)
- [x] `pages/dashboard.tsx` save-error UI distinguishes `FREE_LIMIT_REACHED` from generic failures and renders via `role="alert"` — good dead-end handling for failed saves (verified during audit, 2026-09-01)
- [x] No raw `<img>` tags found anywhere in `components/`/`pages/` — `next/image` used consistently (verified during audit, 2026-09-01)

## 6. Security

- [ ] `pages/api/saves/[id].ts:37` — PATCH accepts an arbitrary `seasonId` in the request body and writes it via `prisma.gameSave.update` without verifying the referenced season belongs to `session.user.id`, letting a user attach their save to another user's season id if guessed (found: 2026-09-01)
- [ ] `pages/api/saves/index.ts:37` — POST similarly accepts a client-supplied `seasonId` when creating a save without verifying it belongs to the authenticated user (same issue class as above) (found: 2026-09-01)
- [ ] `nanoid` (transitive via `next > postcss > nanoid`) — high-severity advisory: custom generators can loop indefinitely when size is zero, patched in >=3.3.18; no direct fix without a `next`/`postcss` bump or a `resolutions` override (found: 2026-09-01)
- [ ] `deepmerge-ts` (transitive via `prisma > @prisma/config > deepmerge-ts`) — high-severity advisory: stack exhaustion when merging recursive object graphs, patched in >=8.0.0; no direct fix without a `prisma` bump or a `resolutions` override (found: 2026-09-01)
- [ ] `next.config.js:16-33` sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Content-Security-Policy`, but no `Strict-Transport-Security` (HSTS) header (found: 2026-09-01)

## 7. README / feature alignment

- [ ] README.md line 11 ("Save and load game state via localStorage") is stale — the app now has a Postgres-backed saves system (`pages/api/saves/index.ts`, `pages/api/saves/[id].ts`) gated behind NextAuth sign-in; localStorage is no longer the (only) persistence mechanism (found: 2026-09-01)
- [ ] README "Features" section omits sign-in/accounts — a full NextAuth flow (`pages/api/auth/[...nextauth].ts`, `pages/auth/signin.tsx`, `pages/account.tsx`, `pages/api/account/index.ts`) isn't mentioned anywhere (found: 2026-09-01)
- [ ] README "Features" section omits seasons — `pages/seasons/index.tsx`, `pages/seasons/[id].tsx`, and `pages/api/seasons/*` implement a full seasons feature not documented (found: 2026-09-01)
- [ ] README "Features" section omits Stripe billing/subscriptions — `pages/api/stripe/create-checkout-session.ts`, `create-portal-session.ts`, `sync-subscription.ts`, `webhook.ts`, and subscription management in `pages/account.tsx` are entirely undocumented (found: 2026-09-01)
- [ ] README "Tech stack" section omits NextAuth, Prisma/Postgres, and Stripe — all now core dependencies of the app (found: 2026-09-01)
- [ ] README omits the `pages/dashboard.tsx` route, described in-app as where users "view and manage your cloud saves and cricket seasons" — a user-facing feature with no README mention (found: 2026-09-01)

## 8. Code quality

- [ ] `context/GameContext.tsx:253,288,330,345,358` — five `[...teams] as GameScore` casts to force a spread `Team[]` back into the `[Team, Team]` tuple; extract a `cloneTeams(teams: GameScore): GameScore` helper instead of repeating the cast at each reducer branch (found: 2026-09-01)
- [ ] `pages/index.tsx:42` — `setGameScore(parsedGameData as GameScore)` casts `unknown` JSON straight to `GameScore` after only a shallow `Array.isArray`/length/`players` check; corrupted localStorage data can silently reach state (found: 2026-09-01)
- [ ] `pages/api/seasons/index.ts:38` — `(seasons as SeasonWithCount[])` hand-declares Prisma's `include`-shaped result instead of deriving it via `Prisma.SeasonGetPayload<...>`, so the cast can silently drift from the real query shape (found: 2026-09-01)
- [ ] `pages/seasons/index.tsx:45` — `(await res.json()) as SeasonSummary & { gameCount?: number }` casts an API response with no runtime check (found: 2026-09-01)
- [ ] `pages/dashboard.tsx:110` — `(await res.json()) as SaveSummary` — same unchecked fetch-response cast pattern (found: 2026-09-01)
- [ ] `lib/authOptions.ts:40`, `lib/prisma.ts:21`, `lib/stripe.ts:15` — all three use `new Proxy({} as X, {...})` for lazy singletons, copy-pasted three times with no shared helper (e.g. `lazySingleton<T>(factory)`) (found: 2026-09-01)
- [ ] `pages/api/seasons/index.ts:26-29` and `pages/api/seasons/[id].ts:17-20` — identical "free tier gets 402 PREMIUM_REQUIRED" block duplicated verbatim; extract a `requirePremium(userId, res)` helper alongside `lib/apiAuth.ts`'s `requireSession` (found: 2026-09-01)
- [ ] `pages/api/saves/[id].ts:12` and `pages/api/seasons/[id].ts:22` — identical `Array.isArray(req.query.id) ? req.query.id[0] : req.query.id` normalization duplicated; extract a `getQueryId(req)` helper (found: 2026-09-01)
- [ ] `pages/api/saves/index.ts:19` and `pages/api/seasons/[id].ts:32` — the same Prisma `select` object (and paired `SaveListItem` type) is duplicated between the two files; consolidate into one shared type + select constant (found: 2026-09-01)
- [ ] `components/scoring/scoring.tsx:10` and `pages/match.tsx:16` both independently define `const BALLS_PER_OVER = 6` — consolidate into a shared cricket-rules constants module (found: 2026-09-01)
- [ ] `pages/match.tsx` — `TOTAL_OVERS = 20` is local to `match.tsx` only; move alongside `BALLS_PER_OVER` in a shared module so other components don't reintroduce it as a literal `20` (found: 2026-09-01)
- [ ] `components/pitch/pitch-diagram.tsx:14` — `style={{ display: 'block' }}` is an inline style prop even though the rest of the codebase consistently uses `@emotion/styled`; convert to a styled wrapper or prop (found: 2026-09-01)
- [ ] `pages/match.tsx` — `formatOvers`/`formatRunRate` (lines 30-44) duplicate the ball/over math already memoized as `currentRunRate` (lines 56-63) and used again inline at 433/446/454; consolidate into one derived helper (found: 2026-09-01)
- [ ] `pages/_app.tsx:13-18` — `useEffect` writes `gameScore` to `localStorage` on every change with `[gameScore]` as the only dependency; since `gameScore` is a new reference on nearly every action dispatch, this fires a JSON.stringify + localStorage write on every ball scored — confirm this isn't unwanted write amplification (found: 2026-09-01)
- [ ] `public/icons/backup.txt` — leftover base64-encoded JSON export from an icon-collection tool, not a shipped asset; remove (found: 2026-09-01)
- [ ] `public/favicon/code.txt` — leftover raw HTML snippet copy-pasted from a favicon generator's instructions page, unused by the app; remove (found: 2026-09-01)
- [ ] `knip.json:11` `"jest-emotion"` in `ignoreDependencies` — package.json also lists the modern `@emotion/jest`; no source file references `jest-emotion` — re-verify and drop both the dependency and the ignore entry if truly unused (found: 2026-09-01)
- [ ] `knip.json:14` `"ts-node"` in `ignoreDependencies` — no reference to `ts-node` found anywhere in scripts, config files, or source; re-verify whether still needed (found: 2026-09-01)
- [ ] `knip.json:9` `"@testing-library/user-event"` in `ignoreDependencies` — no import of `user-event` found in any source file; re-verify whether still exercised indirectly (found: 2026-09-01)
- [ ] `knip.json:8` `"@babel/preset-env"` in `ignoreDependencies` — no `.babelrc`/`babel.config.*` exists and Jest runs via `next/jest` (SWC-based); re-verify whether still needed (found: 2026-09-01)
