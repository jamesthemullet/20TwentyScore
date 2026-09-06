---
name: product-roadmap
description: Build or refresh a product roadmap for 20TwentyScore — new features, pages, and content, PLUS making existing content easier to find, SEO, and improvements to features/pages that already exist — grounded in what the app already has. Writes a plain markdown ROADMAP.md at the repo root, grouped into Now/Next/Later, with each feature broken into a sequence of ~15-minute-reviewable PR steps. Use when the user asks for a roadmap, growth ideas, "what should we build next", or to update/rescope the existing roadmap.
---

# Product roadmap

Produces (or refreshes) **`ROADMAP.md`** at the repo root for `20TwentyScore`: a Next.js
ball-by-ball T20 cricket scorecard app (React Context + `useReducer`, Emotion CSS-in-JS). The
README describes it as localStorage-only, but `package.json` already carries `next-auth`,
`@prisma/client` + `pg` (Postgres), and `stripe` — real infra that isn't reflected in the current
feature set yet, likely mid-build. Roadmap items are scored against what actually grows and
deepens engagement with a scoring app. Covers more than new features:

- **Findability** — once matches can be saved server-side (not just localStorage), making past
  matches easy to find again: a match list, search by team/date.
- **SEO** — largely an app, not content-marketing surface; SEO plays here are limited (e.g. a
  public shareable scorecard page) rather than blog-style content.
- **Improving what already exists** — the ball-by-ball scoring engine and localStorage save/load
  are real and live; extending them (not replacing) is often the right move.

## Grounding the roadmap in the real app

- `README.md` — features: runs/wickets/overs tracking, ball-by-ball scoring, batting/bowling
  tracking, extras, localStorage save/load.
- `AUDIT.md` if present — don't duplicate known bugs/gaps as roadmap features.
- `package.json` — **check what's actually wired up vs. just installed** before assuming a
  feature exists: `next-auth`/`@prisma/client`/`pg`/`stripe` are dependencies, but the README's
  feature list (still localStorage-only) suggests they may not be fully integrated yet — verify
  in `prisma/`, `pages/api/`, and `context/` before proposing something that assumes accounts,
  DB persistence, or payments already work end-to-end.
- `prisma/` (schema), `context/` (state management), `pages/`, `lib/`, `utils/`, `types/` — real
  structure to extend.

## Output format

Plain markdown. Write directly to `ROADMAP.md` at the repo root, overwriting the previous
version. Structure: intro + 4 goal-tag lenses (Acquisition/Engagement/Retention/Fun) →
PR-sequence explainer → Now/Next/Later sections, each feature as `### N. Name — *Goal tags*` +
description + numbered PR-step list → Mise en place table (if any infra proposed) → footer
`*20TwentyScore — product roadmap, <date>*`.

## Breaking a feature into PR steps

Sequence data/logic → UI → wiring, splitting wherever a step could stand alone:

- A Prisma schema/migration is its own step.
- A pure function (scoring math, a formatter) plus its unit tests is its own step.
- New UI is its own step, built against existing or stubbed data.
- A step needing new written content (rules explainer copy) gets a GitHub issue via
  `mcp__github__create_issue` rather than a PR.
- No feature-flag system exists here — don't propose gating behind flags.
- If a feature is small enough that splitting produces nothing independently reviewable, write
  **"One PR."** instead.

## Notes

- Personal/small project, still early — keep proposals proportionate to what's actually wired up
  today, not what the installed dependencies merely make possible.
- Don't re-propose anything already tracked as an open item in `AUDIT.md`.
- Do not commit, push, or open a PR for `ROADMAP.md` changes unless the user explicitly asks.
