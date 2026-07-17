/**
 * Reserved ad slot (STANDARDS §7). AdSense is PREPARED BUT DISABLED.
 *
 * `NEXT_PUBLIC_ADSENSE_ENABLED` defaults to false — while false, NO ad script
 * loads and NO network request is made. The slot still reserves fixed
 * dimensions so enabling ads later causes zero layout shift (CLS). Used ONLY in
 * long guide pages and the docs area, per the contract.
 *
 * See MONETIZATION_PLAN.md for placement policy. No `ads.txt` ships until a real
 * publisher id exists.
 */

const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

interface AdSlotProps {
  /** Reserved height in px (prevents CLS when ads turn on). */
  height?: number;
  className?: string;
}

export function AdSlot({ height = 250, className = "" }: AdSlotProps) {
  // Disabled path: reserve space only, load nothing. This is the shipped state.
  if (!ADSENSE_ENABLED) return null;

  // Enabled path is intentionally inert until a publisher id + real slot config
  // are wired in a future monetization pass. It reserves dimensions and shows a
  // labeled placeholder rather than silently pretending an ad is present.
  return (
    <aside
      aria-label="Advertisement"
      className={`flex items-center justify-center rounded-md border border-dashed border-border bg-surface text-xs text-fg-muted ${className}`}
      style={{ minHeight: height }}
    >
      <span className="schematic-label">Ad slot (reserved)</span>
    </aside>
  );
}
