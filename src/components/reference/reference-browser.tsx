"use client";

/**
 * Command reference browser (PRODUCT_SPEC §3.4): search + filter by risk level.
 * Risk is shown as color + icon + text (RiskBadge), never color alone.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import type { RefCommand } from "@/lib/data/reference";
import { REF_CATEGORIES, type RefCategory } from "@/lib/data/reference";
import type { RiskLevel } from "@/lib/git-engine";

type RiskFilter = RiskLevel | "all";

const RISK_FILTERS: { value: RiskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "safe", label: "Safe" },
  { value: "caution", label: "Caution" },
  { value: "destructive", label: "Destructive" },
];

interface ReferenceBrowserProps {
  commands: RefCommand[];
}

export function ReferenceBrowser({ commands }: ReferenceBrowserProps) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands.filter((cmd) => {
      if (risk !== "all" && cmd.risk !== risk) return false;
      if (!q) return true;
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.summary.toLowerCase().includes(q) ||
        cmd.syntax.toLowerCase().includes(q)
      );
    });
  }, [commands, query, risk]);

  const byCategory = useMemo(() => {
    const map = new Map<RefCategory, RefCommand[]>();
    for (const cat of REF_CATEGORIES) map.set(cat, []);
    for (const cmd of filtered) map.get(cmd.category)?.push(cmd);
    return map;
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            aria-label="Search commands"
            className="min-h-11 w-full rounded-sm border border-border-strong bg-surface pl-9 pr-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Filter by risk level">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setRisk(f.value)}
              aria-pressed={risk === f.value}
              className={`schematic-label min-h-11 cursor-pointer rounded-sm border px-3 transition-colors duration-(--motion-fast) ${
                risk === f.value
                  ? "border-accent bg-surface-raised text-fg"
                  : "border-border text-fg-secondary hover:bg-surface-raised hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 schematic-label text-fg-muted" aria-live="polite">
        {filtered.length} command{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-fg-secondary">
          No commands match that search. Try a different term or risk filter.
        </p>
      ) : (
        <div className="mt-6 space-y-10">
          {REF_CATEGORIES.map((cat) => {
            const items = byCategory.get(cat) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="schematic-label text-accent">{cat}</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {items.map((cmd) => (
                    <Link
                      key={cmd.slug}
                      href={`/reference/${cmd.slug}`}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <code className="font-mono text-sm font-medium text-fg">{cmd.name}</code>
                        <RiskBadge risk={cmd.risk} size={12} />
                      </div>
                      <p className="text-sm text-fg-secondary">{cmd.summary}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
