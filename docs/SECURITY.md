# SECURITY.md — MK GitFlow

Security policy and threat-model summary, per STANDARDS §8.

## Reporting a vulnerability

Please report security issues **privately**, not as public GitHub issues:

- Preferred: open a private GitHub security advisory —
  <https://github.com/mk-knight23/44-tool-github-desktop-guide/security/advisories/new>
- Or email: kazi@reprime.com

Include steps to reproduce and the impact you observed. You'll get an acknowledgement,
and fixes for confirmed issues will be noted in the changelog. Please give a reasonable
window to fix before any public disclosure. See also
`public/.well-known/security.txt`.

## Core safety property

**The site never executes shell or Git commands.** The simulator is a pure in-memory
graph engine (`src/lib/git-engine/`) with no shell access; every command shown elsewhere
is display-and-copy only. There is no code path that can run a command or touch a real
repository. This is both a product principle and a security boundary.

## Threat model summary

### Assets
- The user's local data (browser only).
- The AI gateway credential (server) and the user's BYOK key (browser).
- Availability and integrity of the hosted site.

### Trust boundaries
- Browser ↔ our API routes (`/api/ai/*`).
- Our route ↔ the AI gateway.
- Browser ↔ GitHub's public API (analyzer, direct from client where applicable).

### Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Malicious/oversized API input | Zod validation with per-field size limits + a body-size guard before parsing (`src/lib/ai/schemas.ts`, handler). |
| Abuse / cost blow-up on AI routes | Best-effort per-IP token-bucket rate limit + daily cap (`src/lib/ai/server/rate-limit.ts`); documented as per-instance. |
| Prompt injection | User content fenced as data; hardened prompt builders (`src/lib/ai/server/prompts.ts`); output constrained by zod output schemas. |
| Secret/credential leakage | No content logging; BYOK key never stored/logged/echoed; no secrets in analytics; errors mapped to coarse codes. |
| XSS via injected data | React escaping by default; JSON-LD serialized with `<` escaped (`src/components/seo/json-ld.tsx`); no `dangerouslySetInnerHTML` on user content. |
| Clickjacking / MIME sniffing / referrer leaks | Security headers in `next.config.ts` (CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`). |
| Supply chain | Minimal dependencies; `pnpm audit` in CI; lockfile committed. |

## Headers

Set in `next.config.ts`: Content-Security-Policy, HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`
(camera, microphone, geolocation disabled), and `X-Frame-Options: DENY`. The CSP lists the
GTM/analytics domains in `script-src`/`connect-src` and `https://api.github.com` in
`connect-src` (for the analyzer); the GTM script itself only *loads* after explicit consent,
even though the domain is allowlisted. BYOK requests go through our same-origin route, so no
extra gateway host is needed in `connect-src`. Documented CSP exception: `script-src`
includes `'unsafe-inline'` for the pre-paint theme script and Next.js bootstrap; no
`unsafe-eval` in production.

## Out of scope

- Private-repository analysis (unsupported — public data only).
- Any feature requiring the user to enter credentials into the site (the product asks for
  none, except an optional AI key the user controls, held in their browser).
