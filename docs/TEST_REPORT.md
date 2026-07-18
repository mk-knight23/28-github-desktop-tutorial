# TEST_REPORT.md — MK GitFlow

Real results from the local verification run on branch `rebuild/v2`. These are actual
command output summaries, not aspirations (STANDARDS §15). Regenerate with the commands
shown.

- Date: 2026-07-18
- Node 22 / pnpm 11 · Next.js 16.2.10 · Vitest 4.1.10 · Playwright 1.61.1
- Status: **all gates green** (typecheck, lint, unit, build, e2e).

## 1. Typecheck — PASS

```
$ pnpm typecheck        # tsc --noEmit
(no errors)
```

## 2. Lint — PASS

```
$ pnpm lint             # eslint . --ignore-pattern '_legacy_reference/**'
(no errors, no warnings)
```

## 3. Unit tests (Vitest) — PASS

```
$ pnpm test:coverage    # vitest run --coverage
 Test Files  25 passed (25)
      Tests  276 passed (276)
```

### Coverage (provider: v8, scope: `src/lib/**`)

| Metric | Coverage | Ratio |
|---|---|---|
| Statements | 87.56% | 1049/1198 |
| Branches | 77.11% | 593/769 |
| Functions | 89.51% | 205/229 |
| Lines | 89.71% | 933/1040 |

Key modules:

| Area | Stmts | Lines | Notes |
|---|---|---|---|
| `src/lib/git-engine/**` | 96.23% | 98.52% | Most-tested code; threshold (≥90%) enforced in `vitest.config.ts`. |
| `src/lib` (analytics, analyzer, commit-builder, storage, seo, jsonld, theme) | 90.16% | 93.65% | — |
| `src/lib/ai` (schemas, client, byok, quota, fallbacks, catalog) | ~91% | ~95% | — |

Uncovered by design: `src/lib/ai/server/{handler,models,prompts}.ts` (thin Vercel AI
Gateway plumbing — the deterministic fallback logic they wrap *is* covered in
`fallbacks.ts`), and `types.ts` (type-only declarations). These call an external gateway
and are exercised by the AI route at runtime rather than in unit tests.

### What is tested

- **git-engine** — commit/branch/checkout/merge/rebase/reset semantics, command parsing
  with error suggestions, DAG layout, and deterministic SHA generation.
- **generators** — `.gitignore` templates (dedup/merge), Conventional Commit builder,
  SHA generator.
- **analyzers** — `analyzer.ts`: pure scoring rubric across grade boundaries plus the
  network path (success, rate-limit, 404, network failure) via a mocked `fetch`.
- **data integrity** — reference (≥40 commands, unique slugs, destructive entries carry
  consequences, related slugs resolve), tutorials (all path×level combos, ≥5 steps),
  undo scenarios (≥8, destructive steps carry consequences), quizzes.
- **AI** — input schemas (limits, trim, enums, registry exhaustiveness), output schemas
  (nullable/required, enum rejection), the typed `callAi` client (BYOK header, error
  mapping, abort), BYOK storage, capability catalog.
- **storage / quota / analytics-noop** — IndexedDB wrapper, daily quota counter, and the
  consent-gated analytics no-op.
- **seo / jsonld / theme** — metadata builder, all structured-data builders, and
  theme/motion preference resolution.

## 4. Production build — PASS

```
$ pnpm build            # next build
✓ Compiled successfully in 2.7s
✓ Generating static pages (110/110)
```

110 routes prerendered (static + SSG). Zero type or build errors.

## 5. End-to-end smoke (Playwright) — PASS

```
$ pnpm exec playwright test     # serves the production build on port 3105
Running 10 tests using 5 workers
  8 passed
  2 skipped
```

Two Chromium projects (`chromium-desktop` 1280×800, `mobile-chrome` Pixel 5). The 2
skips are intentional project guards (the screenshot capture runs desktop-only; the
overflow check runs mobile-only). Covered:

- Simulator primary flow: run `commit` / `checkout -b` via the Run button, command log
  and STEP counter update, graph SVG renders after the first commit.
- Invalid input shows an inline error (never a dead end).
- Keyboard pass: the skip link is the first Tab stop; a command is typed and submitted
  entirely from the keyboard.
- Mobile viewport: simulator usable, no horizontal overflow, commit works.
- README screenshots captured to `public/screenshots/`.

## 6. Security checks

```
$ pnpm audit --prod
1 vulnerabilities found — Severity: 1 moderate
  postcss <8.5.10 (GHSA-qx2v-qp2m-jg93), path: .>next>postcss
```

**Assessment:** transitive, pinned by Next.js, and build-time only (PostCSS CSS
stringify). The app does not process untrusted CSS at runtime, so it is not exploitable
here. Non-blocking; surface it with `pnpm audit --prod` before shipping. Resolves when
Next bumps its bundled PostCSS.

## 7. Reproduce

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm build
pnpm exec playwright install chromium   # first run only
pnpm exec playwright test               # uses port 3105
pnpm audit --prod                       # advisory report
```
