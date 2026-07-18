# SEO_PLAN.md — MK GitFlow

How MK GitFlow is made discoverable, per STANDARDS §5. Everything here is implemented
and verified in the build unless marked otherwise.

## Goals

- Rank for genuine intent: "how to undo a git commit", "rebase vs merge", "git command
  reference", "visual git simulator", ".gitignore generator", and similar.
- Be citable by LLMs and answer engines (see `public/llms.txt`).
- Keep every page honest: no keyword stuffing, no doorway pages, no fake content.

## Canonical URLs and metadata

- `metadataBase` is set in `src/app/layout.tsx` from `NEXT_PUBLIC_SITE_URL`
  (default `https://gitflow.mkazi.live`). Every canonical resolves against it.
- Each page exports `metadata` via `buildMetadata()` (`src/lib/seo.ts`) with a unique
  title, description, and `alternates.canonical` (a relative path). The landing page
  sets its own canonical to `/`.
- Open Graph and Twitter (`summary_large_image`) tags are set globally in the layout
  and per-page by `buildMetadata`.

## Structured data (JSON-LD)

Builders live in `src/lib/jsonld.ts`; rendered via `src/components/seo/json-ld.tsx`.

| Type | Where |
|---|---|
| `WebApplication` | `/` (landing) |
| `FAQPage` | `/faq` |
| `Article` | every `/guides/[slug]` and `/use-cases/[slug]` |
| `HowTo` | step-based guides (e.g. GitHub Desktop workflow) |
| `BreadcrumbList` | all nested pages (guides, use cases, reference, undo, FAQ, docs, legal) |
| `Person` | `/creator` |

## Crawl files

- `src/app/sitemap.ts` — generates `/sitemap.xml` from the same data modules the pages
  render from (guides, use cases, reference commands, undo scenarios, quizzes,
  tutorials, plus static routes), so it can't drift out of sync.
- `src/app/robots.ts` — generates `/robots.txt`, allows everything except `/api/`,
  and points at the sitemap.
- `public/llms.txt` — a structured summary for LLMs/answer engines.
- `public/humans.txt` — authorship/credits.
- `public/.well-known/security.txt` — RFC 9116 disclosure contact.

## Social image

- `src/app/opengraph-image.tsx` generates a 1200×630 branded card at build time with
  `next/og` (Satori). No external service, no network fetch — it draws from inline
  markup only. `src/app/twitter-image.tsx` reuses it.

## On-page and internal linking

- Semantic HTML throughout (`<article>`, `<nav>`, `<dl>` for FAQ, real headings).
- Descriptive, human-readable URLs (`/guides/rebase-vs-merge`, `/reference/git-reset`).
- Dense internal linking: tools ↔ guides ↔ use cases ↔ reference. Guides link to the
  relevant tool and reference entries; use cases list the tools they use; the footer
  exposes every content section; prev/next navigation connects guides.
- Prose capped at a readable measure; headings balanced; anchors have scroll margin so
  in-page links aren't hidden under the sticky nav.

## Content strategy

- 8 original long-form guides (≥700 words each) and 5 task-based use cases, written in a
  plain human voice (STANDARDS §9): no AI clichés, concrete examples, stated limitations.
- A 40+ entry command reference, each with its own indexable page.
- FAQ with 14 real Q&As, including the GitFlow-name disambiguation.

## Performance signals (SEO-adjacent)

- Static generation for all content pages (110 prerendered routes at build).
- No external font or asset CDNs; system font stacks only.
- No layout shift from ads (reserved slots, disabled by default).
- Dark/light theme set pre-paint to avoid flash.

## Not doing (deliberately)

- No cloaking, doorway pages, or thin location/keyword variants.
- No auto-generated low-value pages.
- No hidden text or keyword stuffing.
