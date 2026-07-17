/** Honest empty state (DESIGN_SYSTEM.md §10): icon + one sentence + action. */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-fg-muted">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="text-lg font-bold text-fg">{title}</h3>
      <p className="max-w-md text-sm text-fg-secondary">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
