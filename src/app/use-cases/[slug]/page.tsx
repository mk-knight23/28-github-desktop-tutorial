import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { USE_CASES, getUseCase } from "@/content/use-cases";
import { articleLd, breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return USE_CASES.map((useCase) => ({ slug: useCase.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) {
    return buildMetadata({
      title: "Use case not found",
      description: "This use case does not exist.",
      path: `/use-cases/${slug}`,
    });
  }
  return buildMetadata({
    title: useCase.title,
    description: useCase.description,
    path: `/use-cases/${useCase.slug}`,
  });
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) notFound();

  const Body = useCase.Body;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          articleLd({
            title: useCase.title,
            description: useCase.description,
            path: `/use-cases/${useCase.slug}`,
            datePublished: useCase.datePublished,
          }),
          breadcrumbLd([
            { name: "Use cases", path: "/use-cases" },
            { name: useCase.title, path: `/use-cases/${useCase.slug}` },
          ]),
        ]}
      />

      <Breadcrumb
        items={[
          { name: "Use cases", href: "/use-cases" },
          { name: useCase.title },
        ]}
      />

      <header className="mt-5">
        <p className="schematic-label text-accent">{useCase.audience}</p>
        <h1 className="display-heading mt-3 text-3xl text-fg sm:text-4xl">{useCase.title}</h1>
        <p className="mt-4 text-lg text-fg-secondary">{useCase.description}</p>
      </header>

      <hr className="my-8 border-border" />

      <article className="prose-doc">
        <Body />
      </article>

      <section className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h2 className="schematic-label text-fg-muted">TOOLS USED HERE</h2>
        <ul className="mt-4 space-y-2">
          {useCase.tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="inline-flex items-center gap-1.5 text-accent underline underline-offset-2"
              >
                {tool.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-fg-secondary">
        <Link href="/use-cases" className="text-accent underline underline-offset-2">
          ← All use cases
        </Link>
      </p>
    </div>
  );
}
