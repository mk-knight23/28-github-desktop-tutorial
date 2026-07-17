# ANALYTICS_PLAN.md — MK GitFlow

How analytics work, per STANDARDS §6. The short version: analytics are **off by
default**, load only after explicit consent in production, and never carry user content.

## Mechanism

- Google Tag Manager, loaded via `NEXT_PUBLIC_GTM_ID`. If the id is unset, analytics are
  fully disabled — no script, no data layer pushes, no-op `track()`.
- Implemented in `src/lib/analytics.ts`. The GTM script is injected exactly once, and
  only when **all** of these are true:
  1. `NEXT_PUBLIC_GTM_ID` is set,
  2. `NODE_ENV === "production"`, and
  3. the visitor has granted consent.
- `isAnalyticsActive()` enforces the three conditions; `track()` and `ensureGtmLoaded()`
  are no-ops otherwise.

## Consent

- Default is **declined**. The consent banner (`src/components/shell/consent-banner.tsx`)
  shows only while consent is unset, with two equal-weight buttons (Decline / Accept) and
  no dark patterns.
- The choice is stored locally (`localStorage`, key `mk-gitflow:consent`).
- It can be changed any time on `/cookies` (live `ConsentControls`) and is surfaced in
  `/settings`. Revoking consent stops future events; GTM is only loaded on grant.
- Consent state is exposed through a small subscribe/snapshot store so the banner and
  controls update in sync via `useSyncExternalStore`.

## Event taxonomy (typed union)

Defined as `AnalyticsEvent` in `src/lib/analytics.ts`:

```
tool_opened | tool_started | tool_completed | tool_failed |
file_selected | file_processed |
ai_started | ai_completed | ai_failed |
result_exported | result_copied | result_shared |
history_opened | settings_changed | feedback_submitted |
guide_opened | quota_reached
```

## Where events fire (wired)

| Event | Location |
|---|---|
| `tool_completed` | simulator, tutorials, quiz, analyzer |
| `tool_started` / `tool_failed` | analyzer |
| `result_copied` | copy buttons (all command/result copies) |
| `result_exported` | simulator, .gitignore generator, settings export |
| `ai_started` / `ai_completed` / `ai_failed` | assistant (with coarse reason codes only) |
| `quota_reached` | assistant (daily quota) |
| `guide_opened` | every `/guides/[slug]` (sends slug only) |

## What is NEVER sent

Per STANDARDS §6 and `PRIVACY.md`:

- Command text, git input, or output.
- Repository names or URLs (analyzer input).
- Quiz questions or answers.
- Error logs or CI text pasted into AI tools.
- File names or file contents.
- BYOK credentials or any key/token.

Event params are restricted by type to primitives and, by convention, limited to:
feature names, coarse size/count buckets (`bucket()`), durations, and reason codes.
AI failure events carry only a coarse `code` (e.g. `unavailable`, `bad-output`), never
the input or the model output.

## Testing / verification

- Analytics are disabled in development, so local runs never emit events.
- The consent store and gating are pure functions; the banner and controls read the same
  store. Verified that with no `NEXT_PUBLIC_GTM_ID`, `track()` is a no-op and no script
  is injected.

## Not doing

- No first-party server-side event collection.
- No fingerprinting, no cross-site or cross-device tracking, no profiles.
- No third-party analytics beyond optional, consented GTM.
