import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { AdSlot } from "@/components/content/ad-slot";
import { GuideTracker } from "@/components/content/guide-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { GUIDES, getGuide, getGuideNeighbors } from "@/content/guides";
import { articleLd, breadcrumbLd, howToLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) {
    return buildMetadata({
      title: "Guide not found",
      description: "This guide does not exist.",
      path: `/guides/${slug}`,
    });
  }
  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const { prev, next } = getGuideNeighbors(slug);
  const Body = guide.Body;

  const structuredData: Record<string, unknown>[] = [
    articleLd({
      title: guide.title,
      description: guide.description,
      path: `/guides/${guide.slug}`,
      datePublished: guide.datePublished,
      dateModified: guide.dateUpdated,
    }),
    breadcrumbLd([
      { name: "Guides", path: "/guides" },
      { name: guide.title, path: `/guides/${guide.slug}` },
    ]),
  ];
  if (guide.howTo && guide.howTo.length > 0) {
    structuredData.push(
      howToLd({ name: guide.title, description: guide.description, steps: guide.howTo }),
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={structuredData} />
      <GuideTracker slug={guide.slug} />

      <Breadcrumb
        items={[
          { name: "Guides", href: "/guides" },
          { name: guide.title },
        ]}
      />

      <header className="mt-5">
        <p className="schematic-label text-accent">{guide.category}</p>
        <h1 className="display-heading mt-3 text-3xl text-fg sm:text-4xl">{guide.title}</h1>
        <p className="mt-4 text-lg text-fg-secondary">{guide.description}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-fg-muted">
          <Clock size={13} aria-hidden="true" />
          {guide.readingMinutes} min read · Updated{" "}
          {new Date(guide.dateUpdated ?? guide.datePublished).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <hr className="my-8 border-border" />

      <article className="prose-doc">
        <Body />
      </article>

      {guide.related && guide.related.length > 0 && (
        <section className="mt-10 rounded-lg border border-border bg-surface p-6">
          <h2 className="schematic-label text-fg-muted">KEEP GOING</h2>
          <ul className="mt-4 space-y-2">
            {guide.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-accent underline underline-offset-2"
                >
                  {link.label}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdSlot className="mt-8" height={250} />

      <nav
        aria-label="More guides"
        className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={`/guides/${prev.slug}`}
            className="group flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
          >
            <span className="flex items-center gap-1 text-xs text-fg-muted">
              <ArrowLeft size={13} aria-hidden="true" /> Previous
            </span>
            <span className="text-sm font-medium text-fg">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/guides/${next.slug}`}
            className="group flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 text-right transition-colors duration-(--motion-fast) hover:bg-surface-raised"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-fg-muted">
              Next <ArrowRight size={13} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-fg">{next.title}</span>
          </Link>
        )}
      </nav>

      <p className="mt-8 text-sm text-fg-secondary">
        <Link href="/guides" className="text-accent underline underline-offset-2">
          ← All guides
        </Link>
      </p>
    </div>
  );
}
