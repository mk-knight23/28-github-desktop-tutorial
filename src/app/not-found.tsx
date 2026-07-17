import Link from "next/link";
import type { Metadata } from "next";
import { GitBranch, Home, SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This route does not exist. HEAD is detached — jump back to a known ref.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <p className="schematic-label flex items-center gap-2 rounded-xs border border-risk-caution-border bg-risk-caution-bg px-3 py-2 text-risk-caution">
        <SearchX size={16} aria-hidden="true" />
        404 — Ref not found
      </p>
      <h1 className="display-heading text-4xl text-fg">
        Detached HEAD state
      </h1>
      <div className="w-full rounded-md bg-terminal p-4 font-mono text-sm">
        <p className="text-term-prompt">
          $ git checkout <span className="text-term-text">this-page</span>
        </p>
        <p className="mt-1 text-term-err">
          error: pathspec &apos;this-page&apos; did not match any page known to
          this site
        </p>
      </div>
      <p className="text-fg-secondary">
        The page you asked for doesn&apos;t exist here. Check the URL, or jump
        back to a ref that does.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-sm bg-accent px-5 font-medium text-accent-contrast transition-colors duration-(--motion-fast) hover:bg-accent-hover active:bg-accent-active"
        >
          <Home size={16} aria-hidden="true" />
          Homepage
        </Link>
        <Link
          href="/tool"
          className="flex min-h-11 items-center gap-2 rounded-sm border border-border-strong px-5 font-medium text-fg transition-colors duration-(--motion-fast) hover:bg-surface-raised"
        >
          <GitBranch size={16} aria-hidden="true" />
          Open the simulator
        </Link>
      </div>
    </div>
  );
}
