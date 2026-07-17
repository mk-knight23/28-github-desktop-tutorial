/**
 * Changelog entries (PRODUCT_SPEC §5). Honest record of what actually shipped in
 * this rebuild — no invented version history. Newest first. Mirrored in
 * CHANGELOG.md at the repo root.
 */

export type ChangeKind = "added" | "changed" | "fixed" | "security";

export interface ChangelogChange {
  kind: ChangeKind;
  text: string;
}

export interface ChangelogRelease {
  version: string;
  date: string;
  /** Short headline for the release. */
  summary: string;
  changes: readonly ChangelogChange[];
}

export const CHANGELOG: readonly ChangelogRelease[] = [
  {
    version: "2.0.0",
    date: "2026-07-17",
    summary: "Full rebuild on Next.js App Router with a local-first, blueprint design system.",
    changes: [
      { kind: "added", text: "Interactive branch simulator with an in-memory Git engine (commit, branch, checkout, merge, rebase, reset) and an SVG graph you can undo, reset, and export." },
      { kind: "added", text: "Guided tutorials for GitHub Desktop and the command line across three levels, with local progress tracking." },
      { kind: "added", text: "Risk-graded command reference with a page per command, filtering, and undo guidance." },
      { kind: "added", text: "Deterministic tools: .gitignore generator, Conventional Commit builder, and an undo/recovery decision helper." },
      { kind: "added", text: "Public repository analyzer with a documented docs-health rubric and an actionable checklist." },
      { kind: "added", text: "Topic quizzes with per-question explanations and locally-stored results." },
      { kind: "added", text: "AI assistant with nine capabilities behind honest availability states, deterministic fallbacks, and an optional bring-your-own-key path." },
      { kind: "added", text: "Long-form guides and task-based use cases, plus docs and a full set of policy pages." },
      { kind: "added", text: "SEO scaffolding: per-page metadata and canonicals, sitemap, robots, structured data, and an OG image." },
      { kind: "added", text: "Consent-gated analytics that stay fully disabled until you accept, with no content ever sent." },
      { kind: "changed", text: "Adopted a dark-first blueprint visual language with full light-mode support and no external font or asset CDNs." },
      { kind: "security", text: "Security headers, zod-validated API input with size limits, and best-effort per-IP rate limiting on API routes." },
    ],
  },
];
