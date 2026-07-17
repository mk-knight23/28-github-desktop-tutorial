/**
 * Terminal panel + command line (DESIGN_SYSTEM.md §8.4 + §9).
 *
 * The canonical way commands appear anywhere on the site. Always-dark panel,
 * mono header row, `$`-prefixed command lines, a copy button per command, a risk
 * badge when applicable, and the full destructive treatment (3px danger border,
 * tint, one-line consequence, safer alternative, two-step armed copy) for
 * destructive commands.
 *
 * The site NEVER executes these commands — they are display + copy only.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { OctagonAlert } from "lucide-react";
import type { RiskLevel } from "@/lib/git-engine";
import { CopyButton } from "@/components/ui/copy-button";
import { RiskBadge } from "@/components/ui/risk-badge";

interface TerminalPanelProps {
  /** Header label, e.g. "bash — read-only". */
  title?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalPanel({
  title = "bash — read-only",
  children,
  className = "",
}: TerminalPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-border bg-terminal ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-term-err/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-term-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-term-ok/70" />
        </span>
        <span className="schematic-label text-term-comment">{title}</span>
      </div>
      <div className="p-3 font-mono text-sm text-term-text">{children}</div>
    </div>
  );
}

interface CommandLineProps {
  command: string;
  risk?: RiskLevel;
  /** One-line consequence, required for destructive commands (§9.3). */
  consequence?: string;
  /** Safer alternative shown as a copyable follow-up when one exists. */
  saferAlternative?: string;
  /** Internal link to a safer path / reference entry. */
  saferHref?: string;
  saferLabel?: string;
  feature?: string;
}

/**
 * A single `$ command` row with copy button and (optional) risk treatment.
 * Renders standalone inside a TerminalPanel or on its own with its own frame.
 */
export function CommandLine({
  command,
  risk = "safe",
  consequence,
  saferAlternative,
  saferHref,
  saferLabel,
  feature = "command",
}: CommandLineProps) {
  const isDestructive = risk === "destructive";
  return (
    <div
      className={
        isDestructive
          ? "rounded-sm border-l-[3px] border-risk-danger bg-risk-danger-bg px-3 py-2"
          : "px-0 py-1"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <code className="min-w-0 break-all">
          <span className="text-term-prompt select-none">$ </span>
          <span className="text-term-text">{command}</span>
        </code>
        <div className="flex items-center gap-2">
          {risk !== "safe" && <RiskBadge risk={risk} />}
          <CopyButton text={command} destructive={isDestructive} feature={feature} />
        </div>
      </div>
      {isDestructive && consequence && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-risk-danger">
          <OctagonAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{consequence}</span>
        </p>
      )}
      {saferAlternative && (
        <p className="mt-1.5 text-xs text-term-comment">
          Safer:{" "}
          <code className="text-term-ok">{saferAlternative}</code>
        </p>
      )}
      {saferHref && (
        <p className="mt-1.5 text-xs">
          <Link
            href={saferHref}
            className="text-term-warn underline underline-offset-2 hover:text-term-text"
          >
            {saferLabel ?? "See the safer approach"}
          </Link>
        </p>
      )}
    </div>
  );
}
