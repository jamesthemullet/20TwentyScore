# /accessibility skill

You are running an incremental accessibility improvement session for this Next.js / React / TypeScript project.

## Product Context

- **Product:** A live cricket scoring and strategy app (20Twenty Score).
- **Stack:** Next.js, React 19, TypeScript strict mode, Emotion for styling
- **State:** Context/reducer pattern via `context/GameContext.tsx`
- **Source files:** `components/`, `context/`, `pages/`, `utils/`
- **Standard:** Target WCAG 2.1 AA compliance throughout.

## What to do each invocation

### Step 1 — Audit for accessibility issues

Read the source files in `components/`, `context/`, `pages/`, and `utils/`. Rotate through the four categories below on each invocation (use the current second of the clock, or another varying signal, to pick one):

1. **Focus management** — look for: `outline: 0` or `outline: none` without a custom `:focus-visible` replacement, interactive elements unreachable by keyboard, missing skip-navigation link, focus not moved to new content after route changes
2. **ARIA & roles** — look for: toggle buttons missing `aria-expanded`, interactive `div`/`span` elements without `role` and `tabIndex`, missing `aria-label` or `aria-labelledby` on icon-only buttons, live regions not using `role="status"` or `aria-live`, landmark regions missing (no `<main>`, `<nav>`, `<footer>`)
3. **Semantic HTML** — look for: `<p>` or `<div>` used where a heading (`<h1>`–`<h6>`) is appropriate, skipped heading levels, `<div>` used where `<button>` or `<a>` is correct, lists (`<ul>/<ol>`) missing from navigation groups, `<table>` usage without proper `<th scope>` and `<caption>`
4. **Colour contrast & text alternatives** — look for: foreground/background colour pairs below 4.5:1 (normal text) or 3:1 (large text ≥ 18 pt / 14 pt bold), `<img>` missing `alt`, decorative images with non-empty `alt`, meaningful SVGs lacking `aria-label` or `<title>`, icon images used as the only affordance without screen-reader text

### Step 2 — Find the best candidate

Identify the **single clearest, most impactful** issue in the chosen category. Prefer issues that:
- Are in frequently-used or shared components (`components/core/`, `components/nav/`, `components/header/`)
- Block keyboard-only or screen-reader users from core app flows
- Have an unambiguous, contained fix

### Step 3 — Fix it

Make the fix. Keep scope tight — one issue, one or two files. Do not refactor beyond what is needed to resolve the specific finding. Verify the change does not break existing passing tests by running:

```bash
yarn test --passWithNoTests 2>&1 | tail -20
```

### Step 4 — Report

Output exactly this structure:

```
## Accessibility improvement

**Category:** <chosen category name>
**WCAG criterion:** <e.g. 2.4.7 Focus Visible (AA)>
**File:** <path:line>
**Issue:** <one sentence describing the problem>
**Fix:** <what was changed and why>
**Next suggestion:** <the next candidate worth tackling in this or another category, with file path>
```

### Step 5 — Create a pull request

After reporting, commit the fix and open a PR:

1. Stage the changed file(s): `git add <file>`
2. Commit with a message following the pattern:
   `fix(a11y): <short description of fix> (WCAG <criterion>)`
3. Push the branch: `git push origin HEAD`
4. Create a PR with `gh pr create` targeting `main`, using this body template:

```
## Accessibility fix

**Category:** <category>
**WCAG criterion:** <criterion>

### Problem
<one sentence>

### Solution
<what changed>

### Testing
- [ ] All existing tests pass (`yarn test`)
- [ ] Verified with keyboard navigation
- [ ] Verified with a screen reader (or noted as untested)
```

## Known accessibility issues in this codebase (seed list)

- `components/core/buttons.tsx` — `SquareButton` has `&:focus { outline: 0 }` which removes the visible focus indicator (WCAG 2.4.7)
- `components/nav/nav.tsx` — `BurgerButton` now has `aria-expanded` and `aria-controls` ✓ (fixed)
- `components/header/header.tsx` — site title "20Twenty Score" is rendered as a `<p>` tag; it should be a semantic heading or, if purely decorative branding, a `<span>` — but the heading hierarchy of the page depends on this decision (WCAG 1.3.1)
- `pages/summary.tsx` — `BallIcon` `<img>` has alt="cricket ball" which is fine, but the `MatchCentre` section has no accessible heading to announce the score comparison section to screen readers
- `components/nav/nav.tsx` — the mobile dropdown `<ul>` is hidden via CSS (`display: none`) but does not use `aria-hidden` or `hidden` attribute, so its links remain in the accessibility tree when collapsed (WCAG 4.1.2)
- `pages/teams.tsx` — `InitialsBadge` conveys team identity via background colour alone with no text alternative visible to screen readers (WCAG 1.4.1)

## Known project patterns

- **Styling:** Emotion (`@emotion/styled`) — focus/hover styles live in the template literal passed to `styled.button`, `styled.a`, etc. Prefer `:focus-visible` over `:focus` for focus rings so mouse users are not disrupted.
- **Nav toggle state:** `isDropdownOpen` boolean in `components/nav/nav.tsx` already tracks open/closed — wire it to `aria-expanded` on the burger button.
- **Landmark regions:** `pages/*.tsx` use Emotion `styled.main` — the rendered element is a semantic `<main>`, which is correct. Verify `<header>` and `<footer>` are also present (they are via `components/header/header.tsx` and `components/footer/footer.tsx`).
- **Skip link pattern:** Add a visually-hidden-until-focused `<a href="#main-content">Skip to main content</a>` at the top of `components/layout/layout.tsx`, and an `id="main-content"` on the `<main>` element in each page.
- **Colour palette:** Primary dark `#1a1a1a` and `#333` on white pass 4.5:1. Secondary grey `#767676` on white sits at exactly 4.48:1 — borderline; verify usage context and bump to `#757575` or darker if used at small sizes.
