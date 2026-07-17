"use client";

/**
 * History (PRODUCT_SPEC §5): past quiz attempts, cached repo analyses, saved
 * simulator sessions, and AI results — all local. Honest empty state; no fake
 * aggregate stats.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteSimulatorSession,
  listAiResults,
  listAnalyses,
  listQuizAttempts,
  listSimulatorSessions,
  type AiResultRecord,
  type AnalysisRecord,
  type QuizAttempt,
  type SimulatorSession,
} from "@/lib/storage";

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

export function HistoryView() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [sessions, setSessions] = useState<SimulatorSession[]>([]);
  const [aiResults, setAiResults] = useState<AiResultRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      listQuizAttempts(),
      listAnalyses(),
      listSimulatorSessions(),
      listAiResults(),
    ]).then(([a, an, s, ai]) => {
      if (!active) return;
      setAttempts(a);
      setAnalyses(an);
      setSessions(s);
      setAiResults(ai);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const onDeleteSession = async (id: string) => {
    await deleteSimulatorSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  if (!loaded) {
    return <div className="h-64 animate-pulse rounded-lg bg-surface-raised" aria-hidden="true" />;
  }

  const isEmpty =
    attempts.length === 0 && analyses.length === 0 && sessions.length === 0 && aiResults.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No history yet"
        description="Quiz attempts, repo analyses, and saved simulator sessions appear here once you start using the tools. Everything stays in this browser."
        action={
          <Link
            href="/quiz"
            className="inline-flex min-h-11 items-center rounded-sm bg-accent px-5 font-medium text-accent-contrast hover:bg-accent-hover"
          >
            Take a quiz
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-10">
      {attempts.length > 0 && (
        <section>
          <h2 className="schematic-label text-fg-muted">QUIZ ATTEMPTS</h2>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
            {attempts.map((a) => {
              const pct = Math.round((a.score / a.total) * 100);
              return (
                <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/quiz/${a.topicId}`} className="text-sm font-medium text-fg hover:text-accent">
                      {a.topicTitle}
                    </Link>
                    <p className="font-mono text-xs text-fg-muted">{fmtDate(a.at)}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm tabular-nums text-fg">
                    {a.score}/{a.total} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {analyses.length > 0 && (
        <section>
          <h2 className="schematic-label text-fg-muted">REPO ANALYSES</h2>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
            {analyses.map((an) => (
              <li key={an.slug} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/analyzer?repo=${encodeURIComponent(an.slug)}`}
                    className="truncate text-sm font-medium text-fg hover:text-accent"
                  >
                    {an.slug}
                  </Link>
                  <p className="font-mono text-xs text-fg-muted">{fmtDate(an.at)}</p>
                </div>
                <span className="shrink-0 font-mono text-sm tabular-nums text-fg">
                  {an.score} · {an.grade}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sessions.length > 0 && (
        <section>
          <h2 className="schematic-label text-fg-muted">SAVED SIMULATOR SESSIONS</h2>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{s.name}</p>
                  <p className="font-mono text-xs text-fg-muted">
                    {s.log.length} step{s.log.length === 1 ? "" : "s"} · {fmtDate(s.updatedAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteSession(s.id)}
                  aria-label={`Delete session ${s.name}`}
                >
                  <Trash2 size={15} aria-hidden="true" /> Delete
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {aiResults.length > 0 && (
        <section>
          <h2 className="schematic-label text-fg-muted">AI RESULTS</h2>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
            {aiResults.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{r.label}</p>
                  <p className="font-mono text-xs text-fg-muted">
                    {r.capability} · {fmtDate(r.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-fg-muted">
        History is stored only in this browser. Manage or clear it in{" "}
        <Link href="/settings" className="text-accent underline underline-offset-2">
          Settings
        </Link>
        .
      </p>
    </div>
  );
}
