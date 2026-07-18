import type { Metadata } from "next";
import Link from "next/link";
import {
  GitBranch,
  GitCommitHorizontal,
  Terminal,
  ShieldCheck,
  ListChecks,
  FileCode2,
  History,
  Gauge,
  CircleHelp,
  ArrowRight,
} from "lucide-react";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { webApplicationLd } from "@/lib/jsonld";
import { SimulatorWorkspace } from "@/components/simulator/simulator-workspace";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

interface FeatureCard {
  href: string;
  icon: typeof GitBranch;
  eyebrow: string;
  title: string;
  body: string;
}

const FEATURES: FeatureCard[] = [
  {
    href: "/tool",
    icon: GitBranch,
    eyebrow: "NODE_01",
    title: "Branch simulator",
    body: "Run commit, branch, merge, rebase and reset on a visual graph. Undo any step.",
  },
  {
    href: "/tutorials",
    icon: ListChecks,
    eyebrow: "NODE_02",
    title: "Guided tutorials",
    body: "GitHub Desktop and command-line paths across three levels, with checkpoints.",
  },
  {
    href: "/reference",
    icon: ShieldCheck,
    eyebrow: "NODE_03",
    title: "Risk-graded reference",
    body: "Every command labeled safe, caution, or destructive — with undo guidance.",
  },
  {
    href: "/quiz",
    icon: CircleHelp,
    eyebrow: "NODE_04",
    title: "Quizzes",
    body: "Check your understanding of branching, merging vs rebasing, and undoing.",
  },
  {
    href: "/gitignore",
    icon: FileCode2,
    eyebrow: "NODE_05",
    title: ".gitignore generator",
    body: "Combine bundled templates into one deduplicated file. Fully offline.",
  },
  {
    href: "/commits",
    icon: GitCommitHorizontal,
    eyebrow: "NODE_06",
    title: "Commit builder",
    body: "Compose Conventional Commit messages with live validation. No AI needed.",
  },
  {
    href: "/undo",
    icon: History,
    eyebrow: "NODE_07",
    title: "Undo helper",
    body: "Pick your mistake, get a recovery recipe with copy-ready, risk-graded commands.",
  },
  {
    href: "/analyzer",
    icon: Gauge,
    eyebrow: "NODE_08",
    title: "Repo analyzer",
    body: "Score any public GitHub repo's docs health against an actionable checklist.",
  },
];

const IS: string[] = [
  "A visual, in-memory Git simulator — nothing runs on a real repository",
  "A learning platform with tutorials, quizzes, and a risk-graded reference",
  "Local-first: progress and results stay in your browser, no account needed",
  "Open source (MIT) and free to use",
];

const IS_NOT: string[] = [
  "Not a GitHub client — it never pushes, pulls, or writes to your repos",
  "Not a password or token vault — it asks for no credentials",
  "Not the GitFlow branching model — the name is brand; we teach mechanics",
  "Not a shell — it displays and simulates commands, it does not execute them",
];

export default function Home() {
  return (
    <div>
      <JsonLd data={webApplicationLd()} />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-16 sm:px-6 lg:pt-20 text-center flex flex-col items-center">
        <p className="schematic-label text-accent font-bold text-xs tracking-wider">
          MK GITFLOW · GIT, MADE VISIBLE
        </p>
        <h1 className="display-heading mt-4 text-fg text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-tight">
          Mastering the distributed pipeline
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-fg-secondary">
          Learn Git by watching what every command does to the commit graph — before you
          run it for real. Simulate branches, merges, rebases and resets in our 100% offline workbench.
        </p>
      </section>

      {/* Embedded interactive Simulator */}
      <div id="workbench" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SimulatorWorkspace />
      </div>

      {/* Feature grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 className="display-heading text-2xl text-fg sm:text-3xl text-center mb-2">The toolkit</h2>
        <p className="text-center text-fg-secondary mb-10 max-w-md mx-auto">
          Explore all helper nodes designed to build confidence with version control.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors duration-(--motion-base) hover:bg-surface-raised"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-terminal text-accent">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="schematic-label text-fg-muted">{f.eyebrow}</span>
                <span className="text-lg font-bold text-fg">{f.title}</span>
                <span className="text-sm leading-relaxed text-fg-secondary">{f.body}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-sm text-accent">
                  Open
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Terminal demo */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="schematic-label text-accent">RISK_CODING</p>
            <h2 className="display-heading mt-3 text-2xl text-fg sm:text-3xl">
              Commands come with a risk level
            </h2>
            <p className="mt-4 max-w-prose text-fg-secondary">
              Safe, caution, or destructive — always shown as color, icon, and text, never
              color alone. Destructive commands carry a consequence line, a safer alternative,
              and a two-step copy gate.
            </p>
            <Link
              href="/reference"
              className="mt-6 inline-flex items-center gap-1.5 text-accent underline underline-offset-2"
            >
              See the full reference <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <TerminalPanel title="bash — read-only">
            <div className="space-y-1">
              <CommandLine command="git status" risk="safe" feature="landing-demo" />
              <CommandLine command="git checkout -b feature/login" risk="safe" feature="landing-demo" />
              <CommandLine command="git rebase main" risk="caution" feature="landing-demo" />
              <CommandLine
                command="git reset --hard HEAD~1"
                risk="destructive"
                consequence="Permanently discards commits and uncommitted changes after HEAD~1."
                saferAlternative="git revert HEAD"
                feature="landing-demo"
              />
            </div>
          </TerminalPanel>
        </div>
      </section>

      {/* What this is / isn't */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-risk-safe-border bg-risk-safe-bg/40 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
              <ShieldCheck size={20} className="text-risk-safe" aria-hidden="true" />
              What this is
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-fg-secondary">
              {IS.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden="true" className="text-risk-safe">+</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
              <Terminal size={20} className="text-fg-muted" aria-hidden="true" />
              What it isn&apos;t
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-fg-secondary">
              {IS_NOT.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden="true" className="text-fg-muted">−</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
