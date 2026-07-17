import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ReferenceBrowser } from "@/components/reference/reference-browser";
import { REFERENCE } from "@/lib/data/reference";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Command reference",
  description:
    "A risk-graded Git command reference. Every command is labeled safe, caution, or destructive, with syntax, examples, undo guidance, and safer alternatives. Filter by risk and search by name.",
  path: "/reference",
});

export default function ReferencePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_03 · REFERENCE"
        title="Risk-graded command reference"
        description="Every command carries a risk level shown as color, icon, and text. Destructive commands come with a consequence, a safer alternative, and undo guidance."
      />
      <div className="mt-8">
        <ReferenceBrowser commands={REFERENCE} />
      </div>
    </div>
  );
}
