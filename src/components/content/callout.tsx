import type { ReactNode } from "react";
import { Info, Lightbulb, TriangleAlert, OctagonAlert } from "lucide-react";

type CalloutTone = "note" | "tip" | "caution" | "danger";

const TONE: Record<
  CalloutTone,
  { icon: typeof Info; label: string; className: string; iconClass: string }
> = {
  note: {
    icon: Info,
    label: "Note",
    className: "border-border bg-surface",
    iconClass: "text-accent",
  },
  tip: {
    icon: Lightbulb,
    label: "Tip",
    className: "border-risk-safe-border bg-risk-safe-bg",
    iconClass: "text-risk-safe",
  },
  caution: {
    icon: TriangleAlert,
    label: "Caution",
    className: "border-risk-caution-border bg-risk-caution-bg",
    iconClass: "text-risk-caution",
  },
  danger: {
    icon: OctagonAlert,
    label: "Destructive",
    className: "border-risk-danger-border bg-risk-danger-bg",
    iconClass: "text-risk-danger",
  },
};

/** Inline callout box for guides/docs. Tone drives icon + color + label. */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, label, className, iconClass } = TONE[tone];
  return (
    <div className={`my-6 rounded-lg border p-4 ${className}`} role="note">
      <p className="flex items-center gap-2">
        <Icon size={16} aria-hidden="true" className={iconClass} />
        <span className="schematic-label text-fg">{title ?? label}</span>
      </p>
      <div className="mt-2 text-sm leading-relaxed text-fg-secondary [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-xs [&_code]:bg-surface-raised [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-fg">
        {children}
      </div>
    </div>
  );
}
