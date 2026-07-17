/**
 * Deterministic Conventional Commit builder (PRODUCT_SPEC §3.6).
 *
 * Pure functions — no DOM, no AI. Given form fields it produces a compliant
 * commit message and a set of validation hints (length, imperative mood, spec
 * conformance). The /commits page is a thin UI over this module.
 */

export interface CommitType {
  value: string;
  label: string;
  description: string;
}

export const COMMIT_TYPES: CommitType[] = [
  { value: "feat", label: "feat", description: "A new feature" },
  { value: "fix", label: "fix", description: "A bug fix" },
  { value: "docs", label: "docs", description: "Documentation only" },
  { value: "style", label: "style", description: "Formatting, no code change" },
  { value: "refactor", label: "refactor", description: "Neither a fix nor a feature" },
  { value: "perf", label: "perf", description: "A performance improvement" },
  { value: "test", label: "test", description: "Adding or fixing tests" },
  { value: "build", label: "build", description: "Build system or dependencies" },
  { value: "ci", label: "ci", description: "CI configuration and scripts" },
  { value: "chore", label: "chore", description: "Maintenance, no src/test change" },
  { value: "revert", label: "revert", description: "Reverts a previous commit" },
];

export const COMMIT_TYPE_VALUES = COMMIT_TYPES.map((t) => t.value);

export interface CommitInput {
  type: string;
  scope: string;
  description: string;
  body: string;
  isBreaking: boolean;
  breakingDescription: string;
}

export const EMPTY_COMMIT: CommitInput = {
  type: "feat",
  scope: "",
  description: "",
  body: "",
  isBreaking: false,
  breakingDescription: "",
};

/** Recommended max header length (type+scope+description). */
export const HEADER_SOFT_LIMIT = 72;

export type HintLevel = "error" | "warning" | "info";

export interface Hint {
  level: HintLevel;
  message: string;
}

/** A few common non-imperative openers that read better as imperative verbs. */
const NON_IMPERATIVE = new Map<string, string>([
  ["added", "add"],
  ["adds", "add"],
  ["adding", "add"],
  ["fixed", "fix"],
  ["fixes", "fix"],
  ["fixing", "fix"],
  ["updated", "update"],
  ["updates", "update"],
  ["updating", "update"],
  ["removed", "remove"],
  ["removes", "remove"],
  ["changed", "change"],
  ["changes", "change"],
  ["created", "create"],
  ["implemented", "implement"],
  ["refactored", "refactor"],
]);

function isValidScope(scope: string): boolean {
  return /^[a-z0-9][a-z0-9/_-]*$/i.test(scope);
}

/** Build the raw commit message string from validated-ish input. */
export function buildCommitMessage(input: CommitInput): string {
  const scope = input.scope.trim();
  const type = input.type.trim();
  const bang = input.isBreaking ? "!" : "";
  const scopePart = scope ? `(${scope})` : "";
  const header = `${type}${scopePart}${bang}: ${input.description.trim()}`;

  const parts: string[] = [header];

  const body = input.body.trim();
  if (body) parts.push(body);

  if (input.isBreaking) {
    const desc = input.breakingDescription.trim() || input.description.trim();
    parts.push(`BREAKING CHANGE: ${desc}`);
  }

  return parts.join("\n\n");
}

/** Produce validation hints for the current input. Order: errors, then warnings. */
export function validateCommit(input: CommitInput): Hint[] {
  const hints: Hint[] = [];
  const description = input.description.trim();

  if (!COMMIT_TYPE_VALUES.includes(input.type)) {
    hints.push({ level: "error", message: `"${input.type}" is not a Conventional Commit type.` });
  }

  if (!description) {
    hints.push({ level: "error", message: "A description is required." });
  } else {
    const firstWord = description.split(/\s+/)[0]?.toLowerCase() ?? "";
    const suggestion = NON_IMPERATIVE.get(firstWord);
    if (suggestion) {
      hints.push({
        level: "warning",
        message: `Use the imperative mood: start with "${suggestion}", not "${firstWord}".`,
      });
    }
    if (/[.]$/.test(description)) {
      hints.push({ level: "warning", message: "Drop the trailing period from the description." });
    }
    if (description[0] && description[0] === description[0].toUpperCase() && /[a-z]/i.test(description[0])) {
      hints.push({ level: "info", message: "Conventional Commits usually keep the description lowercase." });
    }
  }

  const scope = input.scope.trim();
  if (scope && !isValidScope(scope)) {
    hints.push({
      level: "warning",
      message: "Scope should be a short noun with no spaces (e.g. auth, api, ui).",
    });
  }

  if (description) {
    const scopePart = scope ? `(${scope})` : "";
    const headerLength = `${input.type}${scopePart}${input.isBreaking ? "!" : ""}: ${description}`.length;
    if (headerLength > HEADER_SOFT_LIMIT) {
      hints.push({
        level: "warning",
        message: `Header is ${headerLength} characters — aim for ${HEADER_SOFT_LIMIT} or fewer.`,
      });
    }
  }

  if (input.isBreaking && !input.breakingDescription.trim()) {
    hints.push({
      level: "info",
      message: "Describe the breaking change so the footer explains what changed.",
    });
  }

  return hints;
}

/** True when the message is spec-valid enough to copy (no error-level hints). */
export function isCommitValid(input: CommitInput): boolean {
  return !validateCommit(input).some((h) => h.level === "error");
}
