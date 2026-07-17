import type { Metadata } from "next";
import { Plus, RefreshCw, Wrench, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { CHANGELOG, type ChangeKind } from "@/content/changelog";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Changelog",
  description:
    "What actually shipped in MK GitFlow, newest first. An honest record of the rebuild — no invented version history.",
  path: "/changelog",
});

const KIND_META: Record<
  ChangeKind,
  { icon: typeof Plus; label: string; className: string }
> = {
  added: { icon: Plus, label: "Added", className: "text-risk-safe" },
  changed: { icon: RefreshCw, label: "Changed", className: "text-lane-2" },
  fixed: { icon: Wrench, label: "Fixed", className: "text-risk-caution" },
  security: { icon: ShieldCheck, label: "Security", className: "text-accent" },
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Changelog", path: "/changelog" }])} />
      <Breadcrumb items={[{ name: "Changelog" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="RELEASE_LOG · CHANGELOG"
        title="Changelog"
        description="An honest record of what shipped. This is a rebuild, so the history starts here rather than pretending at a long past."
      />

      <div className="mt-10 space-y-10">
        {CHANGELOG.map((release) => (
          <section key={release.version}>
            <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
              <h2 className="font-mono text-2xl font-bold text-fg">v{release.version}</h2>
              <time className="text-sm text-fg-muted" dateTime={release.date}>
                {new Date(release.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <p className="mt-3 text-fg-secondary">{release.summary}</p>
            <ul className="mt-5 space-y-3">
              {release.changes.map((change, index) => {
                const meta = KIND_META[change.kind];
                const Icon = meta.icon;
                return (
                  <li key={index} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex shrink-0 items-center gap-1.5 ${meta.className}`}
                      title={meta.label}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span className="schematic-label sr-only sm:not-sr-only">{meta.label}</span>
                    </span>
                    <span className="text-sm leading-relaxed text-fg-secondary">{change.text}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
