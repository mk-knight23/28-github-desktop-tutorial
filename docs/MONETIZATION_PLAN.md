# MONETIZATION_PLAN.md — MK GitFlow

Status: **AdSense prepared but DISABLED.** No monetization is active. This document
records the plan and the guardrails, per STANDARDS §7.

## Current state (honest)

- There is **no revenue mechanism live** in this product. No ads load, no payments,
  no affiliate links, no sponsored content.
- The AdSense integration is a placeholder: a single `AdSlot` component
  (`src/components/content/ad-slot.tsx`) gated behind `NEXT_PUBLIC_ADSENSE_ENABLED`,
  which defaults to `false`. While false, the component renders `null` and makes **no
  network request** — no ad script, no publisher call, nothing.
- No `ads.txt` file ships. Per policy, it is not added until a real, verified AdSense
  publisher id exists.

## Why ads at all (rationale)

MK GitFlow is free, open source, and local-first, with no accounts and no data to
sell. If the hosting or domain costs ever need offsetting, unobtrusive, clearly-marked
display ads on long-form content are the least user-hostile option that keeps the tool
free and the code open. Ads are a fallback to cover costs, not a growth engine.

## Placement policy (when/if enabled)

Ads may appear **only** in these locations, and never elsewhere:

- The docs sidebar (`/docs`), below the on-page navigation.
- The end of long-form guide pages (`/guides/[slug]`), after the article body.

Explicitly **off-limits**: the landing page, the simulator (`/tool`), the AI assistant,
the analyzer, dashboards, history, settings, forms, and any legal/policy page. No ads
in the primary tool experience, ever.

## Constraints (non-negotiable)

- **No layout shift.** `AdSlot` reserves fixed dimensions whether or not an ad renders,
  so enabling ads causes zero CLS.
- **Labeled.** Any slot is marked as advertising (`aria-label="Advertisement"`).
- **Consent-aware.** Personalized advertising, if ever used, must respect the same
  consent gate as analytics (default declined). A non-personalized fallback is
  preferred.
- **No dark patterns.** No interstitials, no pop-ups, no auto-playing media, nothing
  that obscures content or the tool.
- **Privacy first.** Ads must never receive command text, repo names, quiz content,
  error logs, file names, or keys — consistent with `PRIVACY.md` and STANDARDS §6/§8.

## Enabling checklist (future work, not done)

1. Obtain a verified AdSense publisher id.
2. Add the id to environment configuration and set `NEXT_PUBLIC_ADSENSE_ENABLED=true`.
3. Add `public/ads.txt` with the real publisher id.
4. Wire the actual ad unit into `AdSlot` (currently a labeled reserved placeholder).
5. Update the CSP in `next.config.ts` to allow only the required Google ad domains.
6. Re-test consent gating, CLS, and that no ad appears on off-limits routes.
7. Update `PRIVACY.md` and `/cookies` to describe advertising cookies.

Until every step above is done and verified, ads stay off.

## Alternatives considered

- **Donations / GitHub Sponsors** — lower friction for users; likely the preferred first
  option over ads. Can be added as a simple link with no privacy cost.
- **Paid "pro" features** — rejected for now; conflicts with the free, local-first,
  open-source positioning.
- **Selling data** — never. There is effectively no user data to sell, by design.
