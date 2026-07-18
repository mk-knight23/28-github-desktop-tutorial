# ARCHITECTURE.md — MK GitFlow

How the app is put together, why the pieces are shaped this way, and where the
boundaries are. Pairs with [PRODUCT_SPEC.md](PRODUCT_SPEC.md), [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md),
and [DATABASE.md](DATABASE.md).

## 1. Shape at a glance

MK GitFlow is a **local-first Next.js App Router app**. Almost everything runs in the
browser; the only server code is a small set of AI proxy routes. There is no database
and no server-side storage of user content (see DATABASE.md).

```
Browser (React 19, client components)
  ├─ Deterministic core: git-engine, generators, analyzers  ── pure TS, no network
  ├─ Local persistence: IndexedDB (idb) + localStorage prefs
  └─ AI client ── fetch ──▶ /api/ai/[capability] (server)
                              └─ zod validate → rate limit → quota → Vercel AI Gateway
GitHub REST v3 (unauthenticated) ◀── analyzer fetches public repo data directly
```

## 2. Rendering strategy

- **App Router, `src/` dir, TypeScript strict.** Content pages (landing, guides,
  use-cases, reference, FAQ, policy pages) are server components, statically prerendered
  where possible (`next build` reports ~110 static/SSG routes). This keeps them fast and
  fully indexable.
- **Interactive workspaces** (`/tool`, `/analyzer`, `/gitignore`, `/commits`, `/undo`,
  `/assistant`, `/settings`, quiz runner) are client components mounted inside server
  page shells that own the `metadata` export.
- **Dynamic routes** use `generateStaticParams`: `/reference/[command]`,
  `/guides/[slug]`, `/use-cases/[slug]`, `/tutorials/[path]/[slug]`, `/undo/[slug]`,
  `/quiz/[topic]`.
- **No-flash theming:** an inline pre-paint script in `layout.tsx` sets
  `data-theme` from the stored pref before first paint; dark is the default.

## 3. Directory map

```
src/
  app/                      Route tree (pages + metadata + route handlers)
    api/ai/[capability]/    Single AI route handler for all nine capabilities
    sitemap.ts robots.ts    SEO endpoints
    opengraph-image.tsx     Static OG image (next/og)
    error.tsx not-found.tsx Root error boundary + custom 404
  components/
    simulator/              Graph canvas + simulator workspace (client)
    analyzer/ assistant/    Feature workspaces (client)
    tools/                  gitignore generator, commit builder
    content/ shell/ ui/     Guide primitives, nav/footer, design-system components
    seo/                    <JsonLd> renderer
  content/                  Authored content as typed data (guides, use-cases, faq, changelog)
  lib/
    git-engine/             In-memory Git DAG: types, engine, apply, parse, layout, sha
    data/                   Static datasets: reference, tutorials, quizzes, undo-scenarios, gitignore-templates
    ai/                     schemas, client, byok, quota, fallbacks, catalog, types
      server/               handler, models, prompts, output-schemas, rate-limit (server-only)
    storage.ts              IndexedDB wrapper (idb)
    analytics.ts            Typed, consent-gated GTM data-layer
    analyzer.ts             GitHub repo scoring (pure rubric + fetch layer)
    seo.ts jsonld.ts site.ts theme.ts   Metadata, structured data, constants, prefs
```

## 4. The Git engine (the heart)

`src/lib/git-engine/` is a **pure TypeScript module with zero DOM dependencies** — the
most-tested code in the repo (>90% coverage, enforced by `vitest.config.ts`).

- **Immutable state.** Every operation returns a *new* `GitState`; nothing is mutated in
  place. This is what makes step-by-step undo/redo and time-travel a trivial array of
  states plus a cursor (see `simulator-workspace.tsx`).
- **Modules:** `types.ts` (data model), `engine.ts` (commit/branch/checkout/merge/
  rebase/reset semantics, incl. fast-forward vs. true two-parent merges and rebase
  replays that mint new ids while marking old commits abandoned), `apply.ts` (operation
  dispatch + human-readable result message + risk level), `parse.ts` (git-syntax text →
  operation, with helpful errors and suggestions), `layout.ts` (DAG → lane/coordinate
  layout for the SVG), `sha.ts` (deterministic 7-char pseudo-SHA via FNV-1a so exports
  reproduce exactly).
- **Rendering is separate.** `components/simulator/graph-canvas.tsx` consumes the layout
  and draws the SVG. The engine never imports React.

## 5. AI layer

One route handler (`app/api/ai/[capability]/route.ts`) serves all nine capabilities. The
flow is: **zod input validation → per-IP token-bucket rate limit → anonymous quota check
→ `generateObject`/`streamText` via a Vercel AI Gateway model string → typed response**.
Input and output schemas live in `lib/ai/schemas.ts` and `lib/ai/server/output-schemas.ts`
and are keyed by capability slug so the set stays exhaustive at the type level. When the
gateway is unavailable, the client renders an honest "AI unavailable" state plus a
deterministic fallback where one exists. Full detail in [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md).

## 6. Persistence

- **IndexedDB** (via `idb`, behind `lib/storage.ts`) holds everything substantial:
  tutorial progress, quiz attempts, simulator sessions, cached analyses, AI history, and
  the daily AI quota counter.
- **localStorage** holds only tiny prefs: theme, motion, consent, history-disabled flag,
  and the BYOK key (browser-only, never sent except as a per-request header).
- No server persistence exists. See DATABASE.md for the rationale.

## 7. Analyzer

`lib/analyzer.ts` splits into a **pure scoring rubric** (`scoreRepo`, unit-tested without
network) and a **fetch layer** (`analyzeRepo`) that calls GitHub REST v3 unauthenticated.
It reads only public data, never sends a token, and maps 404 / rate-limit / network
failures to an honest discriminated `AnalyzerOutcome` the UI can render truthfully.

## 8. Styling & theming

Tailwind CSS v4 with the design tokens defined verbatim in `globals.css` (from
[DESIGN_SYSTEM.md §12](DESIGN_SYSTEM.md)). Components use semantic token classes only
(`bg-surface`, `text-fg`, `stroke-lane-2`, …) — raw hex in components is a review-blocking
violation. System font stacks only; no external font/asset CDNs. Motion respects
`prefers-reduced-motion` with a user override.

## 9. Security posture

Security headers (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options)
are set in `next.config.ts`. The CSP's documented exceptions (`'unsafe-inline'` for the
theme/bootstrap scripts, GTM/GA and `api.github.com` in `connect-src`) are explained
inline. All API input is zod-validated with size limits. See [SECURITY.md](SECURITY.md).

## 10. Key decisions & trade-offs

- **No database in v1.** The product is genuinely local-first; a server DB would add
  operational surface with no user benefit yet. (DATABASE.md)
- **Gateway model strings, not a provider SDK.** Swapping models is a config change, not
  a code change, and no provider package is bundled.
- **CSS/SVG motion over framer-motion.** Avoids a dependency until a documented need
  arises (PRODUCT_SPEC §4 non-goals).
- **Content as typed data, not MDX.** Guides/use-cases are typed TS/TSX modules, giving
  type-checked internal links and structured data without an MDX toolchain.
