import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Undo2 } from "lucide-react";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getCommand, getRelated, REFERENCE } from "@/lib/data/reference";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

interface PageProps {
  params: Promise<{ command: string }>;
}

export function generateStaticParams() {
  return REFERENCE.map((cmd) => ({ command: cmd.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { command } = await params;
  const cmd = getCommand(command);
  if (!cmd) return buildMetadata({ title: "Command not found", description: "Unknown command.", path: `/reference/${command}` });
  return buildMetadata({
    title: cmd.name,
    description: `${cmd.summary} Risk level: ${cmd.risk}. Syntax, examples, and undo guidance for ${cmd.name}.`,
    path: `/reference/${cmd.slug}`,
  });
}

export default async function CommandPage({ params }: PageProps) {
  const { command } = await params;
  const cmd = getCommand(command);
  if (!cmd) notFound();

  const related = getRelated(cmd);
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Reference", item: `${SITE_URL}/reference` },
      { "@type": "ListItem", position: 2, name: cmd.name, item: `${SITE_URL}/reference/${cmd.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/reference" className="hover:text-fg">
          Reference
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-fg">{cmd.name}</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-3xl font-bold text-fg">{cmd.name}</h1>
        <RiskBadge risk={cmd.risk} />
      </div>
      <p className="mt-3 max-w-prose text-lg text-fg-secondary">{cmd.summary}</p>

      <section className="mt-8">
        <h2 className="schematic-label text-fg-muted">SYNTAX</h2>
        <div className="mt-3">
          <TerminalPanel>
            <CommandLine
              command={cmd.syntax}
              risk={cmd.risk}
              consequence={cmd.consequence}
              saferAlternative={cmd.saferAlternative}
              feature={`reference:${cmd.slug}`}
            />
          </TerminalPanel>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="schematic-label text-fg-muted">WHAT IT DOES</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-fg">{cmd.explanation}</p>
      </section>

      {cmd.examples.length > 0 && (
        <section className="mt-8">
          <h2 className="schematic-label text-fg-muted">EXAMPLES</h2>
          <div className="mt-3 space-y-4">
            {cmd.examples.map((ex, i) => (
              <div key={i}>
                <p className="mb-2 text-sm text-fg-secondary">{ex.note}</p>
                <TerminalPanel>
                  <CommandLine command={ex.command} risk={cmd.risk} feature={`reference:${cmd.slug}:ex`} />
                </TerminalPanel>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-2 schematic-label text-fg-muted">
          <Undo2 size={14} aria-hidden="true" /> IF YOU NEED TO UNDO
        </h2>
        <p className="mt-3 max-w-prose leading-relaxed text-fg">{cmd.undo}</p>
      </section>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="schematic-label text-fg-muted">RELATED COMMANDS</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/reference/${r.slug}`}
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-sm transition-colors duration-(--motion-fast) hover:bg-surface-raised"
              >
                <code className="font-mono text-fg">{r.name}</code>
                <RiskBadge risk={r.risk} size={11} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-sm text-fg-secondary">
        Want to see it on a graph?{" "}
        <Link href="/tool" className="text-accent underline underline-offset-2">
          Try it in the simulator
        </Link>
        .
      </p>
    </div>
  );
}
