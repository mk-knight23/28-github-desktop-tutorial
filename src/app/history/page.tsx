import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { HistoryView } from "@/components/history/history-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "History",
  description:
    "Past quiz attempts, cached repo analyses, and saved simulator sessions — all stored locally in your browser. Clear or export anytime from Settings.",
  path: "/history",
});

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="LOCAL · HISTORY"
        title="History"
        description="A local record of what you've done here. Stored in your browser only."
      />
      <div className="mt-8">
        <HistoryView />
      </div>
    </div>
  );
}
