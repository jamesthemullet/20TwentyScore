# /quality skill

You are running an incremental code quality improvement session for this Next.js / React / TypeScript project.

## Stack
- TypeScript strict mode (`tsconfig.json`)
- React 19 with functional components and hooks
- State managed via `context/GameContext.tsx` — reducer pattern with `GameScoreContext`, `OversContext`, `MostRecentActionContext`
- Emotion for styling (no raw `style=` props expected)
- Source files live in: `components/`, `context/`, `pages/`, `utils/`

## What to do each invocation

### Step 1 — Pick a category

Use the current second of the clock (or any arbitrary signal) to pick **one** of these four categories. Vary the selection — do not always pick the same one:

1. **Strict typing** — look for: explicit `any`, unsafe `as Type` casts, missing return type annotations on exported functions, non-null assertions (`!`) that could be replaced with proper guards, props typed as `object` or `{}`
2. **Code duplication** — look for: repeated logic blocks across components, identical conditional rendering patterns, values inlined 3+ times that should be a named constant
3. **Bad patterns** — look for: `useEffect` with missing or overly broad dependency arrays, state mutation instead of returning new values, magic numbers/strings, prop drilling more than 2 levels deep when a context hook already exists
4. **Dead code** — look for: exported symbols not imported anywhere in the project, commented-out code blocks left in files

### Step 2 — Find the best candidate

Read the relevant source files in `components/`, `context/`, `pages/`, and `utils/`. Identify the **single clearest, most impactful** instance of the chosen category. Prefer issues that:
- Are in frequently-used files
- Have an unambiguous fix
- Won't require changes across many files

### Step 3 — Fix it

Make the fix. Keep scope tight — one issue, one or two files. Do not refactor beyond what is needed to address the specific finding.

### Step 4 — Report

Output exactly this structure:

```
## Quality improvement

**Category:** <chosen category name>
**File:** <path:line>
**Issue:** <one sentence describing the problem>
**Fix:** <what was changed and why>
**Next suggestion:** <the next candidate worth tackling in this category, with file path>
```

## Known project patterns

- **Contexts and hooks:** `useGameScore()`, `useOvers()`, `useMostRecentAction()` are available — prop drilling past 2 levels is a smell since these hooks exist
- **Reducer:** Business logic should live in `gameReducer` inside `context/GameContext.tsx`, not scattered in components
- **Styling:** Emotion (`@emotion/styled`, `@emotion/react`) — inline `style=` props are a pattern to flag
- **`utils/` coverage gap:** `utils/` is intentionally excluded from Jest `collectCoverageFrom` — not a quality finding
- **Knip ignore list:** Several dependencies are intentionally listed in `knip.json` `ignoreDependencies` — do not flag these as unused
