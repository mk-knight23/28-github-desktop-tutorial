import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  description:
    "Theme, reduced-motion, analytics consent, and history logging. Export, import, or clear all of your local MK GitFlow data. Everything stays in your browser.",
  path: "/settings",
});

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="LOCAL · SETTINGS"
        title="Settings"
        description="Preferences and data controls. MK GitFlow is local-first — nothing here leaves your browser."
      />
      <div className="mt-8">
        <SettingsPanel />
      </div>
    </div>
  );
}
