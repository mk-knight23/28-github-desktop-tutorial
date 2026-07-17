/**
 * Zod input schemas for every AI capability (STANDARDS §8 / §10).
 *
 * Client and server both import these: the browser validates before sending
 * (fast feedback, smaller payloads) and the route re-validates on arrival (never
 * trust the client). Every free-text field has an explicit max length so a route
 * can reject oversized bodies before any model call.
 *
 * NOTE (privacy): none of these schemas accept credentials, tokens, or secret
 * material. The BYOK key travels only in the `x-byok-key` header and is never
 * part of a request body — so it is structurally impossible to log it via input.
 */

import { z } from "zod";
import type { CapabilitySlug } from "@/lib/ai/types";

/** Shared field limits (characters). Documented in AI_ARCHITECTURE.md. */
export const INPUT_LIMITS = {
  shortText: 2_000,
  errorLog: 8_000,
  conflict: 20_000,
  diff: 30_000,
  commitList: 20_000,
  ciLog: 20_000,
} as const;

const trimmedText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter some ${label} first.`)
    .max(max, `Keep ${label} under ${max.toLocaleString()} characters.`);

export const nlToCommandInput = z.object({
  text: trimmedText(INPUT_LIMITS.shortText, "a description"),
  /** Optional: which interface the user works in, to tailor the answer. */
  surface: z.enum(["cli", "desktop"]).optional(),
});

export const explainErrorInput = z.object({
  errorText: trimmedText(INPUT_LIMITS.errorLog, "an error message"),
});

export const explainConflictInput = z.object({
  conflictText: trimmedText(INPUT_LIMITS.conflict, "conflict-marked content"),
});

export const rebasePlanInput = z.object({
  goal: trimmedText(INPUT_LIMITS.shortText, "your goal"),
  branches: z
    .string()
    .trim()
    .max(INPUT_LIMITS.shortText, "Keep the branch notes short.")
    .optional(),
});

export const branchStrategyInput = z.object({
  context: trimmedText(INPUT_LIMITS.shortText, "your team context"),
});

export const commitFromDiffInput = z.object({
  diff: trimmedText(INPUT_LIMITS.diff, "a diff"),
});

export const prDescriptionInput = z.object({
  commits: trimmedText(INPUT_LIMITS.commitList, "a commit list or summary"),
});

export const releaseNotesInput = z.object({
  commits: trimmedText(INPUT_LIMITS.commitList, "a commit list"),
  version: z
    .string()
    .trim()
    .max(40, "Version tag is too long.")
    .optional(),
});

export const explainCiErrorInput = z.object({
  logText: trimmedText(INPUT_LIMITS.ciLog, "a CI log excerpt"),
});

/** Registry of input schemas keyed by capability slug. */
export const INPUT_SCHEMAS = {
  "nl-to-command": nlToCommandInput,
  "explain-error": explainErrorInput,
  "explain-conflict": explainConflictInput,
  "rebase-plan": rebasePlanInput,
  "branch-strategy": branchStrategyInput,
  "commit-from-diff": commitFromDiffInput,
  "pr-description": prDescriptionInput,
  "release-notes": releaseNotesInput,
  "explain-ci-error": explainCiErrorInput,
} as const satisfies Record<CapabilitySlug, z.ZodType>;

export type CapabilityInputMap = {
  [S in CapabilitySlug]: z.infer<(typeof INPUT_SCHEMAS)[S]>;
};

export type CapabilityInput<S extends CapabilitySlug> = CapabilityInputMap[S];
