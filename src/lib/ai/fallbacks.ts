/**
 * Deterministic, non-AI fallbacks (STANDARDS §10, PRODUCT_SPEC §3.8).
 *
 * When the AI gateway is unavailable and the user has not supplied a key, the
 * assistant still produces a useful answer for the capabilities where an honest
 * deterministic path exists. These functions are pure (no DOM, no network, no
 * `ai` SDK) so they run in the browser AND under Vitest, and they are the single
 * source of truth for the "Generated locally (not AI)" results the UI labels.
 *
 * Capabilities WITHOUT a deterministic equivalent (explain-error,
 * explain-conflict, rebase-plan, branch-strategy, explain-ci-error) return no
 * fallback — the UI shows an honest "AI unavailable" state instead of inventing
 * an answer.
 */

import { REFERENCE } from "@/lib/data/reference";
import { buildCommitMessage, COMMIT_TYPE_VALUES } from "@/lib/commit-builder";
import type { CapabilityInput } from "@/lib/ai/schemas";
import type {
  CapabilitySlug,
  CommitFromDiffOutput,
  NlToCommandOutput,
  PrDescriptionOutput,
  ReleaseNotesOutput,
  ReleaseNotesSection,
} from "@/lib/ai/types";

/** Capabilities that ship a deterministic fallback. */
export const FALLBACK_SLUGS: readonly CapabilitySlug[] = [
  "nl-to-command",
  "commit-from-diff",
  "pr-description",
  "release-notes",
] as const;

export function hasFallback(slug: CapabilitySlug): boolean {
  return (FALLBACK_SLUGS as readonly string[]).includes(slug);
}

/* --------------------------- nl-to-command ------------------------------- */

const STOP_WORDS = new Set([
  "the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "my",
  "i", "me", "how", "do", "with", "this", "that", "is", "it", "git",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Match a natural-language request to the closest command in the reference by
 * keyword overlap. This is explicitly a lookup, not generation — the UI labels
 * it as such and never presents it as an AI answer.
 */
export function nlToCommandFallback(
  input: CapabilityInput<"nl-to-command">,
): NlToCommandOutput {
  const tokens = tokenize(input.text);

  let best: (typeof REFERENCE)[number] | null = null;
  let bestScore = 0;

  for (const command of REFERENCE) {
    const name = command.name.toLowerCase();
    const summary = command.summary.toLowerCase();
    const explanation = command.explanation.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (name.includes(token)) score += 3;
      if (summary.includes(token)) score += 2;
      if (explanation.includes(token)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = command;
    }
  }

  const match = bestScore > 0 ? best : null;

  if (!match) {
    return {
      command: "git status",
      explanation:
        "No close match was found in the command reference for that request. " +
        "`git status` is always safe and shows the current state, which is a good starting point.",
      riskLevel: "safe",
      destructiveWarning: null,
      saferAlternative: null,
      undoGuidance: "Nothing to undo — `git status` only reads the repository.",
    };
  }

  const command = match.examples[0]?.command ?? match.syntax;
  return {
    command,
    explanation: `${match.summary} ${match.explanation}`.trim(),
    riskLevel: match.risk,
    destructiveWarning: match.risk === "destructive" ? match.consequence ?? null : null,
    saferAlternative: match.saferAlternative ?? null,
    undoGuidance: match.undo,
  };
}

/* --------------------------- commit-from-diff ---------------------------- */

const TEST_PATH = /(^|\/)(__tests__|tests?)(\/|$)|\.(test|spec)\.[jt]sx?$/i;
const DOC_PATH = /\.(md|mdx|txt|rst)$/i;
const CI_PATH = /(^|\/)\.github\/workflows\//i;
const BUILD_PATH =
  /(^|\/)(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|tsconfig[^/]*\.json|[^/]*\.config\.[cm]?[jt]s|dockerfile|\.dockerignore)$/i;

/** Pull `b/`-side file paths out of a unified diff. */
export function parseDiffPaths(diff: string): string[] {
  const paths = new Set<string>();
  for (const line of diff.split("\n")) {
    const gitHeader = line.match(/^diff --git a\/.+ b\/(.+)$/);
    if (gitHeader?.[1]) {
      paths.add(gitHeader[1].trim());
      continue;
    }
    const plusHeader = line.match(/^\+\+\+ b\/(.+)$/);
    if (plusHeader?.[1] && plusHeader[1].trim() !== "/dev/null") {
      paths.add(plusHeader[1].trim());
    }
  }
  return [...paths];
}

function commonScope(paths: string[]): string | null {
  const segments = paths
    .map((path) => path.split("/"))
    .map((parts) => (parts[0] === "src" ? parts[1] : parts[0]))
    .filter((segment): segment is string => Boolean(segment) && !segment.includes("."));
  if (segments.length === 0) return null;
  const first = segments[0];
  return segments.every((segment) => segment === first) ? first : null;
}

export function commitFromDiffFallback(
  input: CapabilityInput<"commit-from-diff">,
): CommitFromDiffOutput {
  const diff = input.diff;
  const paths = parseDiffPaths(diff);
  const hasNewFile = /^new file mode/m.test(diff);

  let type = "chore";
  if (paths.length > 0 && paths.every((path) => TEST_PATH.test(path))) type = "test";
  else if (paths.length > 0 && paths.every((path) => DOC_PATH.test(path))) type = "docs";
  else if (paths.some((path) => CI_PATH.test(path))) type = "ci";
  else if (paths.length > 0 && paths.every((path) => BUILD_PATH.test(path))) type = "build";
  else if (hasNewFile) type = "feat";
  else if (paths.length > 0) type = "fix";

  if (!COMMIT_TYPE_VALUES.includes(type)) type = "chore";

  const scope = commonScope(paths);
  const fileNames = paths.map((path) => path.split("/").pop() ?? path);
  const subject =
    fileNames.length === 0
      ? "update changes"
      : fileNames.length === 1
        ? `${type === "feat" ? "add" : "update"} ${fileNames[0]}`
        : `${type === "feat" ? "add" : "update"} ${fileNames.length} files`;

  const body =
    paths.length > 1
      ? paths.slice(0, 20).map((path) => `- ${path}`).join("\n")
      : null;

  const message = buildCommitMessage({
    type,
    scope: scope ?? "",
    description: subject,
    body: body ?? "",
    isBreaking: false,
    breakingDescription: "",
  });

  return { type, scope, description: subject, body, isBreaking: false, message };
}

/* ---------------------------- pr-description ----------------------------- */

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s+/, "").replace(/^[0-9a-f]{7,40}\s+/i, "").trim())
    .filter((line) => line.length > 0);
}

