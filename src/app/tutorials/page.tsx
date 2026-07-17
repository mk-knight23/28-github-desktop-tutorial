import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MonitorSmartphone, Terminal } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  LEVEL_LABEL,
  PATH_LABEL,
  TUTORIALS,
  type TutorialPath,
} from "@/lib/data/tutorials";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Guided tutorials",
  description:
    "Step-by-step Git tutorials for both GitHub Desktop and the command line, across beginner, intermediate, and advanced levels. Mark checkpoints as you go — progress saves locally.",
  path: "/tutorials",
});

const PATH_ICON: Record<TutorialPath, typeof Terminal> = {
  desktop: MonitorSmartphone,
  cli: Terminal,
};

export default function TutorialsPage() {
  const paths: TutorialPath[] = ["desktop", "cli"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_02 · TUTORIALS"
        title="Learn Git step by step"
        description="Two paths, three levels. The GitHub Desktop path describes the real app UI; the command-line path shows every command with a copy button and risk badge."
      />

      <div className="mt-8 space-y-10">
        {paths.map((path) => {
          const Icon = PATH_ICON[path];
          const tutorials = TUTORIALS.filter((t) => t.path === path);
          return (
            <section key={path}>
              <h2 className="flex items-center gap-2 schematic-label text-accent">
                <Icon size={16} aria-hidden="true" />
                {PATH_LABEL[path]}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {tutorials.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tutorials/${t.path}/${t.level}`}
                    className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-5 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
                  >
                    <span className="schematic-label text-fg-muted">{LEVEL_LABEL[t.level]}</span>
                    <span className="font-medium text-fg">{t.title}</span>
                    <span className="text-sm text-fg-secondary">{t.summary}</span>
                    <span className="mt-auto flex items-center justify-between pt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                        <Clock size={13} aria-hidden="true" /> {t.minutes} min · {t.steps.length} steps
                      </span>
                      <ArrowRight
                        size={15}
                        aria-hidden="true"
                        className="text-accent transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
