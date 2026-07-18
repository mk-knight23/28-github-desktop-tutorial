import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SimulatorWorkspace } from "@/components/simulator/simulator-workspace";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Branch simulator",
  description:
    "Simulate git commit, branch, checkout, merge, rebase and reset on a live visual branch graph. Step-by-step undo, time-travel, and a screen-reader command log. Nothing runs on a real repository.",
  path: "/tool",
});

export default function ToolPage() {
  return (
    <div className="mx-auto max-w-7xl overflow-x-clip px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_01 · SIMULATOR"
        title="See what every command does"
        description="Run git operations against an in-memory graph and watch the result before you touch a real repo. Undo, redo, and replay every step."
      />
      <div className="mt-8">
        <SimulatorWorkspace />
      </div>
      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        New to the graph? Start with the{" "}
        <Link href="/tutorials" className="text-accent underline underline-offset-2">
          guided tutorials
        </Link>{" "}
        or the{" "}
        <Link href="/reference" className="text-accent underline underline-offset-2">
          command reference
        </Link>
        . Every command here is display-and-simulate only — the site never executes shell
        commands.
      </p>
    </div>
  );
}
