import type { Metadata } from "next";
import Link from "next/link";
import { Scale, GitPullRequest, Bug } from "lucide-react";
import { GithubIcon } from "@/components/shell/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { CREATOR, REPO_ISSUES, REPO_SECURITY } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Open source",
  description:
    "MK GitFlow is open source under the MIT license. Read the code, report a bug, or contribute — here's how the project is built and how to get involved.",
  path: "/open-source",
});

const WAYS = [
  {
    icon: Bug,
    title: "Report a bug",
    body: "Found something broken or wrong? Open an issue with steps to reproduce. Bug reports are genuinely useful — they're how the rough edges get found.",
    href: REPO_ISSUES,
    cta: "Open an issue",
  },
  {
    icon: GitPullRequest,
    title: "Contribute",
    body: "Fixes, new guides, reference entries, and accessibility improvements are all welcome. Fork the repo, make your change on a branch, and open a pull request.",
    href: CREATOR.repo,
    cta: "View the repository",
  },
  {
    icon: Scale,
    title: "Use it in your own work",
    body: "The MIT license lets you use, modify, and redistribute the code, including commercially, as long as you keep the copyright notice. No permission needed.",
    href: `${CREATOR.repo}/blob/main/LICENSE`,
    cta: "Read the license",
  },
];

export default function OpenSourcePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Open source", path: "/open-source" }])} />
      <Breadcrumb items={[{ name: "Open source" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="OPEN_SOURCE · MIT"
        title="Open source"
        description="The whole project is public and MIT-licensed. Read it, fork it, or help make it better."
      />

      <article className="prose-doc mt-10">
        <h2>How it&rsquo;s built</h2>
        <p>
          MK GitFlow is a Next.js App Router application written in TypeScript, styled with
          Tailwind, and tested with Vitest. It&rsquo;s local-first: there&rsquo;s no server database, and all
          your data stays in your browser. The Git engine behind the simulator is a plain,
          dependency-free TypeScript module with its own test suite — it&rsquo;s the most-tested part of
          the codebase, because everything else depends on it being correct.
        </p>
        <p>
          There&rsquo;s no build-time magic you can&rsquo;t inspect. The command reference, tutorials,
          quizzes, and guides are all data and content in the repository, so a pull request that
          fixes a typo or adds a command is straightforward to make and review.
        </p>

        <h2>The license</h2>
        <p>
          Released under the MIT license, copyright Kazi Musharraf. In plain terms: you can do
          almost anything with it, including using it commercially, as long as you include the
          original copyright and license notice. It comes with no warranty.
        </p>

        <h2>Ways to get involved</h2>
      </article>

      <div className="mt-6 space-y-3">
        {WAYS.map((way) => {
          const Icon = way.icon;
          return (
            <div
              key={way.title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-terminal text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-medium text-fg">{way.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{way.body}</p>
                </div>
              </div>
              <a
                href={way.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-sm border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors duration-(--motion-fast) hover:bg-surface-raised sm:self-center"
              >
                <GithubIcon size={16} />
                {way.cta}
              </a>
            </div>
          );
        })}
      </div>

      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        Security issue? Please report it privately through a{" "}
        <a
          href={REPO_SECURITY}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2"
        >
          GitHub security advisory
        </a>{" "}
        rather than opening a public issue. See also the{" "}
        <Link href="/contact" className="text-accent underline underline-offset-2">
          contact page
        </Link>
        .
      </p>
    </div>
  );
}
