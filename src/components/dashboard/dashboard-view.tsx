"use client";

/**
 * Dashboard (PRODUCT_SPEC §5 / STANDARDS §3): real local data only — tutorial
 * progress, quiz scores, saved sessions, cached analyses. Honest empty states;
 * never fake "average user" numbers.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListChecks, CircleHelp, GitBranch, Gauge, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { TUTORIALS } from "@/lib/data/tutorials";
import { QUIZZES } from "@/lib/data/quizzes";
import {
  listAnalyses,
  listQuizAttempts,
  listSimulatorSessions,
  listTutorialProgress,
  type AnalysisRecord,
  type QuizAttempt,
  type SimulatorSession,
  type TutorialProgress,
} from "@/lib/storage";

interface DashData {
  tutorials: TutorialProgress[];
  attempts: QuizAttempt[];
  sessions: SimulatorSession[];
  analyses: AnalysisRecord[];
}

const TOTAL_TUTORIALS = TUTORIALS.length;

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-fg-muted">
        <Icon size={16} aria-hidden="true" />
        <span className="schematic-label">{label}</span>
      </div>
      <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-fg-secondary">{sub}</p>
    </div>
  );
}

export function DashboardView() {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      listTutorialProgress(),
      listQuizAttempts(),
      listSimulatorSessions(),
      listAnalyses(),
    ]).then(([tutorials, attempts, sessions, analyses]) => {
      if (active) setData({ tutorials, attempts, sessions, analyses });
    });
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-raised" />
        ))}
      </div>
    );
  }

  const completedTutorials = data.tutorials.filter(
    (t) => t.completedSteps.length >= t.totalSteps && t.totalSteps > 0,
  ).length;
  const bestByTopic = new Map<string, QuizAttempt>();
  for (const a of data.attempts) {
    const prev = bestByTopic.get(a.topicId);
    if (!prev || a.score / a.total > prev.score / prev.total) bestByTopic.set(a.topicId, a);
  }

  const isEmpty =
    data.tutorials.length === 0 &&
    data.attempts.length === 0 &&
    data.sessions.length === 0 &&
    data.analyses.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No activity yet"
        description="Open the simulator, take a quiz, or start a tutorial. Your progress shows up here — stored only in this browser."
        action={
          <Link
            href="/tool"
            className="inline-flex min-h-11 items-center rounded-sm bg-accent px-5 font-medium text-accent-contrast hover:bg-accent-hover"
          >
            Open the simulator
          </Link>
        }
      />
    );
  }

  const recent = [
    ...data.attempts.map((a) => ({ at: a.at, text: `Quiz: ${a.topicTitle} — ${a.score}/${a.total}`, href: "/history" })),
    ...data.analyses.map((a) => ({ at: a.at, text: `Analyzed ${a.slug} — grade ${a.grade}`, href: "/history" })),
    ...data.sessions.map((s) => ({ at: s.updatedAt, text: `Saved simulator session "${s.name}"`, href: "/tool" })),
    ...data.tutorials.map((t) => ({ at: t.updatedAt, text: `Tutorial: ${t.title} — ${t.completedSteps.length}/${t.totalSteps} steps`, href: "/tutorials" })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={ListChecks}
          label="TUTORIALS"
          value={`${completedTutorials}/${TOTAL_TUTORIALS}`}
          sub={`${data.tutorials.length} started`}
        />
        <StatTile
          icon={CircleHelp}
          label="QUIZ ATTEMPTS"
          value={String(data.attempts.length)}
          sub={`${bestByTopic.size} of ${QUIZZES.length} topics tried`}
        />
        <StatTile
          icon={GitBranch}
          label="SAVED SESSIONS"
          value={String(data.sessions.length)}
          sub="Simulator snapshots"
        />
        <StatTile
          icon={Gauge}
          label="REPO ANALYSES"
          value={String(data.analyses.length)}
          sub="Cached locally"
        />
      </div>

      {bestByTopic.size > 0 && (
        <section>
          <h2 className="schematic-label text-fg-muted">BEST QUIZ SCORES</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZZES.map((quiz) => {
              const best = bestByTopic.get(quiz.id);
              const pct = best ? Math.round((best.score / best.total) * 100) : null;
              return (
                <Link
                  key={quiz.id}
                  href={`/quiz/${quiz.id}`}
                  className="rounded-lg border border-border bg-surface p-4 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
                >
                  <p className="text-sm font-medium text-fg">{quiz.title}</p>
                  {best ? (
                    <>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono tabular-nums text-fg">
                          {best.score}/{best.total}
                        </span>
                        <span className="font-mono text-sm tabular-nums text-fg-secondary">{pct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-risk-safe"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-fg-muted">Not attempted</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="schematic-label text-fg-muted">RECENT ACTIVITY</h2>
        <ol className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
          {recent.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors duration-(--motion-fast) hover:bg-surface-raised"
              >
                <span className="min-w-0 truncate text-fg">{item.text}</span>
                <span className="shrink-0 font-mono text-xs text-fg-muted">{relativeTime(item.at)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
