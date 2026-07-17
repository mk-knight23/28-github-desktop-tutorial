import type { ComponentType } from "react";
import type { HowToStep } from "@/lib/jsonld";

export interface GuideLink {
  href: string;
  label: string;
}

export interface GuideMeta {
  slug: string;
  /** H1 and OG title. */
  title: string;
  /** Meta description (~155 chars). */
  description: string;
  /** Grouping label, e.g. "Branching", "Recovery". */
  category: string;
  /** Honest estimate for the reader, in minutes. */
  readingMinutes: number;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  dateUpdated?: string;
  /** In-product links shown at the end (tool ↔ guide internal linking, §5). */
  related?: readonly GuideLink[];
  /** Present only on step-based guides — drives HowTo JSON-LD. */
  howTo?: readonly HowToStep[];
}

export interface Guide extends GuideMeta {
  Body: ComponentType;
}
