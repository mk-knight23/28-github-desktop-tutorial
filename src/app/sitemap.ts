import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { GUIDES } from "@/content/guides";
import { USE_CASES } from "@/content/use-cases";
import { REFERENCE } from "@/lib/data/reference";
import { UNDO_SCENARIOS } from "@/lib/data/undo-scenarios";
import { QUIZZES } from "@/lib/data/quizzes";
import { TUTORIALS } from "@/lib/data/tutorials";

/**
 * XML sitemap (STANDARDS §5). Enumerates every indexable route from the same
 * data the pages render from, so the sitemap can never drift out of sync.
 */

const LAST_MODIFIED = new Date("2026-07-17");

type Entry = MetadataRoute.Sitemap[number];

function url(path: string, priority: number, changeFrequency: Entry["changeFrequency"]): Entry {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: Entry[] = [
    url("/", 1, "weekly"),
    url("/tool", 0.9, "monthly"),
    url("/assistant", 0.8, "monthly"),
    url("/tutorials", 0.8, "monthly"),
    url("/reference", 0.8, "monthly"),
    url("/quiz", 0.7, "monthly"),
    url("/gitignore", 0.7, "monthly"),
    url("/commits", 0.7, "monthly"),
    url("/undo", 0.7, "monthly"),
    url("/analyzer", 0.7, "monthly"),
    url("/guides", 0.8, "weekly"),
    url("/use-cases", 0.8, "weekly"),
    url("/docs", 0.7, "monthly"),
    url("/faq", 0.7, "monthly"),
    url("/changelog", 0.5, "weekly"),
    url("/about", 0.5, "yearly"),
    url("/creator", 0.5, "yearly"),
    url("/open-source", 0.5, "yearly"),
    url("/dashboard", 0.3, "monthly"),
    url("/history", 0.3, "monthly"),
    url("/settings", 0.3, "yearly"),
    url("/privacy", 0.3, "yearly"),
    url("/terms", 0.3, "yearly"),
    url("/cookies", 0.3, "yearly"),
    url("/contact", 0.4, "yearly"),
  ];

  const guidePages = GUIDES.map((g) => url(`/guides/${g.slug}`, 0.7, "monthly"));
  const useCasePages = USE_CASES.map((u) => url(`/use-cases/${u.slug}`, 0.6, "monthly"));
  const referencePages = REFERENCE.map((c) => url(`/reference/${c.slug}`, 0.6, "monthly"));
  const undoPages = UNDO_SCENARIOS.map((s) => url(`/undo/${s.slug}`, 0.5, "monthly"));
  const quizPages = QUIZZES.map((q) => url(`/quiz/${q.id}`, 0.5, "monthly"));
  const tutorialPages = TUTORIALS.map((t) => url(`/tutorials/${t.path}/${t.level}`, 0.6, "monthly"));

  return [
    ...staticPages,
    ...guidePages,
    ...useCasePages,
    ...referencePages,
    ...undoPages,
    ...quizPages,
    ...tutorialPages,
  ];
}
