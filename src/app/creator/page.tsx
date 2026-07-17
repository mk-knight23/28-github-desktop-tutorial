import type { Metadata } from "next";
import { Globe, GitFork, Mail } from "lucide-react";
import { GithubIcon } from "@/components/shell/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, personLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { CREATOR } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Creator",
  description:
    "MK GitFlow is built and maintained by Kazi Musharraf — AI Engineer, Full-Stack Developer, and Open-Source Builder.",
  path: "/creator",
});

const LINKS = [
  { href: CREATOR.github, label: "GitHub", handle: "@mk-knight23", icon: GithubIcon },
  { href: CREATOR.portfolio, label: "Portfolio", handle: "mkazi.live", icon: Globe },
  { href: CREATOR.repo, label: "This project's source", handle: "44-tool-github-desktop-guide", icon: GitFork },
  { href: `mailto:${CREATOR.email}`, label: "Email", handle: CREATOR.email, icon: Mail },
];

export default function CreatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[personLd(), breadcrumbLd([{ name: "Creator", path: "/creator" }])]}
      />
      <Breadcrumb items={[{ name: "Creator" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="CREATOR · KAZI MUSHARRAF"
        title="Kazi Musharraf"
        description={CREATOR.tagline}
      />

      <article className="prose-doc mt-10">
        <p>
          I build AI-native web products end to end — from the model wiring and the API layer to
          the interface people actually use. MK GitFlow is one of those products: a tool I wanted
          to exist for the many developers who can run Git but never got a clear picture of what
          it&rsquo;s doing underneath.
        </p>
        <p>
          I care about work that&rsquo;s honest about what it does. That shows up here in specific
          ways: the simulator genuinely never touches a real repository, the AI features degrade
          gracefully and say so when a key is missing instead of faking output, and nothing about
          you is collected unless you opt in. If a feature isn&rsquo;t real yet, the interface says so
          rather than pretending.
        </p>
        <p>
          The whole project is open source under the MIT license. If it&rsquo;s useful to you, that&rsquo;s
          the point. If you find a bug or want to contribute, the links below are the fastest way
          to reach me.
        </p>
      </article>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const external = link.href.startsWith("http");
          return (
            <a
              key={link.label}
              href={link.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer me" } : {})}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-terminal text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">{link.label}</span>
                <span className="block truncate text-sm text-fg-secondary">{link.handle}</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
