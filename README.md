# MK GitFlow

Learn Git by doing — an interactive branch simulator, tutorials, quizzes, a risk-tagged command reference, and a public-repo analyzer. Local-first, no accounts, no database.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org)

## Live links

- Production: **https://gitflow.mkazi.live** (custom domain — DNS pending)
- Current deployment: **https://mk-gitflow.vercel.app**
- Repository: https://github.com/mk-knight23/44-tool-github-desktop-guide

## What it does

MK GitFlow teaches Git the way you actually learn it: by running the moves and watching what happens to the graph.

- Type real Git commands — `commit`, `branch`, `checkout`, `merge`, `rebase`, `reset` — and watch an in-memory commit graph redraw live. Nothing runs a shell; the engine simulates Git in memory and draws the result.
- Work through guided tutorials for both GitHub Desktop and the command line, at beginner, intermediate, and advanced levels.
- Take short quizzes with per-question explanations to check what stuck.
- Look up any command in a reference that tags each one as safe, caution, or destructive, with plain-English notes and undo guidance.
- Point the analyzer at any public GitHub repo and get a documentation-health score with an actionable checklist.
- Optionally, ask an AI assistant to turn plain English into a command, explain an error, or plan a rebase. The AI is optional — every core feature works without it.

## Features

**Deterministic core (works fully offline, no keys):**

- **Branch simulator** (`/tool`) — an in-memory Git DAG engine with zero DOM dependencies, rendered as an SVG branch graph. Step-by-step undo/redo, time-travel across states, JSON export/import, a screen-reader command log, and a confirmation gate before destructive resets.
- **Guided tutorials** (`/tutorials`) — GitHub Desktop and CLI paths across three levels, with checkpoint progress saved locally.
- **Command reference** (`/reference`) — 40+ commands, each with syntax, a plain-English explanation, examples, a risk level (safe / caution / destructive), undo guidance, and its own detail page.
- **`.gitignore` generator** (`/gitignore`) — multi-select from 12+ bundled templates, fully offline.
- **Conventional Commit builder** (`/commits`) — a deterministic form with a live-formatted commit message.
- **Undo / recovery helper** (`/undo`) — a decision guide that maps "I did X, how do I undo it?" to the right recovery command.
- **Quizzes** (`/quiz`) — topic quizzes with explanations; results stored locally.
- **Repo analyzer** (`/analyzer`) — scores a public repo's docs health against a documented rubric using GitHub's unauthenticated REST API. Reads public data only, never sends a token.
- **Local dashboard & history** (`/dashboard`, `/history`) — your tutorial progress, quiz attempts, saved simulator sessions, and cached analyses, all from your own browser.

**Optional AI layer (graceful fallback when unavailable):**

- **AI assistant** (`/assistant`) — nine capabilities: natural-language-to-command, error explainer, merge-conflict explainer, rebase planner, branching-strategy advisor, commit-message-from-diff, PR-description drafter, release-notes generator, and CI-failure triage.
- Each capability shows an honest availability state. Where a deterministic equivalent exists (command lookup, commit builder, PR/release templates), the app falls back to it and labels the result as generated locally rather than by AI.
- Bring-your-own-key path: supply your own gateway key in the browser; it is sent per request and never stored or logged.

## Screenshots

The branch simulator (deterministic core) and the landing page. These are captured by the Playwright smoke test, not hand-made mockups.

![Branch simulator](public/screenshots/simulator.png)
![Landing page](public/screenshots/home.png)

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `src/` dir), React 19 |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS v4 (`@theme` tokens), system font stacks, no CDNs |
| Icons | lucide-react |
| Validation | Zod (all API input) |
| Persistence | IndexedDB via `idb` (local-first); localStorage for small prefs |
| AI (optional) | Vercel AI SDK v6 through AI Gateway model strings — no direct provider SDK |
| Unit tests | Vitest + Testing Library (jsdom) |
| E2E | Playwright (Chromium) |

No database. No accounts. No sign-up.

## Project structure

Every top-level `src/` folder and the important files inside it:

