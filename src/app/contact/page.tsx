import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Lightbulb, Mail, ShieldAlert, Globe } from "lucide-react";
import { GithubIcon } from "@/components/shell/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { CREATOR, REPO_ISSUES, REPO_SECURITY } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch about MK GitFlow: report a bug or request a feature on GitHub, email the maintainer, or report a security issue privately.",
  path: "/contact",
});

interface Channel {
  icon: typeof Bug;
  title: string;
  body: string;
  href: string;
  cta: string;
  external: boolean;
}

const CHANNELS: Channel[] = [
  {
    icon: Bug,
    title: "Report a bug",
    body: "Something not working right? Open a GitHub issue with steps to reproduce and what you expected to happen. This is the best channel for anything broken.",
    href: `${REPO_ISSUES}/new`,
    cta: "Open an issue",
    external: true,
  },
  {
    icon: Lightbulb,
    title: "Request a feature or a guide",
    body: "Want a command in the reference, a new guide topic, or a tool that isn't here yet? Open an issue and describe the use case.",
    href: REPO_ISSUES,
    cta: "Browse or open issues",
    external: true,
  },
  {
    icon: Mail,
    title: "Email the maintainer",
    body: "For anything that isn't a public bug or feature request, email works. I read everything, though replies may take a little time.",
    href: `mailto:${CREATOR.email}?subject=MK%20GitFlow`,
    cta: CREATOR.email,
    external: false,
  },
  {
    icon: ShieldAlert,
    title: "Report a security issue",
    body: "Found a vulnerability? Please report it privately through a GitHub security advisory instead of a public issue, so it can be fixed before it's disclosed.",
    href: REPO_SECURITY,
    cta: "Open a private advisory",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Contact", path: "/contact" }])} />
      <Breadcrumb items={[{ name: "Contact" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="GET_IN_TOUCH · CONTACT"
        title="Contact"
        description="This is an open-source project, so most conversations happen on GitHub. Pick the channel that fits."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <a
              key={channel.title}
              href={channel.href}
              {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-terminal text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h2 className="font-medium text-fg">{channel.title}</h2>
              <p className="text-sm leading-relaxed text-fg-secondary">{channel.body}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm text-accent">
                {channel.external && channel.icon !== Mail && <GithubIcon size={14} />}
                {channel.cta}
              </span>
            </a>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm text-fg-secondary">
        <a
          href={CREATOR.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-fg"
        >
          <GithubIcon size={16} /> {CREATOR.github.replace("https://", "")}
        </a>
        <a
          href={CREATOR.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-fg"
        >
          <Globe size={16} aria-hidden="true" /> {CREATOR.portfolio.replace("https://", "")}
        </a>
      </div>

      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        Looking for an answer first? The{" "}
        <Link href="/faq" className="text-accent underline underline-offset-2">
          FAQ
        </Link>{" "}
        and <Link href="/docs" className="text-accent underline underline-offset-2">docs</Link>{" "}
        cover the common questions.
      </p>
    </div>
  );
}
