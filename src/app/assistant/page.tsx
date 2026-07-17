import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI assistant",
  description:
    "Optional AI helpers for Git: translate plain English to commands, explain errors and conflicts, plan a rebase, draft commits, PRs and release notes. Works with the deterministic tools when AI is unavailable.",
  path: "/assistant",
});

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_10 · AI ASSISTANT"
        title="AI assistant"
        description="Optional AI helpers layered on top of the deterministic tools. Every answer shows a risk level where a command is involved, and nothing here ever runs a command."
      />

      <div className="mt-6 max-w-prose space-y-2 text-sm text-fg-secondary">
        <p>
          These features call an AI model through a gateway. If the server has no AI configured and
          you haven&apos;t added your own key, you&apos;ll get a labeled local result where one
          exists, or an honest note where one doesn&apos;t — never an invented answer.
        </p>
        <p>
          Your input is sent to the model to answer your request and is not stored on the server. See
          the{" "}
          <Link href="/reference" className="text-accent underline underline-offset-2">
            command reference
          </Link>{" "}
          and the{" "}
          <Link href="/tool" className="text-accent underline underline-offset-2">
            simulator
          </Link>{" "}
          for the deterministic, always-available tools.
        </p>
      </div>

      <div className="mt-10">
        <AssistantWorkspace />
      </div>
    </div>
  );
}
