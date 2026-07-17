/**
 * Shared AI-layer types (PRODUCT_SPEC §3.8, STANDARDS §10).
 *
 * These are client-safe: no `ai` SDK import, no Node APIs. Both the browser UI
 * and the API route handler build on the same capability slugs and output
 * shapes, so a response the server produces always matches what the UI renders.
 */

import type { RiskLevel } from "@/lib/git-engine";

export type { RiskLevel };

/** The nine AI capabilities exposed at POST /api/ai/<capability>. */
export type CapabilitySlug =
  | "nl-to-command"
  | "explain-error"
  | "explain-conflict"
  | "rebase-plan"
  | "branch-strategy"
  | "commit-from-diff"
  | "pr-description"
  | "release-notes"
  | "explain-ci-error";

export const CAPABILITY_SLUGS: readonly CapabilitySlug[] = [
  "nl-to-command",
  "explain-error",
  "explain-conflict",
  "rebase-plan",
  "branch-strategy",
  "commit-from-diff",
  "pr-description",
  "release-notes",
  "explain-ci-error",
] as const;

export function isCapabilitySlug(value: string): value is CapabilitySlug {
  return (CAPABILITY_SLUGS as readonly string[]).includes(value);
}

/* ----------------------------- output shapes ----------------------------- */

export interface CommandWithRisk {
  command: string;
  note: string;
  riskLevel: RiskLevel;
}

export interface NlToCommandOutput {
  command: string;
  explanation: string;
  riskLevel: RiskLevel;
  /** Present only for destructive results; gates the copy button. */
  destructiveWarning: string | null;
  saferAlternative: string | null;
  undoGuidance: string;
}

export interface ExplainErrorOutput {
  summary: string;
  cause: string;
  fixSteps: string[];
  commands: CommandWithRisk[];
  prevention: string | null;
}

export interface ConflictHunk {
  description: string;
  ours: string;
  theirs: string;
  recommendation: string;
}

export interface ResolutionOption {
  label: string;
  approach: string;
  command: string | null;
}

export interface ExplainConflictOutput {
  overview: string;
  hunks: ConflictHunk[];
  resolutionOptions: ResolutionOption[];
  nextSteps: string[];
}

export interface RebasePlanOutput {
  summary: string;
  steps: CommandWithRisk[];
  risks: string[];
  rollback: string;
}

export interface BranchStrategyOutput {
  recommendation: string;
  rationale: string;
  workflow: string[];
  branchNames: string[];
  tradeoffs: string[];
}

export interface CommitFromDiffOutput {
  type: string;
  scope: string | null;
  description: string;
  body: string | null;
  isBreaking: boolean;
  message: string;
}

export interface PrDescriptionOutput {
  title: string;
  summary: string;
  changes: string[];
  testing: string[];
  checklist: string[];
}

export interface ReleaseNotesSection {
  title: string;
  entries: string[];
}

export interface ReleaseNotesOutput {
  version: string | null;
  highlights: string[];
  sections: ReleaseNotesSection[];
  markdown: string;
}

export interface ExplainCiErrorOutput {
  summary: string;
  likelyCause: string;
  fixSteps: string[];
  commands: CommandWithRisk[];
}

/** Maps each slug to its output type — keeps client and server in lockstep. */
export interface CapabilityOutputMap {
  "nl-to-command": NlToCommandOutput;
  "explain-error": ExplainErrorOutput;
  "explain-conflict": ExplainConflictOutput;
  "rebase-plan": RebasePlanOutput;
  "branch-strategy": BranchStrategyOutput;
  "commit-from-diff": CommitFromDiffOutput;
  "pr-description": PrDescriptionOutput;
  "release-notes": ReleaseNotesOutput;
  "explain-ci-error": ExplainCiErrorOutput;
}

export type CapabilityOutput<S extends CapabilitySlug> = CapabilityOutputMap[S];

/* --------------------------- response envelope --------------------------- */

/** Error codes are intentionally coarse so responses leak nothing. */
export type AiErrorCode =
  | "invalid-input"
  | "rate-limited"
  | "quota-exceeded"
  | "unavailable"
  | "cancelled"
  | "upstream-error"
  | "bad-output";

export interface AiSuccess<S extends CapabilitySlug> {
  status: "ok";
  capability: S;
  /** Gateway model string that produced the result. */
  model: string;
  data: CapabilityOutput<S>;
}

export interface AiFailure {
  status: "error";
  capability: string;
  code: AiErrorCode;
  /** Safe, user-facing message. Never contains upstream or input detail. */
  message: string;
  /** Seconds to wait, when the code is rate-limited or quota-exceeded. */
  retryAfter?: number;
}

export type AiResponse<S extends CapabilitySlug> = AiSuccess<S> | AiFailure;

export function isAiSuccess<S extends CapabilitySlug>(
  response: AiResponse<S>,
): response is AiSuccess<S> {
  return response.status === "ok";
}
