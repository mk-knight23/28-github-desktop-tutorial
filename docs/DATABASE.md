# DATABASE.md — MK GitFlow

## There is no server database in v1. This is deliberate.

MK GitFlow is a **local-first** application. Every piece of user data lives in the user's
own browser. There is no server-side database, no server-side file storage, and no
server-side persistence of user content of any kind. This document records that decision
and its rationale (STANDARDS §1 / §11).

## Why no server DB

- **No genuine requirement.** The product's value — simulating Git, teaching it, and
  looking things up — needs no shared or durable server state. Progress and history are
  personal and single-device by nature.
- **No accounts.** There is no sign-up, no auth, and no cross-device sync in v1
  (PRODUCT_SPEC §4 non-goals), so there is nothing that a server DB would key on.
- **Privacy by construction.** If user content never reaches a server, it cannot be
  logged, leaked, breached, or subpoenaed from one. AI request content is processed
  transiently and never stored (see PRIVACY.md).
- **Lower operational surface.** No database means no migrations, no backups, no
  connection pooling, no data-retention policy to enforce, and no PII at rest.

Adding a database would introduce cost and risk with no v1 user benefit — exactly the
kind of speculative infrastructure the standards tell us to avoid.

## Where data actually lives (client-side)

### IndexedDB — via `idb`, behind `src/lib/storage.ts`

All substantial user data. A single typed wrapper module owns the schema so callers never
touch raw IndexedDB.

| Store (logical) | Contents |
|---|---|
| Tutorial progress | Which steps/checkpoints are marked done, per tutorial |
| Quiz attempts | Score, answers, timestamp per attempt (feeds `/history`) |
| Simulator sessions | Saved command logs + serialized graph state (JSON) |
| Analyzer cache | Recent public-repo analyses (feeds `/history`) |
| AI history | Local record of AI results the user chose to keep |
| AI quota | Anonymous daily counter for the client-side quota indicator |

### localStorage — tiny prefs only

`theme`, `motion`, `consent`, `history-disabled`, and the BYOK key. Keys are namespaced
`mk-gitflow:*` (see `src/lib/site.ts`). The BYOK key is held here only and is sent solely
as a per-request `x-byok-key` header — never persisted or logged server-side.

## Data lifecycle & user control

- **Creation/update:** entirely in the browser as the user works.
- **Export/import:** simulator sessions export/import as local JSON. `/settings` offers
  clear / export / import of local data.
- **Deletion:** the user can clear all local data from `/settings`; clearing browser
  storage removes everything. Nothing survives on any server.

## External data reads (not storage)

- **GitHub REST v3 (unauthenticated):** the analyzer reads *public* repo metadata on
  demand. Responses may be cached locally (IndexedDB) but are never written to a server.
- **Vercel AI Gateway:** AI routes forward request content transiently to obtain a
  response; nothing is stored.

## If a database is ever needed

Should cross-device sync or accounts become a real requirement, the standards point to a
managed Postgres (Supabase) with Prisma, plus a documented migration and retention policy.
Until that requirement is real, v1 ships without one.
