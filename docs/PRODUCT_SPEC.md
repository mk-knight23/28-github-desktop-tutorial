# PRODUCT_SPEC.md — MK GitFlow

Product: **MK GitFlow** — an interactive Git learning and tooling platform.
Domain: `https://gitflow.mkazi.live` · Repo: `https://github.com/mk-knight23/44-tool-github-desktop-guide`
Author: Kazi Musharraf. Open source (MIT). Local-first: no accounts, no server database (see DATABASE.md).

## 1. Objective

Help developers actually understand Git — not memorize it — by letting them *see* what
every command does to the commit graph before they run it for real, then back that up
with guided tutorials (GitHub Desktop and CLI paths), a risk-graded command reference,
deterministic utilities (.gitignore generator, Conventional Commit builder, undo
helper), optional AI explainers, and a public repo health analyzer.

Core promise: **the site never executes shell commands.** It only simulates Git
in-memory and *displays* commands with copy buttons. This is a safety feature and a
stated product principle.

## 2. Personas

1. **Bootcamp Ba** — beginner, uses GitHub Desktop, scared of breaking things. Needs the visual simulator, the Desktop tutorial track, and the undo helper. Success: recovers from "committed to the wrong branch" without panic.
2. **Self-taught Sam** — intermediate CLI user, fuzzy on rebase/reset semantics. Needs the simulator's rebase/reset animations, the risk-graded reference, and quizzes to self-check. Success: can predict the graph state after a rebase before pressing Enter.
3. **Maintainer Mia** — team lead reviewing PRs and onboarding juniors. Needs the repo analyzer (docs health score for her projects), the commit builder / PR description generator, and shareable tutorial links. Success: repo scores improve against the actionable checklist.

## 3. V1 scope — features and acceptance criteria

### 3.1 Interactive branch visualizer + simulator (`/tool`) — deterministic core

In-memory Git graph engine operating on a DAG; rendered as an SVG branch graph.

Acceptance criteria:
- Engine supports `commit`, `branch <name>`, `checkout <ref>`, `merge <branch>` (fast-forward and true merge with two parents), `rebase <branch>` (replayed commits get new ids; old commits shown as abandoned), `reset --soft|--mixed|--hard <ref>` — all pure in-memory operations on immutable state (each op returns a new graph state; enables undo/redo and time-travel).
- Engine is a plain TypeScript module (`src/lib/git-engine/`) with **zero DOM dependencies** and ≥90% unit-test coverage — it is the most-tested code in the repo.
- SVG renderer draws lanes (one color per branch, tokens from DESIGN_SYSTEM.md), commit nodes with 7-char pseudo-SHAs, branch labels, HEAD indicator, and merge/rebase edges. Animates transitions ≤400ms; with `prefers-reduced-motion` the final state renders instantly.
- Command input: both clickable operation buttons AND a text input accepting the supported git syntax; invalid input shows the error inline with the closest valid form (never a dead end).
- Destructive ops (`reset --hard`, force concepts) trigger the destructive-warning treatment (DESIGN_SYSTEM.md §9) including an explicit confirm.
- Every simulator session can be reset, undone step-by-step, and exported/imported as JSON (local only).
- A visible command log doubles as the screen-reader-accessible history (aria-live) — the SVG alone is never the only representation.
- Works fully offline / without any AI key.

### 3.2 Guided tutorials (`/tutorials`)

Two paths (GitHub Desktop, CLI) × three levels (beginner, intermediate, advanced), with step checkpoints.

Acceptance criteria:
- ≥6 tutorials at launch (each path × each level), each with ≥5 steps; steps have a "checkpoint" the learner marks done; progress persists locally (IndexedDB) and shows on `/dashboard`.
- Desktop-path steps describe real GitHub Desktop UI actions; CLI-path steps show commands in the terminal panel with copy buttons and risk badges.
- Tutorial steps can embed a live simulator scene pre-seeded to the relevant graph state.
- Server-rendered, indexable, with `HowTo` JSON-LD.