```
src/
  app/                          Next.js App Router: routes, layouts, metadata, SEO endpoints
    layout.tsx                  Root layout: global metadata, nav/footer shell, pre-paint theme script
    page.tsx                    Landing page
    globals.css                 Tailwind v4 theme tokens + design-system base styles
    loading.tsx                 Global loading UI
    error.tsx                   Root error boundary
    not-found.tsx               Custom 404 page
    sitemap.ts                  sitemap.xml generator
    robots.ts                   robots.txt generator
    opengraph-image.tsx         Static Open Graph image (next/og)
    twitter-image.tsx           Static Twitter card image
    tool/                       Branch simulator page
    analyzer/                   Public repo analyzer page
    assistant/                  AI assistant hub page
    tutorials/                  Tutorial index + [path]/[slug] runner pages
    reference/                  Command reference index + [command] detail pages
    guides/                     Long-form guides index + [slug] pages
    use-cases/                  Use-case index + [slug] pages
    quiz/                       Quiz index + [topic] runner pages
    undo/                       Undo helper index + [slug] scenario pages
    gitignore/                  .gitignore generator page
    commits/                    Conventional Commit builder page
    dashboard/                  Local activity dashboard
    history/                    Local history view
    settings/                   Settings (theme, motion, consent, BYOK key)
    docs/                       In-app documentation page
    faq/ changelog/             FAQ and changelog pages
    about/ creator/ contact/    About / creator / contact pages
    open-source/                Open-source info page
    privacy/ terms/ cookies/    Policy pages
    api/ai/[capability]/route.ts  Single server route handler for all nine AI capabilities

  components/                   React components, grouped by feature
    simulator/                  graph-canvas (SVG DAG renderer) + simulator-workspace (undo/redo/time-travel)
    analyzer/                   analyzer-workspace (repo scoring UI)
    assistant/                  assistant-workspace, capability-forms, result-views
    tools/                      commit-builder, gitignore-generator
    quiz/                       quiz-runner
    reference/                  reference-browser (search + risk filter)
    tutorials/                  tutorial-runner (checkpoint stepping)
    dashboard/                  dashboard-view
    history/                    history-view
    settings/                   settings-panel
    content/                    Guide/content primitives: callout, breadcrumb, ad-slot, consent-controls, guide-tracker
    shell/                      App chrome: site-nav, site-footer, consent-banner, theme-toggle, logo, icons
    seo/                        json-ld (<JsonLd> structured-data renderer)
    ui/                         Design-system primitives: button, confirm-dialog, copy-button, empty-state, page-header, risk-badge, terminal-panel

  content/                      Authored content stored as typed data (not MDX)
    guides/                     8 long-form guide modules + index registry + types
    use-cases/                  5 use-case modules + index registry + types
    faq.ts                      FAQ questions and answers
    changelog.ts                Changelog entries (honest record of what shipped)

  lib/                          Logic and datasets (framework-agnostic where possible)
    git-engine/                 In-memory Git DAG — the heart of the app (>90% test coverage)
      types.ts                  Data model (commits, branches, state)
      engine.ts                 commit/branch/checkout/merge/rebase/reset semantics
      apply.ts                  Operation dispatch + result message + risk level
      parse.ts                  Git-syntax text -> operation, with helpful errors
      layout.ts                 DAG -> lane/coordinate layout for the SVG
      sha.ts                    Deterministic 7-char pseudo-SHA (FNV-1a) for reproducible exports
      index.ts                  Public engine surface
    data/                       Static datasets: reference, tutorials, quizzes, undo-scenarios, gitignore-templates
    ai/                         Optional AI layer
      schemas.ts                Zod input schemas per capability
      client.ts                 Browser-side fetch client
      byok.ts                   Bring-your-own-key storage (browser only)
      quota.ts                  Client-side daily quota counter
      fallbacks.ts              Deterministic, clearly-labeled non-AI results
      catalog.ts                Capability metadata for the assistant UI
      types.ts                  Shared AI types
      server/                   Server-only: handler, models, prompts, output-schemas, rate-limit
    storage.ts                  IndexedDB wrapper (idb)
    analytics.ts                Typed, consent-gated Google Tag Manager data layer
    analyzer.ts                 GitHub repo scoring: pure rubric + fetch layer
    seo.ts                      Metadata helpers
    jsonld.ts                   Structured-data builders
    site.ts                     Site constants (name, URLs, nav)
    theme.ts                    Theme and motion preferences
```

## Getting started

