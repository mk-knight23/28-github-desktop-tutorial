import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { UNDO_SCENARIOS } from "@/lib/data/undo-scenarios";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Undo & recovery helper",
  description:
    "Made a Git mistake? Pick what happened and get a step-by-step recovery recipe with copy-ready, risk-graded commands. Covers wrong-branch commits, bad resets, deleted branches, committed secrets, and more.",
  path: "/undo",
});

export default function UndoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_07 · UNDO HELPER"
        title="What went wrong?"
        description="Pick the situation that matches. Each recipe gives you the exact commands, in order, with a risk level and a safer alternative where one exists."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {UNDO_SCENARIOS.map((scenario) => (
          <Link
            key={scenario.slug}
            href={`/undo/${scenario.slug}`}
            className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-5 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
          >
            <span className="mt-0.5 shrink-0 text-accent">
              <LifeBuoy size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-fg">{scenario.title}</span>
              <span className="mt-1 block text-sm text-fg-secondary">{scenario.symptom}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-sm text-accent">
                See the fix
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        None of these match? The safest first step is almost always to stop and make a backup
        branch: <code className="rounded-xs bg-surface px-1.5 py-0.5 font-mono text-fg">git branch backup-before-fix</code>. Then look up the
        specific command in the{" "}
        <Link href="/reference" className="text-accent underline underline-offset-2">
          reference
        </Link>
        .
      </p>
    </div>
  );
}
