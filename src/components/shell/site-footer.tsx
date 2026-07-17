import Link from "next/link";
import { Globe, GitFork } from "lucide-react";
import { GithubIcon } from "@/components/shell/icons";
import { BranchLogo } from "@/components/shell/logo";
import { CREATOR, FOOTER_SENTENCE, SITE_NAME } from "@/lib/site";

const LEARN_LINKS = [
  { href: "/tutorials", label: "Tutorials" },
  { href: "/guides", label: "Guides" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/reference", label: "Command reference" },
  { href: "/quiz", label: "Quizzes" },
];

const TOOL_LINKS = [
  { href: "/tool", label: "Branch simulator" },
  { href: "/gitignore", label: ".gitignore generator" },
  { href: "/commits", label: "Commit builder" },
  { href: "/undo", label: "Undo helper" },
  { href: "/analyzer", label: "Repo analyzer" },
];

const PROJECT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
  { href: "/changelog", label: "Changelog" },
  { href: "/creator", label: "Creator" },
  { href: "/open-source", label: "Open source" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <BranchLogo size={24} />
            <span className="schematic-label text-fg">{SITE_NAME}</span>
          </div>
          <p className="text-sm leading-relaxed text-fg-secondary">
            Learn Git by seeing it. Simulated commands, visual branch graphs,
            and risk-graded references. This site never executes shell
            commands.
          </p>
        </div>

        <nav aria-label="Learn">
          <h2 className="schematic-label mb-4 text-fg-muted">Learn</h2>
          <ul className="space-y-2">
            {LEARN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Tools">
          <h2 className="schematic-label mb-4 text-fg-muted">Tools</h2>
          <ul className="space-y-2">
            {TOOL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Project">
          <h2 className="schematic-label mb-4 text-fg-muted">Project</h2>
          <ul className="space-y-2">
            {PROJECT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <nav
          aria-label="Legal"
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 pt-6 sm:px-6"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-fg-muted transition-colors duration-(--motion-fast) hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-fg-secondary">{FOOTER_SENTENCE}</p>
          <ul className="flex items-center gap-4">
            <li>
              <a
                href={CREATOR.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-1.5 text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-fg"
              >
                <GithubIcon size={16} />
                GitHub
              </a>
            </li>
            <li>
              <a
                href={CREATOR.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-1.5 text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-fg"
              >
                <Globe size={16} aria-hidden="true" />
                Portfolio
              </a>
            </li>
            <li>
              <a
                href={CREATOR.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-1.5 text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-fg"
              >
                <GitFork size={16} aria-hidden="true" />
                Source
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
