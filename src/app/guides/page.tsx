import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { GUIDES } from "@/content/guides";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Guides",
  description:
    "Original, in-depth Git guides written in plain language: reading the commit graph, rebase vs merge, branching strategies, undoing mistakes, Conventional Commits, .gitignore, GitHub Desktop, and CI triage.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="FIELD_NOTES · GUIDES"
        title="Guides"
        description="Long-form, original write-ups on the parts of Git people actually get stuck on. Each one is concrete, states its limits, and links back to the tools that make it click."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors duration-(--motion-base) hover:bg-surface-raised"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-terminal text-accent">
                <BookOpen size={18} aria-hidden="true" />
              </span>
              <span className="schematic-label text-fg-muted">{guide.category}</span>
            </div>
            <h2 className="text-lg font-bold leading-snug text-fg">{guide.title}</h2>
            <p className="text-sm leading-relaxed text-fg-secondary">{guide.description}</p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                <Clock size={13} aria-hidden="true" />
                {guide.readingMinutes} min read
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-accent">
                Read
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        Looking for something task-shaped instead? The{" "}
        <Link href="/use-cases" className="text-accent underline underline-offset-2">
          use cases
        </Link>{" "}
        show how the whole toolkit fits together for a specific job, and the{" "}
        <Link href="/reference" className="text-accent underline underline-offset-2">
          command reference
        </Link>{" "}
        covers individual commands.
      </p>
    </div>
  );
}
