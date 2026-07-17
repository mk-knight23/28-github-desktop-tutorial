# DESIGN_SYSTEM.md — MK GitFlow

Generated with the `ui-ux-pro-max` skill (design-system run: "developer tool git
education terminal blueprint dark"), adapted to the MK GitFlow visual direction and
the shared standards. The skill recommended dark-only OLED + a single Google-served
mono font; both were adapted: **dark is the primary theme but light is fully
supported**, and **no external font CDNs** — system font stacks only (contract
requirement). This file is the binding spec: the implementation stage applies the
Tailwind v4 `@theme` block in §12 **verbatim**.

Identity in one line: **an engineer's blueprint for Git** — blueprint grid, terminal
panels, branch-graph motif, monospace accents, industrial "NODE_0x" labels, and
unmissable risk color coding.

Forbidden (per STANDARDS §13): purple-blue gradient defaults, glowing blobs, particle
fields, emoji-as-icons, giant empty heroes, generic AI dashboard look.

---

## 1. Color tokens

Semantic tokens flip between themes via `data-theme` on `<html>`. Components use ONLY
semantic tokens — never raw hex.

### 1.1 Core — dark theme (primary, default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B1220` | Page background (deep blueprint ink) |
| `--surface` | `#111A2C` | Cards, panels |
| `--surface-raised` | `#182338` | Hovered cards, dropdowns, modals |
| `--surface-terminal` | `#070C16` | Terminal panels, code blocks (darkest layer) |
| `--border` | `#263349` | Default 1px borders, dividers |
| `--border-strong` | `#3A4A66` | Emphasized borders, input borders |
| `--text` | `#E6ECF8` | Primary text (contrast ~15:1 on `--bg`) |
| `--text-secondary` | `#9BA8BF` | Secondary text (~7.8:1) |
| `--text-muted` | `#64748B` | Non-essential meta only (~4.6:1 — never for body copy) |
| `--accent` | `#F05032` | Brand git-orange: links, active states, HEAD marker (5.3:1 on `--bg`) |
| `--accent-hover` | `#FF6A4D` | Hover state of accent elements |
| `--accent-active` | `#D9432A` | Pressed state |
| `--accent-contrast` | `#0B1220` | Text/icon ON accent-filled elements (5.3:1 on `#F05032`) |
| `--ring` | `#FF7A5C` | Focus ring (≥3:1 vs both `--bg` and `--surface`) |
| `--selection` | `rgba(240, 80, 50, 0.30)` | Text selection |
| `--grid-line` | `rgba(240, 80, 50, 0.035)` | Blueprint grid lines (40px cell) |
| `--grid-line-major` | `rgba(240, 80, 50, 0.07)` | Major grid lines (every 200px) |

### 1.2 Core — light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F9FC` | Page background (paper blueprint) |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--surface-raised` | `#FFFFFF` | + shadow-2 (elevation does the lifting in light mode) |
| `--surface-terminal` | `#0F172A` | Terminal panels stay dark in BOTH themes (product signature) |
| `--border` | `#D8DFEA` | Default borders |
| `--border-strong` | `#B9C4D6` | Emphasized borders, inputs |
| `--text` | `#131C2B` | Primary text (~15:1) |
| `--text-secondary` | `#46536A` | Secondary (~7.6:1) |
| `--text-muted` | `#5D6B84` | Meta only (~5.3:1) |
| `--accent` | `#C0391F` | Darkened git-orange for AA on light (5.5:1 on white) |
| `--accent-hover` | `#A93018` | Hover |
| `--accent-active` | `#8F2814` | Pressed |
| `--accent-contrast` | `#FFFFFF` | Text on accent fills (5.5:1 on `#C0391F`) |
| `--ring` | `#C0391F` | Focus ring |
| `--selection` | `rgba(240, 80, 50, 0.25)` | Text selection |
| `--grid-line` | `rgba(192, 57, 31, 0.05)` | Blueprint grid |
| `--grid-line-major` | `rgba(192, 57, 31, 0.10)` | Major grid lines |

Note: raw brand `#F05032` may still appear in light mode as a *graphic* color (lane
color, decorative rules, large display text ≥24px where 3:1 suffices) — never as
normal-size text or sole state indicator.

### 1.3 Risk semantics (the product's most important colors)

Risk is ALWAYS communicated as color + icon + text label ("SAFE" / "CAUTION" /
"DESTRUCTIVE" in mono uppercase). Never color alone.

Dark theme:

| Token | fg | bg (subtle) | border |
|---|---|---|---|
| `--risk-safe-*` | `#4ADE80` | `rgba(74,222,128,0.10)` | `rgba(74,222,128,0.35)` |
| `--risk-caution-*` | `#FBBF24` | `rgba(251,191,36,0.10)` | `rgba(251,191,36,0.35)` |
| `--risk-danger-*` | `#F87171` | `rgba(248,113,113,0.12)` | `rgba(248,113,113,0.45)` |

Light theme:

| Token | fg | bg (subtle) | border |
|---|---|---|---|
| `--risk-safe-*` | `#15803D` | `rgba(21,128,61,0.08)` | `rgba(21,128,61,0.35)` |
| `--risk-caution-*` | `#A16207` | `rgba(161,98,7,0.08)` | `rgba(161,98,7,0.35)` |
| `--risk-danger-*` | `#B91C1C` | `rgba(185,28,28,0.07)` | `rgba(185,28,28,0.40)` |

Icons (lucide): safe → `shield-check`, caution → `triangle-alert`, destructive → `octagon-alert`.

### 1.4 Branch-graph lane colors (categorical, colorblind-aware)

Assigned in order to branches; lane 1 is always `main`. Non-text SVG elements need
≥3:1 against `--bg` — verified for both sets.

| Lane | Dark | Light |
|---|---|---|
| 1 (main) | `#F05032` | `#C0391F` |
| 2 | `#38BDF8` | `#0369A1` |
| 3 | `#4ADE80` | `#15803D` |
| 4 | `#FACC15` | `#A16207` |
| 5 | `#F472B6` | `#BE185D` |
| 6 | `#A78BFA` | `#6D28D9` |

Beyond 6 lanes, cycle with a dashed edge pattern so repeated hues stay distinguishable
(shape + color, never color alone). Abandoned (pre-rebase) commits: `--text-muted` at
50% opacity + dashed outline.

### 1.5 Terminal palette (same in both themes — terminal is always dark)

`--term-bg #070C16` (dark) / `#0F172A` (light theme's terminal) · `--term-text
#D5DEED` · `--term-prompt #FF6A4D` · `--term-ok #4ADE80` · `--term-warn #FBBF24` ·
`--term-err #F87171` · `--term-comment #64748B`.

## 2. Typography

No external font CDNs. System stacks only (self-hosted variable fonts may be added
later via `next/font/local` if brand pressure justifies it — document in
ARCHITECTURE.md if so).

- `--font-sans`: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- `--font-mono`: `ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`

Roles:

| Role | Font | Size/line-height | Weight | Treatment |
|---|---|---|---|---|
| Display XL (hero) | sans | `clamp(2.5rem, 6vw, 4.5rem)` / 1.0 | 900 | UPPERCASE, italic, tracking `-0.03em` (legacy signature, preserved) |
| Display (section) | sans | 2.25rem / 1.1 | 900 | UPPERCASE, italic, tracking `-0.02em` |
| H2 | sans | 1.75rem / 1.15 | 800 | tracking `-0.01em` |
| H3 | sans | 1.375rem / 1.25 | 700 | — |
| H4 | sans | 1.125rem / 1.3 | 700 | — |
| Body L | sans | 1.125rem / 1.65 | 400 | Long-form guides |
| Body | sans | 1rem / 1.6 | 400 | Default; min 16px on mobile |
| Body S | sans | 0.875rem / 1.55 | 400 | Dense UI |
| Label / schematic | mono | 0.6875rem / 1.2 | 700 | UPPERCASE, tracking `+0.18em` — "NODE_01", nav items, badges |
| Code / commands | mono | 0.875rem / 1.6 | 400 | Terminal panels; NEVER italic; 500 max weight |
| SHA chip | mono | 0.75rem / 1 | 500 | 7-char hashes, tabular feel |

Rules: line length 60–75ch for prose (`max-w-prose`); numbers in tables/scores use
`font-variant-numeric: tabular-nums`; mono labels are the ONLY place wide tracking is
allowed; body text never letter-spaced.

## 3. Spacing

4px base scale (Tailwind default retained): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80,
96. Section rhythm: 96px between landing sections (desktop) / 64px (mobile); 24px card
padding (32px for feature cards); 16px between form fields; 8px icon-to-label gap.
Container: `max-w-7xl` (marketing) / `max-w-5xl` (docs & guides prose) with 24px
gutters (16px <640px).

## 4. Radii

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Badges, SHA chips, kbd |
| `--radius-sm` | 6px | Buttons, inputs, tabs |
| `--radius-md` | 10px | Terminal panels, code blocks, dropdowns |
| `--radius-lg` | 14px | Cards, node cards |
| `--radius-xl` | 20px | Modals, feature cards |
| `--radius-full` | 9999px | Pills, graph node dots |

(Legacy 2rem card radius is retired — too soft for the blueprint language.)

## 5. Elevation & glass

Dark mode elevates primarily by **surface step + border**, with soft shadows as
support; light mode elevates by shadow.

| Token | Dark | Light |
|---|---|---|
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.40)` | `0 1px 2px rgba(16,24,40,0.06)` |
| `--shadow-2` | `0 4px 12px rgba(0,0,0,0.45)` | `0 4px 12px rgba(16,24,40,0.10)` |
| `--shadow-3` | `0 12px 32px rgba(0,0,0,0.50)` | `0 16px 40px rgba(16,24,40,0.14)` |

Levels: 0 = page (grid visible) · 1 = card (`--surface` + `--border` + shadow-1) ·
2 = raised/hover/dropdown (`--surface-raised` + shadow-2) · 3 = modal/toast (shadow-3 +
scrim `rgba(3,7,18,0.65)`).

**Glass rule:** backdrop-blur is allowed in exactly ONE place — the sticky top nav
(`background: color-mix(in srgb, var(--surface) 82%, transparent); backdrop-filter:
blur(12px); border-bottom: 1px solid var(--border)`). Nowhere else. No frosted cards.

Accent glow (`0 0 24px rgba(240,80,50,0.15)`) is reserved for the active simulator
node and the active workflow card only — never on buttons or text.

## 6. Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 120ms | Hover/pressed feedback, toggles |
| `--motion-base` | 200ms | Most transitions (color, opacity, transform) |
| `--motion-slow` | 320ms | Panels, modals, accordions |
| `--motion-graph` | 400ms | Simulator graph transitions (max allowed duration) |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Entering |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting (exits ~70% of enter duration) |

Rules: animate `transform`/`opacity`/SVG paint only — never width/height/top/left; 1–2
animated elements per view; list/step staggering 40ms per item, capped at 8 items;
modals scale from 0.97 + fade; graph animations (new commit slides into lane, branch
pointer glides, rebase replays commits sequentially) must be interruptible and never
block input.

**`prefers-reduced-motion: reduce`:** all durations → 0ms; simulator renders final
state instantly (the command log narrates the change instead); progress bars static;
no staggering. This is implemented globally via a media query zeroing the motion
tokens, plus a user override toggle in `/settings` (stored pref wins over media query).

## 7. Iconography

lucide-react only, stroke width 2, one style level (outline) everywhere. Sizes: 16px
(inline/badges), 20px (buttons, nav), 24px (feature cards). Git semantics use the
lucide git set: `git-branch`, `git-commit-horizontal`, `git-merge`,
`git-pull-request`, `github` (brand), `terminal`, `history` (undo), `shield-check` /
`triangle-alert` / `octagon-alert` (risk). Icon-only buttons require `aria-label`.
No emojis as icons, ever.

## 8. Product-specific visual metaphors

1. **Blueprint grid** — page background is the `--grid-line` 40px grid with 200px major lines (CSS gradients, ported from legacy `.blueprint-bg`). Content surfaces sit on top like drafted components.
2. **NODE_0x schematic labels** — mono uppercase micro-labels (`NODE_01`, `REF_HEAD`, `OP_REBASE`) tag cards, tutorial steps, and simulator states. Sequential, deadpan, industrial.
3. **Branch-graph motif** — a thin 2px lane line with a node dot is the signature decorative element: section dividers, list bullets in guides, the loading indicator (a commit dot traveling a lane), and the logo lockup.
4. **Terminal panel** — always-dark panel (`--surface-terminal`, `--radius-md`) with a mono header row (`bash — read-only`), command lines prefixed `$` in `--term-prompt`, copy button per command, and a risk badge when applicable. THE canonical way commands appear anywhere on the site.
5. **SHA chips** — 7-char pseudo-hashes in `--radius-xs` mono chips connect prose ↔ graph (hovering a chip highlights the node).
6. **Hazard treatment for destructive ops** — see §9. Unmistakable, slightly loud on purpose.
7. **Checkpoint stamps** — tutorial checkpoints render as circular "inspection stamps" (mono `CK-03 ✓`) that fill with `--risk-safe-fg` when done.

## 9. Destructive-command warning treatment (binding)

Any UI showing a destructive command (`reset --hard`, `push --force`, `clean -fd`,
history rewrites) MUST render ALL of:

1. Risk badge: `octagon-alert` icon + `DESTRUCTIVE` mono uppercase label in `--risk-danger-fg` on `--risk-danger-bg` with `--risk-danger-border`.
2. 3px left border in `--risk-danger-fg` on the containing panel + `--risk-danger-bg` tint.
3. One-line consequence statement ("Permanently discards uncommitted changes") + safer alternative link when one exists.
4. Copy button gated: first click arms it ("Copy anyway?" state, `--motion-fast` shake suppressed under reduced motion); second click copies. AI `nl-to-command` destructive results follow the same gate.
5. In the simulator, destructive ops open a confirm dialog (danger button on the right, cancel is the default focus) before mutating the graph.

## 10. Component inventory (all states required)

States legend: D=default, H=hover, F=focus-visible, A=active/pressed, Dis=disabled,
L=loading, E=error/empty. Every interactive component: `cursor-pointer`, ≥44×44px
target (24px absolute minimum per WCAG 2.2), visible focus ring (2px `--ring`, 2px
offset), `--motion-fast` feedback.

| Component | States | Notes |
|---|---|---|
| Button — primary | D H F A Dis L | Accent fill + `--accent-contrast` text; L = spinner replaces label, width locked; Dis = 45% opacity + `cursor-not-allowed` |
| Button — secondary | D H F A Dis L | `--surface` + `--border-strong`; H = `--surface-raised` |
| Button — ghost | D H F A Dis | Text-only; H = subtle surface tint |
| Button — danger | D H F A Dis L | `--risk-danger-fg` fill (dark: `#F87171` w/ `#0B1220` text; light: `#B91C1C` w/ white) |
| Risk badge | D | Static; icon + label + colors per §1.3 |
| Terminal panel + copy button | D H F A L E | Copy: idle → copied (`check` icon, 2s) → idle; destructive gate per §9 |
| Command input (simulator) | D F Dis E | Mono; E = inline error + suggestion, `aria-describedby` |
| Graph canvas (SVG) | D + node H/F | Nodes keyboard-focusable (roving tabindex), tooltip on focus/hover; zoom/pan buttons as alternative to drag (WCAG 2.5.7) |
| Node card (workflow/feature) | D H F A(selected) | Selected = accent ring + glow (only permitted glow); ported from legacy |
| Tabs (Desktop/CLI path) | D H F A(selected) Dis | Underline indicator slides (`--motion-base`); arrow-key navigation |
| Stepper / checkpoint list | D A(done) F | Stamps per §8.7; progress persists locally |
| Quiz option | D H F A(selected) correct incorrect Dis | Correct/incorrect use risk-safe/danger tokens + icons + text ("Correct") — never color alone |
| Text input / textarea / select | D H F Dis E | Visible labels always (no placeholder-as-label); E = `--risk-danger-fg` border + message below field + `role=alert` |
| Toggle / checkbox / radio | D H F A Dis | Native semantics; accent when on |
| Tooltip | D | On hover AND focus; dismissible with Esc (WCAG 1.4.13) |
| Modal / confirm dialog | D L | Focus trap, Esc closes (except mid-destructive-confirm), return focus to trigger; scrim per §5 |
| Toast | D | `aria-live="polite"`, auto-dismiss 4s, never steals focus; undo action where applicable |
| Dropdown / combobox (gitignore multi-select) | D H F A Dis E | Listbox semantics, type-ahead |
| Table (analyzer results, reference) | D H(row) | Sticky header, `aria-sort` on sortable columns; mobile → stacked cards |
| Score meter (docs health) | D L E | Number + label + bar; tabular-nums; no data = honest empty state |
| Skeleton | L | `animate-pulse` surfaces; reserve exact dimensions (CLS < 0.1) |
| Empty state | E | Icon + one sentence + primary action; no fake data |
| Error state (route + inline) | E | Cause + recovery action; root `error.tsx` on-brand |
| AI output card | D L E | ALWAYS labeled "AI-generated" chip; L = skeleton + "thinking" line; E = honest "AI unavailable" + deterministic fallback link + BYOK pointer |
| Quota indicator | D warn reached | Mono counter `AI 3/10`; reached = caution tokens + `quota_reached` event |
| BYOK input | D F E | Masked, never persisted server-side, "stored only on this device" helper text |
| Cookie consent banner | D | Two equal-weight buttons (Accept / Decline), no dark patterns; default declined |
| Theme toggle | D H F A | Sun/moon + system option; no flash (inline script sets `data-theme` pre-paint) |
| Site nav / footer | D H F A(current) | Current page marked with `aria-current="page"` + accent indicator; footer carries the exact creator sentence |
| Breadcrumbs (guides, reference) | D H F | `BreadcrumbList` JSON-LD |
| Pagination / prev-next (tutorials) | D H F Dis | Keyboard reachable, preserves scroll state |

## 11. Accessibility constraints (WCAG 2.2 AA — binding)

1. Contrast: text ≥4.5:1 (values in §1 verified), large text ≥3:1, UI components/graph elements ≥3:1. Dark AND light audited independently.
2. Focus visible (2.4.7) + focus not obscured (2.4.11): sticky nav must never cover a focused element — `scroll-margin-top` on all focus targets.
3. Target size (2.5.8): ≥24×24px minimum, 44×44px standard for touch.
4. Dragging alternative (2.5.7): graph pan/zoom has button equivalents.
5. Keyboard: everything operable; roving tabindex in graph; skip link (ported from legacy); logical heading hierarchy per page (single h1).
6. Screen readers: the simulator's command log is an `aria-live="polite"` region narrating each operation ("Committed a1b2c3d on feature/login"); SVG has `role="img"` + summary label; data tables accompany scores.
7. Color independence: risk = color + icon + text; quiz feedback = color + icon + word; lanes = color + label + (beyond 6) dash pattern.
8. Reduced motion per §6; zoom to 200% without horizontal scroll; `text-wrap: balance` on headings, no justified text.
9. Forms: visible labels, `autocomplete` where sensible, errors linked via `aria-describedby`, focus moves to first invalid field on submit.
10. Uppercase display text keeps normal letterforms readable — uppercase styling via CSS `text-transform`, source text sentence-case (screen readers read it sanely).

## 12. Tailwind v4 `@theme` mapping (implement verbatim in `src/app/globals.css`)

```css
@import "tailwindcss";

/* Dark is default; light set via data-theme="light". Inline pre-paint script
   sets data-theme from stored pref, else "dark". */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  /* ---- dark (default) ---- */
  --bg: #0B1220;
  --surface: #111A2C;
  --surface-raised: #182338;
  --surface-terminal: #070C16;
  --border: #263349;
  --border-strong: #3A4A66;
  --text: #E6ECF8;
  --text-secondary: #9BA8BF;
  --text-muted: #64748B;
  --accent: #F05032;
  --accent-hover: #FF6A4D;
  --accent-active: #D9432A;
  --accent-contrast: #0B1220;
  --ring-c: #FF7A5C;
  --selection: rgba(240, 80, 50, 0.30);
  --grid-line: rgba(240, 80, 50, 0.035);
  --grid-line-major: rgba(240, 80, 50, 0.07);

  --risk-safe-fg: #4ADE80;
  --risk-safe-bg: rgba(74, 222, 128, 0.10);
  --risk-safe-border: rgba(74, 222, 128, 0.35);
  --risk-caution-fg: #FBBF24;
  --risk-caution-bg: rgba(251, 191, 36, 0.10);
  --risk-caution-border: rgba(251, 191, 36, 0.35);
  --risk-danger-fg: #F87171;
  --risk-danger-bg: rgba(248, 113, 113, 0.12);
  --risk-danger-border: rgba(248, 113, 113, 0.45);

  --lane-1: #F05032; --lane-2: #38BDF8; --lane-3: #4ADE80;
  --lane-4: #FACC15; --lane-5: #F472B6; --lane-6: #A78BFA;

  --term-bg: #070C16; --term-text: #D5DEED; --term-prompt: #FF6A4D;
  --term-ok: #4ADE80; --term-warn: #FBBF24; --term-err: #F87171;
  --term-comment: #64748B;

  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.40);
  --shadow-2: 0 4px 12px rgba(0, 0, 0, 0.45);
  --shadow-3: 0 12px 32px rgba(0, 0, 0, 0.50);
  --scrim: rgba(3, 7, 18, 0.65);

  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --motion-graph: 400ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

[data-theme="light"] {
  --bg: #F7F9FC;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --surface-terminal: #0F172A;
  --border: #D8DFEA;
  --border-strong: #B9C4D6;
  --text: #131C2B;
  --text-secondary: #46536A;
  --text-muted: #5D6B84;
  --accent: #C0391F;
  --accent-hover: #A93018;
  --accent-active: #8F2814;
  --accent-contrast: #FFFFFF;
  --ring-c: #C0391F;
  --selection: rgba(240, 80, 50, 0.25);
  --grid-line: rgba(192, 57, 31, 0.05);
  --grid-line-major: rgba(192, 57, 31, 0.10);

  --risk-safe-fg: #15803D;
  --risk-safe-bg: rgba(21, 128, 61, 0.08);
  --risk-safe-border: rgba(21, 128, 61, 0.35);
  --risk-caution-fg: #A16207;
  --risk-caution-bg: rgba(161, 98, 7, 0.08);
  --risk-caution-border: rgba(161, 98, 7, 0.35);
  --risk-danger-fg: #B91C1C;
  --risk-danger-bg: rgba(185, 28, 28, 0.07);
  --risk-danger-border: rgba(185, 28, 28, 0.40);

  --lane-1: #C0391F; --lane-2: #0369A1; --lane-3: #15803D;
  --lane-4: #A16207; --lane-5: #BE185D; --lane-6: #6D28D9;

  --shadow-1: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-2: 0 4px 12px rgba(16, 24, 40, 0.10);
  --shadow-3: 0 16px 40px rgba(16, 24, 40, 0.14);
  --scrim: rgba(19, 28, 43, 0.55);
}

@media (prefers-reduced-motion: reduce) {
  :root:not([data-motion="allow"]) {
    --motion-fast: 0ms;
    --motion-base: 0ms;
    --motion-slow: 0ms;
    --motion-graph: 0ms;
  }
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-terminal: var(--surface-terminal);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-fg: var(--text);
  --color-fg-secondary: var(--text-secondary);
  --color-fg-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-active: var(--accent-active);
  --color-accent-contrast: var(--accent-contrast);
  --color-ring: var(--ring-c);

  --color-risk-safe: var(--risk-safe-fg);
  --color-risk-safe-bg: var(--risk-safe-bg);
  --color-risk-safe-border: var(--risk-safe-border);
  --color-risk-caution: var(--risk-caution-fg);
  --color-risk-caution-bg: var(--risk-caution-bg);
  --color-risk-caution-border: var(--risk-caution-border);
  --color-risk-danger: var(--risk-danger-fg);
  --color-risk-danger-bg: var(--risk-danger-bg);
  --color-risk-danger-border: var(--risk-danger-border);

  --color-lane-1: var(--lane-1);
  --color-lane-2: var(--lane-2);
  --color-lane-3: var(--lane-3);
  --color-lane-4: var(--lane-4);
  --color-lane-5: var(--lane-5);
  --color-lane-6: var(--lane-6);

  --color-term-text: var(--term-text);
  --color-term-prompt: var(--term-prompt);
  --color-term-ok: var(--term-ok);
  --color-term-warn: var(--term-warn);
  --color-term-err: var(--term-err);
  --color-term-comment: var(--term-comment);

  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --shadow-1: var(--shadow-1);
  --shadow-2: var(--shadow-2);
  --shadow-3: var(--shadow-3);
}

@layer base {
  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: var(--selection); }
  :focus-visible {
    outline: 2px solid var(--ring-c);
    outline-offset: 2px;
  }
  [id] { scroll-margin-top: 6rem; } /* WCAG 2.4.11 vs sticky nav */
}

@layer components {
  .blueprint-bg {
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid-line-major) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px),
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 200px 200px, 200px 200px, 40px 40px, 40px 40px;
  }
}
```

Usage examples the implementation must follow: `bg-surface border-border text-fg`,
`text-fg-secondary`, `bg-risk-danger-bg text-risk-danger border-risk-danger-border`,
`stroke-lane-2`, `font-mono text-[0.6875rem] uppercase tracking-[0.18em]` (schematic
label). Raw hex in components is a review-blocking violation.

## 13. Page-level composition rules

- Landing: hero (display XL, left-aligned, blueprint grid visible, live simulator teaser on the right — NOT a giant empty hero), feature grid of node cards, terminal-panel demo, honest capability list, single primary CTA ("Open the simulator") above the fold.
- Workspace pages (`/tool`, `/analyzer`, `/gitignore`, `/commits`, `/undo`): tool-first layout, h1 compact, controls left / result right (stacked on mobile), no marketing filler.
- Content pages (`/guides/*`, `/docs`): `max-w-5xl` prose, sticky in-page TOC ≥1024px, terminal panels for every command, breadcrumbs.
- Breakpoints: 375 / 640 / 768 / 1024 / 1280. Mobile-first; no horizontal scroll; graph canvas scrolls/zooms within its own container.
