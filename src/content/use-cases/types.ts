import type { ComponentType } from "react";
import type { GuideLink } from "@/content/guides/types";

export interface UseCaseMeta {
  slug: string;
  /** H1 and OG title. */
  title: string;
  /** Meta description (~155 chars). */
  description: string;
  /** Who this is for, e.g. "Team leads onboarding juniors". */
  audience: string;
  /** One-line card summary. */
  summary: string;
  /** In-product tools this workflow leans on. */
  tools: readonly GuideLink[];
  datePublished: string;
}

export interface UseCase extends UseCaseMeta {
  Body: ComponentType;
}
