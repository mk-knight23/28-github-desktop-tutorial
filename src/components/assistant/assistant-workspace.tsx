"use client";

/**
 * AI assistant hub (PRODUCT_SPEC §3.8, STANDARDS §10).
 *
 * Orchestrates all nine capabilities: capability picker, per-capability form,
 * run/cancel, the visible daily quota, and BYOK. Honesty rules enforced here:
 *   - Every request that fails or is quota-blocked falls back to a deterministic
 *     result WHERE ONE EXISTS, clearly labeled "Generated locally (not AI)".
 *   - When no fallback exists, an honest error is shown — never a faked answer.
 *   - Analytics events (ai_started/ai_completed/ai_failed/quota_reached) carry
 *     only the capability slug and a coarse reason code, never user text.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { KeyRound, Loader2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CapabilityForm, CAPABILITY_FIELDS } from "@/components/assistant/capability-forms";
import { ResultView } from "@/components/assistant/result-views";
import { CAPABILITIES, getCapability } from "@/lib/ai/catalog";
import { callAi } from "@/lib/ai/client";
import { INPUT_SCHEMAS } from "@/lib/ai/schemas";
import { runFallback } from "@/lib/ai/fallbacks";
import { consumeQuota, DAILY_QUOTA, getQuota, hasQuota, type QuotaState } from "@/lib/ai/quota";
import { getByokKey, setByokKey } from "@/lib/ai/byok";
import { track } from "@/lib/analytics";
import { recordAiResult } from "@/lib/storage";
import type { AiErrorCode, CapabilitySlug } from "@/lib/ai/types";

type ResultState =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "ok";
      slug: CapabilitySlug;
      source: "ai" | "local";
      model: string | null;
      data: unknown;
      degradedNote?: string;
    }
  | { kind: "error"; message: string };

function buildInput(slug: CapabilitySlug, values: Record<string, string>): Record<string, string> {
  const object: Record<string, string> = {};
  for (const field of CAPABILITY_FIELDS[slug]) {
    const value = (values[field.name] ?? "").trim();
    if (!field.required && value === "") continue;
    object[field.name] = value;
  }
  return object;
}

function degradeMessage(code: AiErrorCode): string {
  switch (code) {
    case "unavailable":
      return "AI isn't available on this server. Here's a local, non-AI result instead.";
    case "rate-limited":
    case "quota-exceeded":
      return "The AI service is busy right now. Here's a local, non-AI result instead.";
    default:
      return "AI couldn't complete that. Here's a local, non-AI result instead.";
  }
}

export function AssistantWorkspace() {
  const [slug, setSlug] = useState<CapabilitySlug>("nl-to-command");
  const [valuesBySlug, setValuesBySlug] = useState<Record<string, Record<string, string>>>({});
  const [result, setResult] = useState<ResultState>({ kind: "idle" });
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [byokKey, setByokKeyState] = useState("");
  const [byokOpen, setByokOpen] = useState(false);
  const [byokDraft, setByokDraft] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Read browser-only state after mount (avoids a hydration mismatch). Deferred
    // a microtask so the reads are not a synchronous setState inside the effect.
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setQuota(getQuota());
      const stored = getByokKey();
      setByokKeyState(stored);
      setByokDraft(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const meta = useMemo(() => getCapability(slug), [slug]);
  const values = valuesBySlug[slug] ?? {};
  const loading = result.kind === "loading";

  const updateField = (name: string, value: string) => {
    setValuesBySlug((prev) => ({ ...prev, [slug]: { ...(prev[slug] ?? {}), [name]: value } }));
  };

  const selectCapability = (next: CapabilitySlug) => {
    if (loading) return;
    setSlug(next);
    setResult({ kind: "idle" });
  };

  const recordHistory = async (label: string, source: "ai" | "local") => {
    try {
      await recordAiResult({ capability: slug, label: source === "local" ? `${label} · local` : label });
    } catch {
      // history is best-effort; ignore storage failures
    }
  };

  const showLocalFallback = (input: Record<string, string>, note: string) => {
    const data = runFallback(slug, input as never);
    if (data === null) return false;
    setResult({ kind: "ok", slug, source: "local", model: null, data, degradedNote: note });
    void recordHistory(meta.label, "local");
    return true;
  };

  const run = async () => {
    const raw = buildInput(slug, values);
    const parsed = INPUT_SCHEMAS[slug].safeParse(raw);
    if (!parsed.success) {
      setResult({ kind: "error", message: parsed.error.issues[0]?.message ?? "Check your input and try again." });
      return;
    }
    const input = parsed.data as Record<string, string>;

    if (!hasQuota()) {
      track("quota_reached", { capability: slug });
      const note = `You've used today's ${DAILY_QUOTA} AI requests.`;
      if (!showLocalFallback(input, `${note} This is a local, non-AI result.`)) {
        setResult({
          kind: "error",
          message: `${note} Add your own key below to keep going, or come back tomorrow.`,
        });
      }
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setResult({ kind: "loading" });
    track("ai_started", { capability: slug });

    const response = await callAi(slug, input as never, {
      byokKey: byokKey || undefined,
      signal: controller.signal,
    });
    abortRef.current = null;

    if (response.status === "ok") {
      setQuota(consumeQuota());
      track("ai_completed", { capability: slug });
      setResult({ kind: "ok", slug, source: "ai", model: response.model, data: response.data });
      void recordHistory(meta.label, "ai");
      return;
    }

    if (response.code === "cancelled") {
      setResult({ kind: "idle" });
      return;
    }

    track("ai_failed", { capability: slug, reason: response.code });
    if (response.code !== "invalid-input" && showLocalFallback(input, degradeMessage(response.code))) {
      return;
    }
    setResult({ kind: "error", message: response.message });
  };

  const cancel = () => abortRef.current?.abort();

  const saveByok = () => {
    setByokKey(byokDraft);
    const stored = getByokKey();
    setByokKeyState(stored);
    setByokDraft(stored);
  };

  const clearByok = () => {
    setByokKey("");
    setByokKeyState("");
    setByokDraft("");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
      {/* Capability picker */}
      <nav aria-label="AI capabilities" className="lg:sticky lg:top-24 lg:self-start">
        <p className="schematic-label mb-3 text-fg-muted">CAPABILITIES</p>
        <ul className="space-y-1.5">
          {CAPABILITIES.map((capability) => {
            const active = capability.slug === slug;
            return (
              <li key={capability.slug}>
                <button
                  type="button"
                  onClick={() => selectCapability(capability.slug)}
                  aria-current={active ? "true" : undefined}
                  disabled={loading && !active}
                  className={`w-full rounded-sm border px-3 py-2.5 text-left transition-colors duration-(--motion-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    active
                      ? "border-accent bg-surface-raised text-fg"
                      : "border-border text-fg-secondary hover:border-border-strong hover:bg-surface-raised hover:text-fg"
                  }`}
                >
                  <span className="block text-sm font-medium">{capability.title}</span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className="schematic-label text-fg-muted">
                      {capability.tier === "quality" ? "QUALITY" : "FAST"}
                    </span>
                    {capability.hasFallback && (
                      <span className="schematic-label text-risk-safe">OFFLINE OK</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Workspace */}
      <div className="min-w-0 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-fg">{meta.title}</h2>
          <p className="mt-1.5 text-fg-secondary">{meta.blurb}</p>
          <p className="mt-3 flex items-start gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-xs text-fg-muted">
            <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>{meta.degraded}</span>
          </p>
        </div>

        <CapabilityForm slug={slug} values={values} onChange={updateField} disabled={loading} />

        <div className="flex flex-wrap items-center gap-3">
          {loading ? (
            <Button variant="secondary" onClick={cancel}>
              Cancel
            </Button>
          ) : (
            <Button onClick={run}>
              <Sparkles size={16} aria-hidden="true" />
              Run
            </Button>
          )}
          {loading && (
            <span className="flex items-center gap-2 text-sm text-fg-muted">
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Working…
            </span>
          )}
          {quota && !loading && (
            <span className="text-xs text-fg-muted">
              {quota.remaining} of {quota.limit} AI requests left today
            </span>
          )}
        </div>

        {/* BYOK */}
        <div className="rounded-sm border border-border">
          <button
            type="button"
            onClick={() => setByokOpen((open) => !open)}
            aria-expanded={byokOpen}
            className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-fg hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex items-center gap-2">
              <KeyRound size={15} aria-hidden="true" />
              Use your own AI key
            </span>
            <span className="schematic-label text-fg-muted">
              {byokKey ? "SAVED" : byokOpen ? "HIDE" : "SHOW"}
            </span>
          </button>
          {byokOpen && (
            <div className="space-y-3 border-t border-border px-3 py-3">
              <p className="text-xs text-fg-muted">
                Your key is stored only in this browser and sent with each request in the{" "}
                <code className="text-fg-secondary">x-byok-key</code> header. It is never logged,
                stored on the server, or included in analytics.
              </p>
              <input
                type="password"
                autoComplete="off"
                value={byokDraft}
                onChange={(event) => setByokDraft(event.target.value)}
                placeholder="Vercel AI Gateway key"
                aria-label="Your AI gateway key"
                className="min-h-11 w-full rounded-sm border border-border-strong bg-surface px-3 font-mono text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveByok} disabled={byokDraft.trim() === byokKey}>
                  Save key
                </Button>
                {byokKey && (
                  <Button size="sm" variant="ghost" onClick={clearByok}>
                    Remove key
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <div aria-live="polite">
          {result.kind === "error" && (
            <div className="rounded-sm border border-risk-caution-border bg-risk-caution-bg px-4 py-3 text-sm text-risk-caution">
              {result.message}
            </div>
          )}
          {result.kind === "ok" && (
            <section className="rounded-md border border-border bg-surface p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`schematic-label ${
                    result.source === "ai" ? "text-accent" : "text-risk-safe"
                  }`}
                >
                  {result.source === "ai"
                    ? `GENERATED BY AI${result.model ? ` · ${result.model}` : ""}`
                    : "GENERATED LOCALLY (NOT AI)"}
                </span>
              </div>
              {result.degradedNote && (
                <p className="mb-4 rounded-sm border border-border bg-surface-raised px-3 py-2 text-xs text-fg-secondary">
                  {result.degradedNote}
                </p>
              )}
              <ResultView slug={result.slug} data={result.data} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
