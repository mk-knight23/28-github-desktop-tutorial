/**
 * Client-safe catalog describing each AI capability for the /assistant hub.
 *
 * Pure data — no `ai` SDK, no Node. Drives the capability picker, headings, and
 * the honest "what happens without a key" copy.
 */

import type { CapabilitySlug } from "@/lib/ai/types";
import { hasFallback } from "@/lib/ai/fallbacks";

export type CapabilityTier = "fast" | "quality";

export interface CapabilityMeta {
  slug: CapabilitySlug;
  title: string;
  blurb: string;
  /** Short model-tier hint shown in the UI. */
  tier: CapabilityTier;
  /** True when a deterministic non-AI result is available offline. */
  hasFallback: boolean;
  /**
   * What the user gets when AI is unavailable: either the deterministic result,
   * or a pointer to the matching deterministic tool elsewhere in the app.
   */
  degraded: string;
  /** Analytics + history label — never the user's text. */
  label: string;
}

export const CAPABILITIES: CapabilityMeta[] = [
  {
    slug: "nl-to-command",
    title: "Describe it, get the command",
    blurb:
      "Say what you want to do in plain English and get the git command, its risk level, and how to undo it.",
    tier: "fast",
    hasFallback: hasFallback("nl-to-command"),
    degraded:
      "Without AI, this matches your words to the closest entry in the command reference and labels it as a lookup, not a generated answer.",
    label: "NL to command",
  },
  {
    slug: "explain-error",
    title: "Explain a git error",
    blurb: "Paste a git error message and get the likely cause plus concrete fix steps.",
    tier: "quality",
    hasFallback: hasFallback("explain-error"),
    degraded:
      "No deterministic equivalent. Without AI, search the error in the command reference or the undo helper.",
    label: "Explain error",
  },
  {
    slug: "explain-conflict",
    title: "Understand a merge conflict",
    blurb:
      "Paste conflict-marked file content and see what each side means and how to resolve it.",
    tier: "quality",
    hasFallback: hasFallback("explain-conflict"),
    degraded:
      "No deterministic equivalent. Without AI, see the merge and rebase guides for how conflict markers work.",
    label: "Explain conflict",
  },
  {
    slug: "rebase-plan",
    title: "Plan a rebase",
    blurb: "Describe your branches and goal to get a step-by-step rebase plan with risk notes.",
    tier: "quality",
    hasFallback: hasFallback("rebase-plan"),
    degraded:
      "No deterministic equivalent. Without AI, practice the moves in the simulator and read the rebase reference.",
    label: "Rebase plan",
  },
  {
    slug: "branch-strategy",
    title: "Pick a branching strategy",
    blurb: "Share your team context to get a strategy recommendation and branch-name conventions.",
    tier: "quality",
    hasFallback: hasFallback("branch-strategy"),
    degraded:
      "No deterministic equivalent. Without AI, read the branch-strategy guide for the common options.",
    label: "Branch strategy",
  },
  {
    slug: "commit-from-diff",
    title: "Commit message from a diff",
    blurb: "Paste a diff and get a Conventional Commit message.",
    tier: "fast",
    hasFallback: hasFallback("commit-from-diff"),
    degraded:
      "Without AI, a heuristic reads the changed paths and builds a Conventional Commit with the deterministic commit builder.",
    label: "Commit from diff",
  },
  {
    slug: "pr-description",
    title: "Draft a PR description",
    blurb: "Paste your commit list or a summary to get a structured pull-request description.",
    tier: "quality",
    hasFallback: hasFallback("pr-description"),
    degraded:
      "Without AI, your commits are arranged into a standard PR template you can edit.",
    label: "PR description",
  },
  {
    slug: "release-notes",
    title: "Generate release notes",
    blurb: "Paste a commit list to get grouped, readable release notes.",
    tier: "quality",
    hasFallback: hasFallback("release-notes"),
    degraded:
      "Without AI, Conventional Commits are grouped by type into a changelog — fully deterministic.",
    label: "Release notes",
  },
  {
    slug: "explain-ci-error",
    title: "Triage a CI failure",
    blurb: "Paste a CI log excerpt to get the likely cause and fixes.",
    tier: "quality",
    hasFallback: hasFallback("explain-ci-error"),
    degraded:
      "No deterministic equivalent. Without AI, see the CI-failure-triage guide for a manual checklist.",
    label: "Explain CI error",
  },
];

export function getCapability(slug: CapabilitySlug): CapabilityMeta {
  const meta = CAPABILITIES.find((capability) => capability.slug === slug);
  if (!meta) throw new Error(`Unknown capability: ${slug}`);
  return meta;
}