export function prDescriptionFallback(
  input: CapabilityInput<"pr-description">,
): PrDescriptionOutput {
  const lines = splitLines(input.commits);
  const title = lines[0] ?? "Summary of changes";
  const count = lines.length;

  return {
    title,
    summary:
      count <= 1
        ? "This pull request contains a focused change. Review the diff for details."
        : `This pull request groups ${count} changes. Each is listed below.`,
    changes: lines.length > 0 ? lines : ["Describe the changes in this pull request."],
    testing: [
      "Describe how you verified these changes.",
      "Note any commands run (build, tests, lint).",
    ],
    checklist: [
      "Code builds and type-checks locally",
      "Tests added or updated where it matters",
      "Docs updated if behavior changed",
      "No secrets or credentials committed",
    ],
  };
}

/* ----------------------------- release-notes ----------------------------- */

const TYPE_SECTION: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance",
  refactor: "Refactoring",
  docs: "Documentation",
  test: "Tests",
  build: "Build System",
  ci: "Continuous Integration",
  chore: "Chores",
  revert: "Reverts",
};

const SECTION_ORDER = [
  "Features",
  "Bug Fixes",
  "Performance",
  "Refactoring",
  "Documentation",
  "Tests",
  "Build System",
  "Continuous Integration",
  "Chores",
  "Reverts",
  "Other",
];

const CONVENTIONAL = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;

export function releaseNotesFallback(
  input: CapabilityInput<"release-notes">,
): ReleaseNotesOutput {
  const lines = splitLines(input.commits);
  const grouped = new Map<string, string[]>();
  const highlights: string[] = [];

  for (const line of lines) {
    const match = line.match(CONVENTIONAL);
    if (match) {
      const [, type, scope, breaking, subject] = match;
      const section = TYPE_SECTION[type.toLowerCase()] ?? "Other";
      const entry = scope ? `**${scope}:** ${subject}` : subject;
      const withBreaking = breaking ? `${entry} (breaking change)` : entry;
      grouped.set(section, [...(grouped.get(section) ?? []), withBreaking]);
      if ((type === "feat" || type === "fix" || breaking) && highlights.length < 5) {
        highlights.push(withBreaking);
      }
    } else {
      grouped.set("Other", [...(grouped.get("Other") ?? []), line]);
    }
  }

  const sections: ReleaseNotesSection[] = SECTION_ORDER.filter((title) =>
    grouped.has(title),
  ).map((title) => ({ title, entries: grouped.get(title) ?? [] }));

  const version = input.version?.trim() || null;
  const heading = version ? `## ${version}` : "## Release notes";
  const markdown = [
    heading,
    "",
    ...sections.flatMap((section) => [
      `### ${section.title}`,
      ...section.entries.map((entry) => `- ${entry}`),
      "",
    ]),
  ]
    .join("\n")
    .trim();

  return { version, highlights, sections, markdown };
}

/* ------------------------------ dispatcher ------------------------------- */

/** Run the deterministic fallback for a slug, or null when none exists. */
export function runFallback<S extends CapabilitySlug>(
  slug: S,
  input: CapabilityInput<S>,
): NlToCommandOutput | CommitFromDiffOutput | PrDescriptionOutput | ReleaseNotesOutput | null {
  switch (slug) {
    case "nl-to-command":
      return nlToCommandFallback(input as CapabilityInput<"nl-to-command">);
    case "commit-from-diff":
      return commitFromDiffFallback(input as CapabilityInput<"commit-from-diff">);
    case "pr-description":
      return prDescriptionFallback(input as CapabilityInput<"pr-description">);
    case "release-notes":
      return releaseNotesFallback(input as CapabilityInput<"release-notes">);
    default:
      return null;
  }
}
