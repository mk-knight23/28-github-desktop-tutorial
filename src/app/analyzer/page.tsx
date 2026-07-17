import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyzerWorkspace } from "@/components/analyzer/analyzer-workspace";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Public repo analyzer",
  description:
    "Score any public GitHub repository's documentation health against a deterministic rubric and get an actionable checklist — README quality, license, contributing guide, code of conduct, templates, workflows, and releases. Read-only, no token needed.",
  path: "/analyzer",
});

export default function AnalyzerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_08 · REPO ANALYZER"
        title="Docs health score"
        description="Point it at a public repo. It reads GitHub's public API, scores documentation completeness, and tells you exactly what to add next."
      />
      <div className="mt-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-surface-raised" />}>
          <AnalyzerWorkspace />
        </Suspense>
      </div>
    </div>
  );
}
