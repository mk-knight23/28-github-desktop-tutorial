# DEPLOYMENT.md — MK GitFlow

Target: **https://gitflow.mkazi.live** · Platform: **Vercel** (standard Next.js).
Deployment and production verification are orchestrator-owned; squad agents do not deploy
(STANDARDS §14).

## 1. Prerequisites

- Node 22+, pnpm 11+.
- A Vercel project linked to `mk-knight23/44-tool-github-desktop-guide`.
- No AI or analytics credentials are required to deploy — the app builds and every
  deterministic feature works without them.

## 2. Build settings (Vercel)

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` (`next build`) |
| Output | `.next` (managed by Vercel) |
| Node version | 22.x |

## 3. Environment variables

All optional (see `.env.example`). Set in the Vercel project as needed.

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Build + runtime | Set to `https://gitflow.mkazi.live` so canonicals, sitemap, and OG URLs resolve to production. |
| `AI_MODEL` / `AI_MODEL_QUALITY` | Runtime | Gateway model strings; change models without a redeploy of code. |
| `AI_GATEWAY_API_KEY` | Runtime | **Not needed on Vercel** — the AI Gateway authenticates via the injected OIDC token. Only set for self-hosting/local. |
| `NEXT_PUBLIC_GTM_ID` | Build + runtime | Leave unset until analytics is intended; even when set, GTM loads only in production and only after user consent. |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Build + runtime | Keep `false` (or unset). No ad script loads otherwise. |

The BYOK key is never a server env var by design.

## 4. AI Gateway on Vercel

On Vercel deployments the Vercel AI SDK reaches the gateway using the injected
`VERCEL_OIDC_TOKEN` — no key management needed. If the gateway is unreachable or has no
credit, AI endpoints return an honest "unavailable" response and the UI falls back to
deterministic, clearly-labeled results where one exists. There is nothing to "turn on"
for the deterministic features.

## 5. Security headers

Sent from `next.config.ts` (STANDARDS §8): Content-Security-Policy, Strict-Transport-Security
(HSTS, `max-age=63072000; includeSubDomains; preload`), X-Content-Type-Options `nosniff`,
Referrer-Policy `strict-origin-when-cross-origin`, Permissions-Policy
`camera=(), microphone=(), geolocation=()`, and X-Frame-Options `DENY`. Documented CSP
exceptions: `'unsafe-inline'` scripts (pre-paint theme + Next bootstrap; no `unsafe-eval`),
GTM/GA hosts (script gated on consent), and `connect-src https://api.github.com` for the
analyzer.

## 6. Domain

Attach `gitflow.mkazi.live` in Vercel and point DNS per Vercel's instructions. `mkazi.live`
is not in this Vercel account, so domain attachment is handled by the orchestrator
(STANDARDS §0). Deploy to the generated `*.vercel.app` URL first; verify; then attach the
custom domain.

## 7. Pre-deploy checklist

Run locally before promoting a deploy:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm exec playwright test    # after a build; serves on port 3105
```

GitHub Actions CI has been retired, so run these checks locally. Vercel still
runs `pnpm build` on every push and will not promote a broken build. Add a
dependency report (`pnpm audit --prod`) and a secret scan to your local
pre-ship routine.

## 8. Post-deploy verification (orchestrator)

- Landing, `/tool`, `/tutorials`, `/reference`, `/analyzer` render on production.
- Canonical tags and OG image resolve to `https://gitflow.mkazi.live`.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `humans.txt`, `.well-known/security.txt` served.
- Security headers present (check response headers).
- Consent banner defaults to declined; GTM absent until accepted (only relevant if
  `NEXT_PUBLIC_GTM_ID` is set).
- Simulator works with no AI keys; AI assistant shows honest availability.

## 9. Rollback

Vercel keeps immutable deployments. To roll back, promote the previous known-good
deployment to production in the Vercel dashboard (Deployments → ⋯ → Promote to Production),
or `vercel rollback`. No database means there is no data migration to reverse — rollback is
purely swapping the served build.

## 10. Notes

- Never push to origin from squad agents (read-only token, STANDARDS §2). Work commits
  locally on `rebuild/v2`.
- Do not redirect or alter unrelated domains.
