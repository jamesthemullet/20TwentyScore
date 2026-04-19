# /test skill

You are running an iterative test-improvement session for this Next.js / React project.

## Stack
- Unit/integration tests: Jest + React Testing Library (`yarn test`)
- Coverage: v8, collected from `pages/**/*.tsx`, `components/**/*.tsx`, `context/**/*.tsx` (note: `utils/` is **not** in coverage config — that is itself a known gap)
- E2E tests: Playwright (may not be installed yet — check before using)

## What to do each invocation

### Step 1 — run the current test suite
```bash
yarn test --coverage 2>&1 | tail -60
```
Parse the coverage table. Identify the **lowest-coverage file** that has room to improve (prefer uncovered lines/branches over uncovered statements).

### Step 2 — audit for untested files
Files that have source code but no spec file are automatic coverage gaps. Known examples at project start:
- `components/core/buttons.tsx`
- `components/core/heading.tsx`
- `components/core/home-container.tsx`
- `components/core/players.tsx`
- `context/GameContext.tsx` (the unified reducer — high value target)
- `pages/index.tsx`
- `pages/_app.tsx`
- `utils/` directory (also missing from jest `collectCoverageFrom`)

### Step 3 — decide: unit or e2e improvement this round

**Unit/integration** (prefer when coverage < 80% on a file, or a file has no spec at all):
- Write or extend a `*.spec.tsx` next to the source file
- Use React Testing Library; import contexts directly from `context/GameContext.tsx`
- Follow patterns in `components/scoring/scoring.spec.tsx` for context wiring

**E2E** (prefer when unit coverage is healthy and you want to test user flows end-to-end):
1. Check if Playwright is installed: `npx playwright --version 2>/dev/null`
2. If not installed, install it:
   ```bash
   yarn add --dev @playwright/test
   npx playwright install --with-deps chromium
   ```
3. If no `playwright.config.ts` exists, create one targeting `http://localhost:3000`
4. Place e2e specs in `e2e/` at the repo root with suffix `.e2e.ts`
5. To run: start dev server in background first (`yarn dev &`), then `npx playwright test`

### Step 4 — implement the improvement
- Pick **one specific, meaningful improvement** per invocation (a new spec file, a new describe block, or new test cases filling a branch gap)
- Do not rewrite passing tests — only add or extend
- Keep tests focused: one behaviour per `it()` block
- Use `jest.fn()` for context callbacks, never mock internal modules
- For `GameContext.tsx` reducer tests: import `gameReducer` directly and test it as a pure function (no rendering needed for logic tests)

### Step 5 — verify
Run `yarn test --coverage 2>&1 | tail -60` again and confirm coverage moved in the right direction. Report:
- Which file(s) you improved
- Old vs new line/branch coverage for those files
- What the next logical improvement would be

## Coverage targets (per file)
| Priority | Target |
|----------|--------|
| `context/GameContext.tsx` | ≥ 90% lines |
| `components/core/*.tsx` | ≥ 80% lines |
| `pages/index.tsx` | ≥ 70% lines |
| All other files | ≥ 80% lines |

## Known project patterns
- Contexts exported from `context/GameContext.tsx`: `GameScoreContext`, `OversContext`, `MostRecentActionContext`, `GameProvider`
- Convenience hooks: `useGameScore()`, `useOvers()`, `useMostRecentAction()`
- `GameScore` type = `[Team, Team]`
- Default players helper: `defaultPlayers()` from `components/core/players`
- Jest config at `jest.config.ts` — if you add `utils/` to coverage, edit `collectCoverageFrom` there
- No Playwright config exists yet; create `playwright.config.ts` at repo root if needed