### 3.3 Quizzes (`/quiz`)

- ≥5 topic quizzes (basics, branching, merging vs rebasing, undoing changes, collaboration), ≥8 questions each, deterministic scoring, per-question explanation revealed after answering.
- Results stored locally; `/history` lists past attempts; retake supported; no fake "average user" stats.

### 3.4 Command reference with risk levels (`/reference`)

- ≥40 commands, each: syntax, plain-English explanation, examples, **risk level (safe / caution / destructive)** with the color+icon+label treatment (never color alone), undo guidance, and related commands.
- Destructive entries show the strong warning state and a safer alternative.
- Filter by risk level and search by name/purpose. Each command has its own indexable route (`/reference/[command]`).

### 3.5 .gitignore generator (`/gitignore`)

- Bundled templates (≥12: Node, Next.js, Python, macOS, Windows, Linux, JetBrains, VS Code, Java, Go, Rust, Unity) combinable via multi-select; deduplicated merged output with section headers; copy + download. Fully offline — templates ship with the app, no external API.

### 3.6 Conventional Commit builder (`/commits`)

- Deterministic form: type (feat/fix/docs/…), optional scope, description, optional body, breaking-change flag + footer. Live preview; validation per conventional-commits spec (length hints, imperative-mood hint); copy button. No AI required.

### 3.7 Undo / recovery decision helper (`/undo`)

- Deterministic flowchart ("I committed to the wrong branch", "I need to undo a pushed commit", "I lost commits after reset", …): ≥8 entry scenarios, each resolving to a recovery recipe with commands (copy buttons, risk badges) and an "if this doesn't match, safest next step" fallback. Every path reachable by keyboard; state encoded in URL so results are shareable.

### 3.8 AI features (`POST /api/ai/*`) — optional layer, honest degradation

Per STANDARDS §10: zod-validated input, rate limit, quota check, Vercel AI Gateway
model strings, env-configurable models. When AI is unavailable: labeled "AI
unavailable" state + deterministic fallback where one exists + BYOK option.

Endpoints (all return typed, zod-enforced JSON):
1. `nl-to-command` — natural language → git command. Output schema MUST include: `command`, `explanation`, `riskLevel` (`safe|caution|destructive`), `destructiveWarning` (nullable), `saferAlternative` (nullable), `undoGuidance`. UI renders the full risk treatment; destructive results cannot be copy-clicked until the warning is acknowledged.
2. `explain-error` — paste a git error → cause + fix steps.
3. `explain-conflict` — paste conflict-marked file content → what each side means + resolution options.
4. `rebase-plan` — describe branches/goal → step-by-step rebase plan with risk notes.
5. `branch-strategy` — team context → strategy recommendation + branch-name generator.
6. `commit-from-diff` — pasted diff text → conventional commit message (deterministic builder is the fallback).
7. `pr-description` — commits/summary text → PR description.
8. `release-notes` — commit list → changelog/release notes.
9. `explain-ci-error` — pasted CI log excerpt → explanation + likely fixes.

Acceptance criteria: every endpoint zod-validates input with size limits; per-IP
token-bucket rate limiting; no input content logged; quota indicator in UI;
`ai_started/ai_completed/ai_failed/quota_reached` analytics events (params never
include user text).

### 3.9 Public repo analyzer (`/analyzer`)

- Input: `owner/repo` or GitHub URL. Fetches GitHub REST v3 **unauthenticated**: metadata, languages, license, README presence + quality heuristics (length, sections, badges), community files (CONTRIBUTING, CODE_OF_CONDUCT, issue/PR templates, SECURITY), workflows list, releases.
- Produces a **docs health score** (documented, deterministic rubric) with an actionable checklist ("Add a CONTRIBUTING.md — here's a starter").
- 403/429 rate-limit responses handled gracefully: honest message, retry-after if provided, option to analyze later. Results cached locally; recent analyses on `/history`.
- Never sends tokens; never executes anything; analysis is read-only public data.

