"use client";

/**
 * Tutorial runner (PRODUCT_SPEC §3.2): step checkpoints with local progress.
 * Checkpoints render as circular inspection stamps (DESIGN_SYSTEM.md §8.7) that
 * fill when done. CLI-path steps show commands in a terminal panel with copy +
 * risk badge. Progress persists to IndexedDB and shows on the dashboard.
 */

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import type { Tutorial } from "@/lib/data/tutorials";
import { getTutorialProgress, saveTutorialProgress } from "@/lib/storage";
import { track } from "@/lib/analytics";

interface TutorialRunnerProps {
  tutorial: Tutorial;
}

export function TutorialRunner({ tutorial }: TutorialRunnerProps) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getTutorialProgress(tutorial.id).then((progress) => {
      if (active && progress) setDone(new Set(progress.completedSteps));
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [tutorial.id]);

  const persist = (nextDone: Set<string>) => {
    void saveTutorialProgress({
      tutorialId: tutorial.id,
      path: tutorial.path,
      level: tutorial.level,
      title: tutorial.title,
      completedSteps: [...nextDone],
      totalSteps: tutorial.steps.length,
      updatedAt: Date.now(),
    });
  };

  const toggle = (stepId: string) => {
    const next = new Set(done);
    if (next.has(stepId)) next.delete(stepId);
    else next.add(stepId);
    setDone(next);
    persist(next);
    if (next.size === tutorial.steps.length) {
      track("tool_completed", { feature: "tutorial", tutorial: tutorial.id });
    }
  };

  const completed = done.size;
  const total = tutorial.steps.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 mb-8 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <span className="schematic-label text-fg-muted" aria-live="polite">
            {loaded ? `${completed} / ${total} checkpoints` : "Loading progress…"}
          </span>
          <span className="font-mono text-sm tabular-nums text-fg-secondary">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-risk-safe transition-[width] duration-(--motion-base)"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="space-y-8">
        {tutorial.steps.map((step, i) => {
          const isDone = done.has(step.id);
          return (
            <li key={step.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <button
                type="button"
                onClick={() => toggle(step.id)}
                aria-pressed={isDone}
                aria-label={`Checkpoint ${i + 1}: ${step.checkpoint}. ${isDone ? "Done" : "Not done"}.`}
                className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-colors duration-(--motion-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isDone
                    ? "border-risk-safe-border bg-risk-safe-bg text-risk-safe"
                    : "border-border text-fg-muted hover:border-border-strong"
                }`}
              >
                {isDone ? <Check size={18} aria-hidden="true" /> : `CK${String(i + 1).padStart(2, "0")}`}
              </button>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-fg">{step.title}</h2>
                <p className="mt-2 leading-relaxed text-fg-secondary">{step.body}</p>
                {step.command && (
                  <div className="mt-3">
                    <TerminalPanel>
                      <CommandLine
                        command={step.command}
                        risk={step.risk ?? "safe"}
                        feature={`tutorial:${tutorial.id}`}
                      />
                    </TerminalPanel>
                  </div>
                )}
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-fg-secondary">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggle(step.id)}
                    className="accent-[var(--accent)]"
                  />
                  {step.checkpoint}
                </label>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
