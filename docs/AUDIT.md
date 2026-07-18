# AUDIT.md — MK GitFlow (44-tool-github-desktop-guide)

Audit performed by Agent A (evidence-based, spot-checked by Agent B) on 2026-07-17.
Source of truth: `/Users/mkazi/Tools/_shared/audits/44-tool-github-desktop-guide.json`.

## 1. What this repo actually is

"GitFlow | Interactive Version Control Schematic 2026" — a single static React landing
page presenting the GitHub Desktop workflow as a 4-node clickable schematic
(Initialize → Feature Branch → Commit → Pull Request). Despite the "MK GitFlow"
platform direction, there is **no simulator, no command-explanation engine, no repo
analyzer, and no AI anywhere in the code**. The real app is one presentational page:
`src/App.tsx` (177 lines) with a single `useState` for the active card.

- Stack: React 19 + Vite 6 + TypeScript 5.7 (strict) + Tailwind CSS v4 (`@tailwindcss/vite`) + framer-motion + lucide-react.
- Real code: ~290 LOC (`App.tsx` 177, `main.tsx` 10, `index.css` 24, `index.html` 59).
- Build: PASS (tsc + vite build, 1.79s, 327.95 kB bundle / 103.93 kB gzip). Type-check: PASS.
- Tests: **none**. No test script, no framework, no test files. `ci.yml` runs `npm test`, which always fails.
- Analytics: none. Deployment: live at `https://44-tool-github-desktop-guide.vercel.app/` (client-rendered; crawlers see an empty `#root` — zero indexable content, verified).

## 2. Working features (legacy)

1. Interactive 4-step workflow schematic with active-state highlight (`src/App.tsx:5-10, 58-83`).
2. Framer-motion entrance animations + animated progress bar.
3. Static terminal-style git command snippet panel (`src/App.tsx:104-115`).
4. Blueprint-grid dark theme, custom Tailwind v4 token `--color-git: #f05032`, `.node-card` class (`src/index.css`).
5. Complete SEO head in `index.html` (meta/OG/Twitter/JSON-LD) — but URLs point at the wrong repo.
6. Skip-to-main accessibility link; responsive Tailwind layout.

## 3. Broken / fabricated (legacy)

- Nav links (`Guides`, `Tutorials`, `CLI Ref`, `Community`) are dead `href="#"` anchors; "Share Guide" button and footer icons do nothing.
- `src/lib/*` are fake "production utility" stubs (validator always returns `{valid:true}`, `memoize` is an identity fn); none imported anywhere.
- CI is permanently red (`npm test` with no test script); `pages.yml` has a malformed expression (`steps:deployment` — colon instead of dot).
- Identity confusion: `package.json` name/repository/homepage, `vite.config.ts` base path, and all OG/JSON-LD URLs reference a **different repo** (`28-github-desktop-tutorial`) — GitHub Pages assets 404 (verified against the built `dist/`).
- `Chart.yaml` + `k8s-deployment.yaml` describe a fake "payment-gateway-service" from an unrelated project; `_config.yml` is an irrelevant Jekyll config.
- `docs/` holds 70 markdown files, mostly auto-generated duplicates (`_1_1_1_1` suffixes) including **fabricated API documentation** (Bearer-auth REST API at `api.example.com` that does not exist).
- README claims a "24/7 autonomous evolution system", Gitleaks scans, a SECURITY.md (absent), Snyk scanning, security headers — none of it exists.
- UI copy contains a fabricated statistic ("teams reduce merge conflicts by 40%") and a leftover "28/30 DISPATCHED" footer from a different project series.
- `public/manifest.json` is the stock Create React App sample.

## 4. Security findings

- **No hardcoded secrets** found (grep across ts/tsx/js/json/html/yml). `secrets_found: []`.
- **CRITICAL (supply chain): `.github/workflows/autonomous-evolution.yml`** runs on a 2-hour cron and pushes unreviewed bot commits directly to `main` after `npm update` and `npm audit fix --force` — unattended self-modification of the default branch, force-installing breaking major versions with no review gate. **Per the rebuild mandate, NO legacy workflow is ported. CI is rebuilt fresh per STANDARDS §12.**
- `.github/metadata_update.sh` mutates repo metadata via `gh repo edit` — an unreviewed write-scope script kept in the repo. Not ported.
- README asserts security controls that don't exist (misrepresentation, not vulnerability). Hosting configs define zero security headers despite claims.

