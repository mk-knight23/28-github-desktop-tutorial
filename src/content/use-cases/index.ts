/**
 * Use-case registry (PRODUCT_SPEC §5, ≥5). Each shows how the whole toolkit fits
 * a specific job. Order here drives /use-cases and the sitemap.
 */

import type { UseCase } from "./types";
import { useCase as onboardingJuniors } from "./onboarding-junior-developers";
import { useCase as bootcampTeaching } from "./teaching-git-in-a-bootcamp";
import { useCase as prHygiene } from "./pull-request-hygiene";
import { useCase as recoveringMistakes } from "./recovering-from-git-mistakes";
import { useCase as auditingRepoHealth } from "./auditing-repo-health";

export type { UseCase, UseCaseMeta } from "./types";

export const USE_CASES: readonly UseCase[] = [
  onboardingJuniors,
  bootcampTeaching,
  prHygiene,
  recoveringMistakes,
  auditingRepoHealth,
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
