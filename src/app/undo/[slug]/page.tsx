import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Compass } from "lucide-react";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { getScenario, UNDO_SCENARIOS } from "@/lib/data/undo-scenarios";
import { getCommand } from "@/lib/data/reference";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return UNDO_SCENARIOS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) {
    return buildMetadata({ title: "Scenario not found", description: "Unknown recovery scenario.", path: `/undo/${slug}` });
  }
  return buildMetadata({
    title: scenario.title,
    description: `${scenario.symptom} Step-by-step Git recovery with risk-graded commands.`,
    path: `/undo/${scenario.slug}`,
  });
}

export default async function UndoScenarioPage({ params }: PageProps) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: scenario.title,
    description: scenario.detail,
    step: scenario.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step.command ? `${step.text} (${step.command})` : step.text,
    })),
  };
  const related = scenario.related.map((s) => getCommand(s)).filter((c) => c !== undefined);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/undo" className="hover:text-fg">
          Undo helper
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-fg">{scenario.title}</span>
      </nav>

      <h1 className="mt-5 text-3xl font-bold text-fg">{scenario.title}</h1>
      <p className="mt-3 text-lg text-fg-secondary">{scenario.detail}</p>

      <ol className="mt-8 space-y-6">
        {scenario.steps.map((step, i) => (
          <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-sm font-bold text-accent"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="leading-relaxed text-fg">{step.text}</p>
              {step.command && (
                <div className="mt-3">
                  <TerminalPanel>
                    <CommandLine
                      command={step.command}
                      risk={step.risk ?? "safe"}
                      consequence={step.consequence}
                      saferAlternative={step.saferAlternative}
                      feature={`undo:${scenario.slug}`}
                    />
                  </TerminalPanel>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-start gap-3 rounded-lg border border-risk-caution-border bg-risk-caution-bg px-4 py-4">
        <Compass size={18} className="mt-0.5 shrink-0 text-risk-caution" aria-hidden="true" />
        <div>
          <p className="schematic-label text-risk-caution">IF THIS DOESN&apos;T MATCH</p>
          <p className="mt-1.5 text-sm text-fg">{scenario.fallback}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="schematic-label text-fg-muted">RELATED COMMANDS</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/reference/${r.slug}`}
                className="rounded-sm border border-border bg-surface px-3 py-2 font-mono text-sm text-fg transition-colors duration-(--motion-fast) hover:bg-surface-raised"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
