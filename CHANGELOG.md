# Changelog

All notable changes to MK GitFlow. This is a rebuild, so the history honestly starts
here rather than inventing a past. The rendered version lives at `/changelog` (kept in
sync via `src/content/changelog.ts`).

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/), and the
project aims to follow semantic versioning.

## [2.1.0] — 2026-07-18

### Focused Product Transformation
- **Homepage Integration**: Embedded the visual `SimulatorWorkspace` directly on the homepage.
- **Prepopulated Repository Tree**: Automatically initialized the simulator workspace with a pre-seeded set of 2 branches (`main`, `feature/auth`) and multiple commits on mount, offering a rich graphical visualization on first visit.
- **Basic Mode Layout**: Simplified default view displaying only standard git action buttons: Commit, Branch, and Switch/Merge dropdowns.
- **Collapsible Settings drawer**: Grouped raw command terminals, rebase inputs, reset actions, and import/export under Settings.
- **Site Navigation**: Routed the Simulator link directly to the homepage root `/`.

## [2.0.0] — 2026-07-17

Full rebuild on Next.js App Router with a local-first, blueprint design system.

### Added
- Interactive branch simulator with an in-memory Git engine (commit, branch, checkout,
  merge, rebase, reset) and an SVG graph you can undo, reset, and export.
- Guided tutorials for GitHub Desktop and the command line across three levels, with
  local progress tracking.
- Risk-graded command reference with a page per command, filtering, and undo guidance.
- Deterministic tools: `.gitignore` generator, Conventional Commit builder, and an
  undo/recovery decision helper.
- Public repository analyzer with a documented docs-health rubric and an actionable
  checklist.
- Topic quizzes with per-question explanations and locally-stored results.
- AI assistant with nine capabilities behind honest availability states, deterministic
  fallbacks, and an optional bring-your-own-key path.
- Long-form guides and task-based use cases, plus docs and a full set of policy pages
  (about, creator, open source, privacy, terms, cookies, contact, FAQ).
- SEO scaffolding: per-page metadata and canonicals, sitemap, robots, structured data
  (WebApplication, FAQPage, Article, HowTo, BreadcrumbList, Person), and an OG image.
- Consent-gated analytics that stay fully disabled until accepted, with no content ever
  sent.

### Changed
- Adopted a dark-first blueprint visual language with full light-mode support and no
  external font or asset CDNs.

### Security
- Security headers, zod-validated API input with size limits, and best-effort per-IP
  rate limiting on API routes.
