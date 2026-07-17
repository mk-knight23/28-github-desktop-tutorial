import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ_FLAT, FAQ_GROUPS } from "@/content/faq";
import { breadcrumbLd, faqPageLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description:
    "Answers about MK GitFlow: whether it runs real commands, where your data lives, how the AI fallbacks work, the docs-health score, and why the name isn't the GitFlow branching model.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          faqPageLd(FAQ_FLAT),
          breadcrumbLd([{ name: "FAQ", path: "/faq" }]),
        ]}
      />
      <Breadcrumb items={[{ name: "FAQ" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="COMMON_QUESTIONS · FAQ"
        title="Frequently asked questions"
        description="Straight answers about how the site works, what it does with your data, and what it can and can't do."
      />

      <div className="mt-10 space-y-10">
        {FAQ_GROUPS.map((group) => (
          <section key={group.heading}>
            <h2 className="schematic-label text-fg-muted">{group.heading}</h2>
            <dl className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border">
              {group.entries.map((entry) => (
                <details key={entry.question} className="group bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-medium text-fg transition-colors duration-(--motion-fast) hover:bg-surface-raised [&::-webkit-details-marker]:hidden">
                    <dt>{entry.question}</dt>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-accent transition-transform duration-(--motion-fast) group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <dd className="px-5 pb-4 text-sm leading-relaxed text-fg-secondary">
                    {entry.answer}
                  </dd>
                </details>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-10 max-w-prose text-sm text-fg-secondary">
        Still stuck? The <Link href="/docs" className="text-accent underline underline-offset-2">docs</Link>{" "}
        go deeper, and you can{" "}
        <Link href="/contact" className="text-accent underline underline-offset-2">get in touch</Link>{" "}
        or open an issue on GitHub.
      </p>
    </div>
  );
}
