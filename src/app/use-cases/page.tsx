import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { USE_CASES } from "@/content/use-cases";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Use cases",
  description:
    "How MK GitFlow fits real jobs: onboarding junior developers, teaching Git in a bootcamp, keeping pull requests clean, recovering from mistakes, and auditing repo health.",
  path: "/use-cases",
});

export default function UseCasesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="IN_PRACTICE · USE CASES"
        title="Use cases"
        description="The toolkit isn't a pile of separate features — it's meant to fit specific jobs. Here's how the pieces come together for the work people actually do."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {USE_CASES.map((useCase) => (
          <Link
            key={useCase.slug}
            href={`/use-cases/${useCase.slug}`}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors duration-(--motion-base) hover:bg-surface-raised"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-terminal text-accent">
                <Users size={18} aria-hidden="true" />
              </span>
              <span className="schematic-label text-fg-muted">{useCase.audience}</span>
            </div>
            <h2 className="text-lg font-bold leading-snug text-fg">{useCase.title}</h2>
            <p className="text-sm leading-relaxed text-fg-secondary">{useCase.summary}</p>
            <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-accent">
              Read
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        Want the underlying concepts instead? The{" "}
        <Link href="/guides" className="text-accent underline underline-offset-2">
          guides
        </Link>{" "}
        go deep on individual topics.
      </p>
    </div>
  );
}