## 5. What is preserved (copied to `_legacy_reference/`, gitignored)

| Item | Why |
|---|---|
| `src/App.tsx` | `WORKFLOW_STEPS` data + step-card interaction pattern → seed for the simulator; terminal-panel UI pattern → template for command display; hero copy "Mastering the Distributed Pipeline" (minus the fake 40% stat) |
| `src/index.css` | Design DNA: `.blueprint-bg` grid, `.node-card`, `--color-git: #f05032` Tailwind v4 token |
| `src/main.tsx`, `vite.config.ts`, `package.json` | Reference for the Tailwind v4 setup and dependency baseline |
| `index.html` | SEO head structure (meta/OG/Twitter/JSON-LD) to port to Next.js metadata API with corrected URLs |
| `public/favicon.ico`, `logo192.png`, `logo512.png`, `robots.txt` | Brand assets |

Explicitly NOT preserved: `.github/workflows/*` (all six), `src/lib/*` stubs, `docs/*` (fabricated), `Chart.yaml`, `k8s-deployment.yaml`, `_config.yml`, `netlify.toml`, `firebase.json`, `manifest.json`, README claims.

## 6. Risks carried into the rebuild

1. Name collision: "GitFlow" is the widely known Git branching model (nvie). Mitigate with consistent "MK GitFlow" branding and a disambiguation note in README/FAQ.
2. Zero regression protection exists — the rebuild starts with tests from day one (Vitest + Playwright smoke).
3. Content SEO starts from zero (live site exposes an empty div to crawlers) — server rendering is the fix (see ADR).
4. Four parallel legacy deploy targets (Vercel/Netlify/Firebase/Pages) will drift — Vercel only going forward.

## 7. ADR-001 — Rebuild on Next.js App Router (orchestrator decision, binding)

**Decision:** All five MK AI Tools products, including MK GitFlow, rebuild on Next.js
(App Router, `src/` dir, TS strict, Tailwind v4) per STANDARDS §1, even where an audit
recommended keeping the current stack.

**Rationale:** The product spec requires server-rendered public content hubs
(guides/use-cases), serverless AI routes (`/api/ai/*` behind the Vercel AI Gateway),
and SEO that a client-only SPA cannot satisfy (the live legacy site verifiably serves
an empty `#root` to crawlers). Serverless functions are also required for the repo
analyzer (GitHub REST v3 with graceful rate-limit handling).

**Audit's dissenting view, recorded honestly:** the audit called this "a rebuild, not a
migration" (only ~180 lines of real UI carry over) and stated the counterpoint plainly:
*if* the scope were only client-side simulators with no AI, keeping Vite and adding
react-router would be the simplest production path and migration would NOT be
justified. Since AI features and SEO content hubs are core to MK GitFlow's scope, the
audit itself concluded Next.js is the right call for this product. React 19,
Tailwind v4, and lucide-react carry over 1:1. framer-motion is NOT carried by default;
the design system below specifies CSS/SVG-native motion first (introduce framer-motion
only if a concrete need is documented in ARCHITECTURE.md).

## 8. Tool availability (STANDARDS §0)

- Available and used: Superpowers ✅, UI UX Pro Max ✅ (`ui-ux-pro-max` skill — ran for this design system), gstack ✅.
- **Unavailable:** Graphify ❌, Humanizer ❌, RALPH ❌ (not installed).
- Fallbacks used per STANDARDS §0: direct repository inspection instead of Graphify; manual copy-voice audit per STANDARDS §9 plus independent QA re-check instead of Humanizer; iterative verify loops instead of RALPH.
- GitHub CLI is authenticated as `amerbarberedu-oss` with READ-ONLY access to mk-knight23 repos: **no pushes to origin; commit locally on `rebuild/v2` only.**
