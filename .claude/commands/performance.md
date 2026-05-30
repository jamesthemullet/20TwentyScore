# /performance skill

You are running a performance audit session for this Next.js / React / TypeScript project.

## Product Context

- **Product:** A live cricket scoring and strategy app.
- **Stack:** Next.js, React 19, TypeScript strict mode, Emotion for styling
- **State:** Context/reducer pattern via `context/GameContext.tsx`
- **Source files:** `components/`, `context/`, `pages/`, `utils/`

## What to do each invocation

### Step 1 — Audit for performance issues

Read the source files in `components/`, `context/`, `pages/`, and `utils/`. Look across all four of these categories simultaneously:

1. **Unnecessary re-renders** — components missing `React.memo`, `useMemo`, or `useCallback` where referential identity causes cascading re-renders; context providers exposing objects/arrays that are recreated on every render
2. **Bundle size** — large imports that could be tree-shaken or lazy-loaded (`dynamic()` in Next.js), unused dependencies pulled into client bundles, heavy libraries where lighter alternatives exist
3. **Expensive computations** — derived values recalculated on every render that should be memoised, sorting/filtering/mapping inside render without `useMemo`, utilities in `utils/` called redundantly
4. **Next.js / network** — pages missing `getStaticProps`/`getServerSideProps` where they could benefit, images not using `next/image`, missing `key` props causing list reconciliation thrash, layout shift sources

### Step 2 — Classify findings

For each finding, assign a severity:

- **Minor** — small win, low risk (e.g. add a `key` prop, wrap a small derived value in `useMemo`)
- **Significant** — meaningful impact, moderate scope (e.g. memoising a context value object, lazy-loading a heavy component)

### Step 3 — Decide issue strategy

- If there are **no findings worth reporting**: state that clearly and stop. Do not create issues.
- If all findings are **minor**: group them into a single GitHub issue.
- If any finding is **significant**: create a **separate GitHub issue per significant finding**. Bundle any remaining minor findings into one additional issue (omit if there are none).

### Step 4 — Report

Output this structure before creating any issues:

```
## Performance audit

**Findings:**

| Severity | File | Finding |
|----------|------|---------|
| Minor/Significant | path:line | one-sentence description |
...

**Issue strategy:** <one sentence explaining how issues will be grouped>
```

If there are no findings:

```
## Performance audit

No performance issues found worth reporting. The app is in good shape.
```

Then stop — do not create any issues.

### Step 5 — Create GitHub issues

Use the `gh` CLI to create issues as determined in Step 3.

**For a significant finding (one issue per finding):**

```bash
gh issue create \
  --title "Perf: <short description>" \
  --label "performance" \
  --body "## Performance finding

**Severity:** Significant
**File:** <path:line>
**Issue:** <what the problem is>
**Impact:** <what slow/expensive behaviour this causes>
**Fix:** <recommended change>"
```

**For bundled minor findings:**

```bash
gh issue create \
  --title "Perf: minor improvements (bundled)" \
  --label "performance" \
  --body "## Minor performance improvements

The following small wins were identified during a performance audit:

<for each minor finding>
### <file:line>
- **Issue:** <description>
- **Fix:** <recommended change>
</for each>
"
```

Report each issue URL once created.

## Known project patterns

- **Contexts:** `useGameScore()`, `useOvers()`, `useMostRecentAction()` — their providers in `GameContext.tsx` are high-value targets for memoisation checks since they wrap the whole app
- **Reducer:** `gameReducer` dispatches may trigger broad re-renders if context value objects are not stable
- **Styling:** Emotion — `styled` components defined inside render functions recreate the component on every render; they must be defined at module scope
- **Pages:** Next.js pages in `pages/` — check whether static generation opportunities are missed
