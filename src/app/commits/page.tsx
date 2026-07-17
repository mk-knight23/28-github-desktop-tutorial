import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CommitBuilder } from "@/components/tools/commit-builder";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Conventional Commit builder",
  description:
    "Compose a Conventional Commit message with a guided form: type, scope, description, body, and breaking-change footer. Live preview and validation. No AI required.",
  path: "/commits",
});

export default function CommitsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_06 · COMMIT BUILDER"
        title="Conventional Commit builder"
        description="Fill in the parts, get a valid Conventional Commit message. It checks header length and imperative mood as you type."
      />
      <div className="mt-8">
        <CommitBuilder />
      </div>
      <p className="mt-8 max-w-prose text-sm text-fg-secondary">
        Look up{" "}
        <Link href="/reference/git-commit" className="text-accent underline underline-offset-2">
          git commit
        </Link>{" "}
        in the reference, or practice committing in the{" "}
        <Link href="/tool" className="text-accent underline underline-offset-2">
          simulator
        </Link>
        .
      </p>
    </div>
  );
}
