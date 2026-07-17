/**
 * JSON-LD structured-data builders (STANDARDS §5).
 *
 * Each function returns a plain object matching a schema.org type. Render it
 * with the <JsonLd> component. URLs are absolute (resolved against SITE_URL) so
 * they are valid regardless of where the page is crawled from.
 */

import { CREATOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Resolve a site-relative path to an absolute URL. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** WebApplication node for the landing page. */
export function webApplicationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript. Works offline after first load.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    author: personLd(),
    inLanguage: "en",
  };
}

/** Person node for the creator (STANDARDS §3). */
export function personLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CREATOR.name,
    url: CREATOR.portfolio,
    jobTitle: "AI Engineer, Full-Stack Developer, Open-Source Builder",
    sameAs: [CREATOR.github, CREATOR.portfolio],
  };
}

export interface FaqItem {
  question: string;
  /** Plain-text answer (no markup). */
  answer: string;
}

/** FAQPage node for /faq. */
export function faqPageLd(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export interface ArticleLdInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}

/** Article node for guides. */
export function articleLd(input: ArticleLdInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { "@type": "Person", name: CREATOR.name, url: CREATOR.portfolio },
    publisher: { "@type": "Person", name: CREATOR.name, url: CREATOR.portfolio },
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

/** BreadcrumbList node for nested pages. */
export function breadcrumbLd(entries: readonly BreadcrumbEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

export interface HowToStep {
  name: string;
  text: string;
}

/** HowTo node for step-based guides. */
export function howToLd(input: {
  name: string;
  description: string;
  steps: readonly HowToStep[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
