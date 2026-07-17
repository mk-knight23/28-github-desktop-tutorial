/**
 * Zod OUTPUT schemas passed to generateObject (STANDARDS §10).
 *
 * SERVER-ONLY. These mirror the TS output types in types.ts one-for-one, so the
 * model is forced to return exactly the shape the UI renders. `.describe()` calls
 * double as field-level instructions to the model.
 */

import { z } from "zod";
import type { CapabilitySlug } from "@/lib/ai/types";

const riskEnum = z
  .enum(["safe", "caution", "destructive"])
  .describe("safe = read-only or trivially reversible; caution = changes history/working tree but recoverable; destructive = can lose work");

const commandWithRisk = z.object({
  command: z.string().describe("A single git command, exactly as typed"),
  note: z.string().describe("What this command does, one sentence"),
  riskLevel: riskEnum,
});

export const nlToCommandOutput = z.object({
  command: z.string().describe("The git command that accomplishes the request"),
  explanation: z.string().describe("Plain-English explanation of what it does"),
  riskLevel: riskEnum,
  destructiveWarning: z
    .string()
    .nullable()
    .describe("Non-null ONLY when riskLevel is destructive: the concrete consequence"),
  saferAlternative: z
    .string()
    .nullable()
    .describe("A safer command that achieves a similar goal, or null"),
  undoGuidance: z.string().describe("How to undo or recover if this goes wrong"),
});

export const explainErrorOutput = z.object({
  summary: z.string().describe("One-line statement of what went wrong"),
  cause: z.string().describe("Why git produced this error"),
  fixSteps: z.array(z.string()).describe("Ordered steps to resolve it"),
  commands: z.array(commandWithRisk).describe("Relevant commands, if any"),
  prevention: z.string().nullable().describe("How to avoid it next time, or null"),
});

export const explainConflictOutput = z.object({
  overview: z.string().describe("What is conflicting and why, in plain English"),
  hunks: z
    .array(
      z.object({
        description: z.string().describe("Which region this hunk covers"),
        ours: z.string().describe("What the current branch (ours) contributes"),
        theirs: z.string().describe("What the incoming branch (theirs) contributes"),
        recommendation: z.string().describe("Suggested resolution for this hunk"),
      }),
    )
    .describe("Per-conflict breakdown"),
  resolutionOptions: z
    .array(
      z.object({
        label: z.string(),
        approach: z.string(),
        command: z.string().nullable(),
      }),
    )
    .describe("Distinct ways to resolve, e.g. keep ours, keep theirs, merge both"),
  nextSteps: z.array(z.string()).describe("What to do after editing the file"),
});

export const rebasePlanOutput = z.object({
  summary: z.string().describe("What the plan achieves"),
  steps: z.array(commandWithRisk).describe("Ordered rebase steps"),
  risks: z.array(z.string()).describe("What could go wrong and when"),
  rollback: z.string().describe("How to abort or recover (e.g. reflog, --abort)"),
});

export const branchStrategyOutput = z.object({
  recommendation: z.string().describe("Named strategy recommended for this context"),
  rationale: z.string().describe("Why it fits their situation"),
  workflow: z.array(z.string()).describe("Concrete day-to-day practices"),
  branchNames: z.array(z.string()).describe("Example branch names following the convention"),
  tradeoffs: z.array(z.string()).describe("Honest downsides to be aware of"),
});

export const commitFromDiffOutput = z.object({
  type: z.string().describe("Conventional Commit type (feat, fix, docs, ...)"),
  scope: z.string().nullable().describe("Optional scope, or null"),
  description: z.string().describe("Imperative, lowercase, no trailing period"),
  body: z.string().nullable().describe("Optional longer body, or null"),
  isBreaking: z.boolean().describe("True if this is a breaking change"),
  message: z.string().describe("The full assembled Conventional Commit message"),
});

export const prDescriptionOutput = z.object({
  title: z.string().describe("Concise PR title"),
  summary: z.string().describe("What this PR does and why"),
  changes: z.array(z.string()).describe("Bullet list of notable changes"),
  testing: z.array(z.string()).describe("How the change was or should be tested"),
  checklist: z.array(z.string()).describe("Reviewer checklist items"),
});

export const releaseNotesOutput = z.object({
  version: z.string().nullable().describe("Version/tag if provided, else null"),
  highlights: z.array(z.string()).describe("Top few user-facing highlights"),
  sections: z
    .array(z.object({ title: z.string(), entries: z.array(z.string()) }))
    .describe("Grouped notes, e.g. Features, Bug Fixes"),
  markdown: z.string().describe("The full release notes as markdown"),
});

export const explainCiErrorOutput = z.object({
  summary: z.string().describe("One-line statement of the failure"),
  likelyCause: z.string().describe("The most probable root cause"),
  fixSteps: z.array(z.string()).describe("Ordered steps to fix it"),
  commands: z.array(commandWithRisk).describe("Relevant commands, if any"),
});

export const OUTPUT_SCHEMAS = {
  "nl-to-command": nlToCommandOutput,
  "explain-error": explainErrorOutput,
  "explain-conflict": explainConflictOutput,
  "rebase-plan": rebasePlanOutput,
  "branch-strategy": branchStrategyOutput,
  "commit-from-diff": commitFromDiffOutput,
  "pr-description": prDescriptionOutput,
  "release-notes": releaseNotesOutput,
  "explain-ci-error": explainCiErrorOutput,
} as const satisfies Record<CapabilitySlug, z.ZodType>;
