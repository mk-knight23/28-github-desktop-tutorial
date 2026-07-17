/**
 * Risk badge (DESIGN_SYSTEM.md §1.3 / §7). Risk is ALWAYS color + icon + text —
 * never color alone. Icons: safe → shield-check, caution → triangle-alert,
 * destructive → octagon-alert.
 */

import { ShieldCheck, TriangleAlert, OctagonAlert } from "lucide-react";
import type { RiskLevel } from "@/lib/git-engine";

const RISK_META: Record<
  RiskLevel,
  { label: string; Icon: typeof ShieldCheck; className: string }
> = {
  safe: {
    label: "Safe",
    Icon: ShieldCheck,
    className: "border-risk-safe-border bg-risk-safe-bg text-risk-safe",
  },
  caution: {
    label: "Caution",
    Icon: TriangleAlert,
    className: "border-risk-caution-border bg-risk-caution-bg text-risk-caution",
  },
  destructive: {
    label: "Destructive",
    Icon: OctagonAlert,
    className: "border-risk-danger-border bg-risk-danger-bg text-risk-danger",
  },
};

export function riskLabel(risk: RiskLevel): string {
  return RISK_META[risk].label;
}

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: number;
}

export function RiskBadge({ risk, size = 14 }: RiskBadgeProps) {
  const { label, Icon, className } = RISK_META[risk];
  return (
    <span
      className={`schematic-label inline-flex items-center gap-1.5 rounded-xs border px-2 py-1 ${className}`}
    >
      <Icon size={size} aria-hidden="true" />
      {label}
    </span>
  );
}
