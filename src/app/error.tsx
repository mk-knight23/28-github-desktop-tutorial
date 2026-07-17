"use client";

import Link from "next/link";
import { OctagonAlert, RotateCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <p className="schematic-label flex items-center gap-2 rounded-xs border border-risk-danger-border bg-risk-danger-bg px-3 py-2 text-risk-danger">
        <OctagonAlert size={16} aria-hidden="true" />
        Runtime error
      </p>
      <h1 className="display-heading text-4xl text-fg">
        Something broke on our side
      </h1>
      <p className="text-fg-secondary">
        The page hit an unexpected error. Your local data is untouched — think
        of this as a failed command, not a lost repository. Try again, or head
        back to the simulator.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-fg-muted">
          Error digest: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm bg-accent px-5 font-medium text-accent-contrast transition-colors duration-(--motion-fast) hover:bg-accent-hover active:bg-accent-active"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-sm border border-border-strong px-5 font-medium text-fg transition-colors duration-(--motion-fast) hover:bg-surface-raised"
        >
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
