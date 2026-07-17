import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard",
  description:
    "Your local MK GitFlow progress: tutorial completion, best quiz scores, saved simulator sessions, and cached repo analyses. Real data only, stored in your browser.",
  path: "/dashboard",
});

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="LOCAL · DASHBOARD"
        title="Your progress"
        description="Everything here is computed from data in this browser. Nothing is uploaded, and there are no made-up averages."
      />
      <div className="mt-8">
        <DashboardView />
      </div>
    </div>
  );
}