## 4. Non-goals (V1)

- No execution of git or shell commands, ever — display + copy only.
- No user accounts, no server-side database, no server-side storage of user content.
- Not a GitHub client (no OAuth, no writes to repos), not a code host, not a private-repo analyzer.
- No GitFlow-branching-model advocacy — we teach mechanics; the name is brand, not the nvie model (FAQ disambiguates).
- No framer-motion dependency unless a documented need arises (CSS/SVG motion first).
- No multiplayer/collaboration features.

## 5. Page map (STANDARDS §4)

| Route | Content |
|---|---|
| `/` | Landing: hero (evolved "Mastering the Distributed Pipeline"), live simulator teaser, feature grid, honest "what this is / isn't" |
| `/tool` | Branch visualizer + simulator (primary workspace) |
| `/tutorials`, `/tutorials/[path]/[slug]` | Tutorial index + individual tutorials (desktop/cli × levels) |
| `/quiz`, `/quiz/[topic]` | Quiz index + quiz runner |
| `/reference`, `/reference/[command]` | Risk-graded command reference |
| `/gitignore` | .gitignore generator |
| `/commits` | Conventional Commit builder |
| `/undo` | Undo/recovery decision helper |
| `/analyzer` | Public repo analyzer |
| `/assistant` | AI hub (nl-to-command + explainers; honest availability states) |
| `/dashboard` | Real local data: tutorial progress, quiz scores, simulator sessions, AI quota — honest empty states |
| `/history` | Past quiz attempts, analyses, AI results (local) |
| `/settings` | Theme, reduced-motion override, clear/export/import data, consent, BYOK |
| `/docs` | Product documentation |
| `/use-cases/*` (≥5) | e.g. onboarding juniors, teaching git in bootcamps, PR hygiene, recovering from mistakes, repo health audits |
| `/guides/*` (≥8) | Original long-form guides (rebase vs merge, undoing anything in git, conventional commits, .gitignore patterns, GitHub Desktop workflow, branch strategies, reading the DAG, CI failure triage) |
| `/faq` | Incl. GitFlow-name disambiguation; `FAQPage` JSON-LD |
| `/changelog` `/about` `/creator` `/open-source` `/privacy` `/terms` `/cookies` `/contact` | Per STANDARDS §3–§4 |
| `not-found.tsx`, root `error.tsx` | Custom, on-brand, helpful |

Footer on every public route, exact sentence: **"Built and maintained by Kazi Musharraf. Open source for everyone."** + GitHub, portfolio, repo links.

## 6. Privacy constraints (binding; expand in PRIVACY.md)

- Local-first: all user data (progress, scores, sessions, analyses, prefs) lives in IndexedDB via `src/lib/storage.ts`; localStorage only for tiny prefs (theme, consent).
- AI routes: request content is processed transiently, never logged, never stored server-side. BYOK: single documented mechanism, key held client-side only (memory/IndexedDB), sent per-request via `x-byok-key` header, never logged or stored by the server.
- Analyzer: public GitHub data only, unauthenticated; queries not stored server-side.
- Analytics: GTM only after explicit consent (default declined); event params limited to counts, bucketed sizes, feature names, durations — never command text, repo names, quiz content, error logs, or keys.
- Security headers, zod validation, rate limits per STANDARDS §8. `SECURITY.md` documents threat model incl. "site never executes commands".

## 7. Definition of done (this rebuild phase)

Per STANDARDS §14: zero TS errors, Vitest green (engine ≥90% coverage), Playwright
smoke green locally, all §5 pages with real content, simulator + all deterministic
tools work end-to-end with **no** AI keys, honest dashboards, docs complete, clean
conventional-commit history on `rebuild/v2`. Deployment is orchestrator-owned.
