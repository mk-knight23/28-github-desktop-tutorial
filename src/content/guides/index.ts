/**
 * Guide registry (PRODUCT_SPEC §5, ≥8 original long-form guides). Each guide is
 * its own module with metadata + a Body component; this file assembles them and
 * provides lookup + prev/next helpers for the dynamic route.
 *
 * Order here is the display order on /guides and the sitemap.
 */

import type { Guide } from "./types";
import { guide as rebaseVsMerge } from "./rebase-vs-merge";
import { guide as undoAnything } from "./undo-anything-in-git";
import { guide as conventionalCommits } from "./conventional-commits";
import { guide as gitignorePatterns } from "./gitignore-patterns";
import { guide as githubDesktopWorkflow } from "./github-desktop-workflow";
import { guide as branchStrategies } from "./branch-strategies";
import { guide as readingTheDag } from "./reading-the-dag";
import { guide as ciFailureTriage } from "./ci-failure-triage";

export type { Guide, GuideMeta, GuideLink } from "./types";

export const GUIDES: readonly Guide[] = [
  readingTheDag,
  rebaseVsMerge,
  branchStrategies,
  undoAnything,
  conventionalCommits,
  gitignorePatterns,
  githubDesktopWorkflow,
  ciFailureTriage,
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export interface GuideNeighbors {
  prev?: Guide;
  next?: Guide;
}

/** Previous/next guide in display order, for footer navigation. */
export function getGuideNeighbors(slug: string): GuideNeighbors {
  const index = GUIDES.findIndex((g) => g.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? GUIDES[index - 1] : undefined,
    next: index < GUIDES.length - 1 ? GUIDES[index + 1] : undefined,
  };
}
