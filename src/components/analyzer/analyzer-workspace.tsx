"use client";

/**
 * Public repo analyzer (PRODUCT_SPEC §3.9): reads GitHub REST v3 unauthenticated,
 * scores docs health against a deterministic rubric, and shows an actionable
 * checklist. Rate limits are handled honestly. Results cache locally. Never sends
 * tokens; read-only public data only.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X, TriangleAlert, Star, GitFork, Search, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  analyzeRepo,
  parseRepoSlug,
  type AnalysisResult,
  type CheckStatus,
} from "@/lib/analyzer";
import { cacheAnalysis, getCachedAnalysis } from "@/lib/storage";
import { track } from "@/lib/analytics";

const STATUS_META: Record<CheckStatus, { Icon: typeof Check; className: string }> = {
  pass: { Icon: Check, className: "text-risk-safe" },
  partial: { Icon: TriangleAlert, className: "text-risk-caution" },
  fail: { Icon: X, className: "text-risk-danger" },
};

const GRADE_CLASS: Record<string, string> = {
  A: "text-risk-safe",
  B: "text-risk-safe",
  C: "text-risk-caution",
  D: "text-risk-caution",
  F: "text-risk-danger",
};

function formatDate(iso: string | null): string {
  if (!iso) return "unknown";
  return new Date(iso).toLocaleDateString();
}

export function AnalyzerWorkspace() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const ran = useRef(false);

  const run = useCallback(async (raw: string) => {
    const slug = parseRepoSlug(raw);
    if (!slug) {
      setError("Enter a repository as owner/repo or a github.com URL.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setFromCache(false);
    track("tool_started", { feature: "analyzer" });

    const outcome = await analyzeRepo(slug);
    setLoading(false);

    if (outcome.ok) {
      setResult(outcome.result);
      void cacheAnalysis({
        slug: outcome.result.slug,
        score: outcome.result.score,
        grade: outcome.result.grade,
        resultJson: JSON.stringify(outcome.result),
      });
      track("tool_completed", { feature: "analyzer" });
      return;
    }

    // Error path — try a cached copy so the user isn't left empty-handed.
    const cached = await getCachedAnalysis(slug);
    if (cached) {
      try {
        setResult(JSON.parse(cached.resultJson) as AnalysisResult);
        setFromCache(true);
      } catch {
        setResult(null);
      }
    } else {
      setResult(null);
    }

    if (outcome.kind === "rate-limited") {
      const when = outcome.retryAt ? ` Try again after ${new Date(outcome.retryAt).toLocaleTimeString()}.` : "";
      setError(`GitHub's unauthenticated rate limit was hit.${when}`);
    } else {
      setError(outcome.message);
    }
    track("tool_failed", { feature: "analyzer", kind: outcome.kind });
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void run(input);
  };

  // Auto-run from ?repo= (history links point here).
  useEffect(() => {
    if (ran.current) return;
    const repo = searchParams.get("repo");
    if (repo) {
      ran.current = true;
      setInput(repo);
      void run(repo);
    }
  }, [searchParams, run]);

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            aria-label="GitHub repository"
            spellCheck={false}
            autoCapitalize="off"
            className="min-h-11 w-full rounded-sm border border-border-strong bg-surface pl-9 pr-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <Button type="submit" loading={loading} loadingLabel="Analyzing…">
          Analyze
        </Button>
      </form>
      <p className="mt-2 text-xs text-fg-muted">
        Reads public data from GitHub&apos;s REST API without any token. Nothing is written to
        the repository.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-sm border border-risk-caution-border bg-risk-caution-bg px-4 py-3 text-sm text-fg">
          {error}
          {fromCache && " Showing your last cached result below."}
        </p>
      )}

      {loading && (
        <div className="mt-8 space-y-4" aria-hidden="true">
          <div className="h-32 animate-pulse rounded-lg bg-surface-raised" />
          <div className="h-64 animate-pulse rounded-lg bg-surface-raised" />
        </div>
      )}

      {!loading && !result && !error && (
        <div className="mt-8">
          <EmptyState
            icon={Search}
            title="Analyze a public repository"
            description="Enter any public GitHub repo to score its documentation health and get an actionable checklist. Try facebook/react or your own project."
          />
        </div>
      )}

      {result && !loading && (
        <div className="mt-8 space-y-8">
          {fromCache && (
            <p className="schematic-label text-fg-muted">CACHED · {formatDate(new Date().toISOString())}</p>
          )}

          {/* Score + meta */}
          <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
            <div className="rounded-lg border border-border bg-surface p-6 text-center">
              <p className="schematic-label text-fg-muted">DOCS HEALTH</p>
              <p className={`mt-2 font-mono text-6xl font-black ${GRADE_CLASS[result.grade] ?? "text-fg"}`}>
                {result.grade}
              </p>
              <p className="mt-2 font-mono text-lg tabular-nums text-fg">
                {result.score}
                <span className="text-fg-muted">/{result.maxScore}</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round((result.score / result.maxScore) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <a
                href={`https://github.com/${result.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-lg font-bold text-fg hover:text-accent"
              >
                {result.slug}
              </a>
              {result.meta.description && (
                <p className="mt-2 text-sm text-fg-secondary">{result.meta.description}</p>
              )}
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-secondary">
                <div className="flex items-center gap-1.5">
                  <Star size={14} aria-hidden="true" />
                  <span className="font-mono tabular-nums text-fg">{result.meta.stars.toLocaleString()}</span> stars
                </div>
                <div className="flex items-center gap-1.5">
                  <GitFork size={14} aria-hidden="true" />
                  <span className="font-mono tabular-nums text-fg">{result.meta.forks.toLocaleString()}</span> forks
                </div>
                <div className="flex items-center gap-1.5">
                  <Scale size={14} aria-hidden="true" />
                  {result.meta.license ?? "No license"}
                </div>
                <div>Updated {formatDate(result.meta.pushedAt)}</div>
              </dl>
              {result.languages.length > 0 && (
                <div className="mt-4">
                  <p className="schematic-label text-fg-muted">LANGUAGES</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.languages.slice(0, 6).map((lang) => (
                      <span
                        key={lang.name}
                        className="rounded-xs border border-border bg-terminal px-2 py-1 font-mono text-xs text-term-text"
                      >
                        {lang.name} {lang.percent}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          <section>
            <h2 className="schematic-label text-fg-muted">CHECKLIST</h2>
            <ul className="mt-3 space-y-2">
              {result.checklist.map((item) => {
                const { Icon, className } = STATUS_META[item.status];
                return (
                  <li key={item.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                    <Icon size={18} aria-hidden="true" className={`mt-0.5 shrink-0 ${className}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-fg">{item.label}</span>
                        <span className="shrink-0 font-mono text-xs tabular-nums text-fg-muted">
                          {item.earned}/{item.points}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-fg-secondary">{item.detail}</p>
                      {item.action && (
                        <p className="mt-1.5 text-sm text-accent">→ {item.action}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
