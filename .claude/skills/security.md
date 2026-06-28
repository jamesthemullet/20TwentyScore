# /security skill

You are running a security audit session for this Next.js / React / TypeScript project.

## Product Context

- **Product:** A live cricket scoring and strategy app.
- **Stack:** Next.js, React 19, TypeScript strict mode, Emotion for styling
- **State:** Context/reducer pattern via `context/GameContext.tsx`
- **Source files:** `components/`, `context/`, `pages/`, `utils/`, `public/`

## What to do each invocation

### Step 1 — Audit for security issues

Read the source files in `components/`, `context/`, `pages/`, `utils/`, and config files at the root (`next.config.js`, `next.config.ts`, `package.json`, `.env*`). Look across all of these categories:

1. **XSS / injection** — `dangerouslySetInnerHTML` without sanitisation, user-controlled values injected into `eval`, `new Function`, or `innerHTML`, dynamic `href`/`src` attributes built from unsanitised input
2. **Sensitive data exposure** — secrets or API keys hardcoded in source files or committed `.env` files, tokens logged to the console, PII stored in `localStorage`/`sessionStorage` without encryption
3. **Dependency risks** — packages with known CVEs (run `yarn audit` and report HIGH/CRITICAL only), use of abandoned packages with no recent releases
4. **Next.js / HTTP security** — missing or weak security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), open redirects in route handlers or `getServerSideProps`, SSRF risks in server-side fetches
5. **Auth / access control** — unprotected API routes or pages that should require authentication, insecure cookie flags (`HttpOnly`, `Secure`, `SameSite`), overly permissive CORS configuration
6. **Input validation** — form inputs or query params used without validation or sanitisation before being passed to state, APIs, or the DOM

### Step 2 — Supplement with automated checks

Run the following and include any HIGH or CRITICAL results in your findings:

```bash
yarn audit --level high 2>&1 | tail -20
```

### Step 3 — Classify findings

For each finding, assign a severity:

- **Critical** — exploitable vulnerability with direct user/data impact (e.g. XSS, exposed secret, unprotected authenticated route)
- **Major** — significant risk that needs its own focused fix (e.g. missing CSP headers, insecure cookie config, HIGH/CRITICAL CVE dependency)
- **Minor** — hardening improvement or low-risk gap (e.g. missing `Referrer-Policy`, console log of non-sensitive data, informational `yarn audit` finding)

### Step 4 — Decide issue strategy

- If there are **no findings worth reporting**: state that clearly and stop. Do not create issues.
- **Critical and Major findings**: one GitHub issue **per finding** — these warrant individual attention and focused PRs.
- **Minor findings**: group all minor findings into a **single bundled GitHub issue**.

### Step 5 — Report

Output this structure before creating any issues:

```
## Security audit

**Findings:**

| Severity | File / Area | Finding |
|----------|-------------|---------|
| Critical/Major/Minor | path:line or "next.config" / "dependencies" | one-sentence description |
...

**Issue strategy:** <one sentence explaining how issues will be grouped>
```

If there are no findings:

```
## Security audit

No security issues found worth reporting. The project is in good shape.
```

Then stop — do not create any issues.

### Step 6 — Create GitHub issues

Use the `gh` CLI to create issues as determined in Step 4.

**For a Critical or Major finding (one issue per finding):**

```bash
gh issue create \
  --title "Security: <short description>" \
  --label "security" \
  --body "## Security finding

**Severity:** Critical / Major
**File:** <path:line or area>
**Issue:** <what the vulnerability or risk is>
**Impact:** <what an attacker or misconfiguration could cause>
**Fix:** <recommended change or remediation>"
```

**For bundled minor findings:**

```bash
gh issue create \
  --title "Security: minor hardening improvements (bundled)" \
  --label "security" \
  --body "## Minor security hardening

The following low-risk improvements were identified during a security audit:

### <file:line or area>
- **Issue:** <description>
- **Fix:** <recommended change>

### <file:line or area>
- **Issue:** <description>
- **Fix:** <recommended change>
"
```

Report each issue URL once created.

## Known project patterns

- **No backend / API routes:** This is a client-side Next.js app — auth and server-side attack surface is minimal; focus is on XSS, client-side data exposure, and HTTP headers
- **No user authentication:** The app has no login flow — skip auth/session findings unless a future auth library is detected in `package.json`
- **Public scoring state:** Game state is ephemeral in-memory context — no persistence layer to audit for injection
- **`next.config`:** Security headers should be configured here via the `headers()` async function; flag their absence if not present
- **`yarn audit`:** Report only HIGH and CRITICAL CVEs; ignore low/moderate to reduce noise