**Prerequisites:** Node 20 or newer (the app is built and deployed on Node 22 LTS) and [pnpm](https://pnpm.io) 9+.

```bash
pnpm install        # install dependencies
pnpm dev            # start the dev server at http://localhost:3000
pnpm build          # production build (next build)
pnpm test           # run the unit test suite (vitest)
```

Other useful scripts:

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test:coverage  # unit tests with coverage
pnpm e2e            # Playwright smoke test (build first; serves on port 3105)
```

Every deterministic feature works with no environment variables set.

## Environment variables

Every variable is **optional**. The app builds and every core tool works with none of them set — the AI assistant simply shows a graceful "unavailable" state and falls back to deterministic results where one exists. See [`.env.example`](.env.example) for the full commented list.

| Variable | Purpose | Required? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap, and Open Graph URLs. | No — defaults to `https://gitflow.mkazi.live` |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key for local dev or self-hosting. On Vercel, the gateway authenticates via an injected OIDC token, so this is not needed there. | No — unset means AI degrades honestly |
| `AI_MODEL` | Fast-tier gateway model string (NL-to-command, commit-from-diff). | No — has a default |
| `AI_MODEL_QUALITY` | Quality-tier gateway model string (explanations, planning, drafting). | No — has a default |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container id. Unset means analytics is fully disabled (no script loads). Even when set, GTM loads only in production and only after explicit consent. | No |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Ad-slot toggle (prepared, off). No ad script loads unless this is `true`. | No — defaults to `false` |

The bring-your-own-key value is never an environment variable: it lives only in the browser and is sent per request in an `x-byok-key` header, never stored or logged.

## Privacy

MK GitFlow is local-first by design. What you do stays in your browser:

- Tutorial progress, quiz attempts, simulator sessions, and cached repo analyses are stored in your browser's IndexedDB. They never touch a server — there is no server database.
- Small preferences (theme, reduced-motion, consent choice, and any BYOK key) live in localStorage.
- The simulator never executes shell commands. It only simulates Git in memory and displays commands with copy buttons.
- The repo analyzer reads public GitHub data only and never sends a token.
- AI request content is processed transiently and is never stored or logged server-side.
- Analytics stay fully disabled until you accept them, and never carry command text, repo names, quiz content, or keys.

More detail in [docs/PRIVACY.md](docs/PRIVACY.md) and [docs/SECURITY.md](docs/SECURITY.md).

## Deployment & launch guide

### Why Vercel

MK GitFlow deploys as a standard Next.js app. **Vercel** is the recommended platform and the one used here because:

- It builds and runs Next.js natively — no adapter or custom config.
- The free tier covers this project comfortably.
- The optional AI routes run as serverless functions with zero setup, and the AI Gateway authenticates automatically via an injected OIDC token (no key to manage in production).
- Every push gets a preview deployment, and production promotes an immutable build you can roll back instantly.

Netlify and Cloudflare Pages can also run Next.js and are viable alternatives, but Vercel is the path documented and used for this project.

### Deploy it

1. **Fork or clone** this repository.
2. In the [Vercel dashboard](https://vercel.com/new), **import** the repo. Vercel auto-detects Next.js; keep the defaults (install `pnpm install`, build `pnpm build`).
3. **Set environment variables** if you want them — all are optional. To point canonicals at your domain, set `NEXT_PUBLIC_SITE_URL`. Leave the rest unset to launch with the full deterministic app.
4. **Deploy.** Vercel gives you a `*.vercel.app` URL (currently `mk-gitflow.vercel.app`). Verify it there before attaching a custom domain.

### Custom domain — `gitflow.mkazi.live`

1. In the Vercel project, open **Settings → Domains** and add `gitflow.mkazi.live`.
2. At the DNS provider (**Cloudflare** for `mkazi.live`), add the record Vercel asks for:

   ```
   Type: A
   Name: gitflow
   Value: 76.76.21.21
   ```

   Set it to **DNS only** (grey cloud, unproxied) so Vercel can complete verification and issue the certificate.
3. Vercel **auto-issues SSL** once the record resolves. The domain goes live at `https://gitflow.mkazi.live`; this is the "DNS pending" step noted at the top.

### Future: a standalone domain

The candidate standalone domain is **`mkgitflow.com`**. To move there later without breaking the subdomain:

1. Buy `mkgitflow.com` and add it as a domain on the **same** Vercel project.
2. Set `mkgitflow.com` as the primary domain and update `NEXT_PUBLIC_SITE_URL` to match so canonicals and the sitemap follow.
3. Keep `gitflow.mkazi.live` attached and configure it to **redirect** to `mkgitflow.com` in Vercel's domain settings, so existing links keep working.

## Documentation

Deeper reference docs live in [`docs/`](docs/):

- [Product spec](docs/PRODUCT_SPEC.md) · [Architecture](docs/ARCHITECTURE.md) · [AI architecture](docs/AI_ARCHITECTURE.md) · [Database rationale](docs/DATABASE.md)
- [Design system](docs/DESIGN_SYSTEM.md) · [Deployment](docs/DEPLOYMENT.md) · [Test report](docs/TEST_REPORT.md) · [Audit](docs/AUDIT.md)
- [Privacy](docs/PRIVACY.md) · [Security](docs/SECURITY.md) · [SEO plan](docs/SEO_PLAN.md) · [Analytics plan](docs/ANALYTICS_PLAN.md) · [Monetization plan](docs/MONETIZATION_PLAN.md)

The release history is in [CHANGELOG.md](CHANGELOG.md).

## Roadmap

A few honest near-term items:

- Wire the AI Gateway key end-to-end so the assistant is live in production (deterministic fallbacks ship today).
- Add more guides and worked examples, especially around advanced history rewriting.
- Embed small simulator scenes directly inside tutorial steps.
- Attach the standalone `mkgitflow.com` domain once acquired.

Non-goals for now: no shell execution ever, no accounts, no server database, no GitHub writes.

## About the creator

Built and maintained by **Kazi Musharraf** — AI Engineer, Full-Stack Developer, Open-Source Builder.

- GitHub: [@mk-knight23](https://github.com/mk-knight23)
- Portfolio: [mkazi.live](https://www.mkazi.live)

## License

MIT © 2026 Kazi Musharraf. See [LICENSE](LICENSE).

---

Built and maintained by Kazi Musharraf. Open source for everyone.
