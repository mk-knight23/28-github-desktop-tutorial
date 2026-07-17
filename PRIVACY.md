# PRIVACY.md — MK GitFlow

The engineering-facing privacy record, per STANDARDS §8. The user-facing version lives
at `/privacy`. This document is the source of truth for what data exists, where it goes,
and why.

## Principle

MK GitFlow is **local-first**. There are no accounts and no server-side database of user
activity. The design goal is that there is very little about a user to collect in the
first place.

## Data inventory

| Data | Where it lives | Leaves the browser? |
|---|---|---|
| Tutorial progress, quiz scores, simulator sessions, saved analyses | IndexedDB (`src/lib/storage.ts`) | No |
| Theme, reduced-motion, consent, history-disabled prefs | `localStorage` (tiny prefs) | No |
| AI request input (assistant) | Sent to AI gateway transiently | Yes — to gateway only, not logged/stored by us |
| BYOK key (optional) | In-browser only; sent per request as `x-byok-key` | Only as a request header; never stored/logged/echoed |
| Analyzer input (`owner/repo`) | Used for a public GitHub API call | Yes — to GitHub public API; not stored server-side |
| Analytics events (opt-in) | Google Tag Manager data layer | Only if consented + production; content-free |

## AI routes

- Handled by `src/lib/ai/server/handler.ts` and the dynamic route
  `src/app/api/ai/[capability]/route.ts`.
- **No request content is logged** on any path. Errors are mapped to coarse, leak-free
  codes (`unavailable`, `bad-output`, `cancelled`, etc.).
- Input is fenced as data (`<user_data>` boundaries) to harden against prompt injection.
- BYOK precedence: a per-request `x-byok-key` builds a per-call gateway client; the key
  is never read from the environment, stored, or written to logs. With no credentials at
  all, the route returns an honest 503 without a doomed upstream call.
- Analytics for AI carry only the capability slug and a coarse reason code — never the
  user's text or the model's output.

## Analyzer

- Calls GitHub's public REST API **unauthenticated**. It never sends a token and cannot
  read private repositories.
- Queries are not stored server-side. Results are cached in the browser.
- Rate-limit responses (403/429) are surfaced honestly with any retry-after window.

## Analytics

- Off by default (consent declined). Loads only with `NEXT_PUBLIC_GTM_ID` set, in
  production, after explicit consent. See `ANALYTICS_PLAN.md`.
- Events never include command text, repo names, quiz content, error logs, file names, or
  keys. Params are limited to feature names, bucketed sizes/counts, durations, and reason
  codes.

## User controls

- `/settings`: export, import, or clear all local data; manage analytics consent.
- `/cookies`: change analytics consent at any time.
- Clearing browser storage removes everything.

## Retention

- Local data persists until the user clears it or clears browser storage.
- We keep no server-side copy of user content. Ordinary platform request logs (e.g. IP
  addresses at the hosting layer) are outside application control and used only to serve
  and protect the site.

## What we never do

- Sell or share user data (there is effectively none to sell).
- Embed advertising or social tracking widgets (AdSense is disabled; see
  `MONETIZATION_PLAN.md`).
- Build cross-session or cross-device profiles.
