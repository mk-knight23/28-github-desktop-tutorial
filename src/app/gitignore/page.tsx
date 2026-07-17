import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { GitignoreGenerator } from "@/components/tools/gitignore-generator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: ".gitignore generator",
  description:
    "Build a .gitignore from bundled templates — Node, Next.js, Python, macOS, Windows, and more. Combine several into one deduplicated file with section headers, then copy or download. Fully offline.",
  path: "/gitignore",
});

export default function GitignorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_05 · .GITIGNORE"
        title=".gitignore generator"
        description="Pick the stacks you use. The output merges them into one file and drops duplicate patterns. Nothing is sent anywhere — templates ship with the app."
      />
      <div className="mt-8">
        <GitignoreGenerator />
      </div>
    </div>
  );
}
