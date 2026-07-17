"use client";

/**
 * Conventional Commit builder (PRODUCT_SPEC §3.6): deterministic form with live
 * preview and per-conventional-commits validation. No AI required.
 */

import { useMemo, useState } from "react";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { TerminalPanel } from "@/components/ui/terminal-panel";
import {
  COMMIT_TYPES,
  EMPTY_COMMIT,
  buildCommitMessage,
  isCommitValid,
  validateCommit,
  type CommitInput,
  type HintLevel,
} from "@/lib/commit-builder";

const HINT_META: Record<HintLevel, { Icon: typeof Info; className: string }> = {
  error: { Icon: CircleAlert, className: "text-risk-danger" },
  warning: { Icon: TriangleAlert, className: "text-risk-caution" },
  info: { Icon: Info, className: "text-fg-secondary" },
};

const inputClass =
  "min-h-11 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function CommitBuilder() {
  const [input, setInput] = useState<CommitInput>(EMPTY_COMMIT);

  const update = <K extends keyof CommitInput>(key: K, value: CommitInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const message = useMemo(() => buildCommitMessage(input), [input]);
  const hints = useMemo(() => validateCommit(input), [input]);
  const valid = useMemo(() => isCommitValid(input), [input]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-[1fr_1.4fr] gap-3">
          <div>
            <label htmlFor="cb-type" className="schematic-label text-fg-muted">
              TYPE
            </label>
            <select
              id="cb-type"
              value={input.type}
              onChange={(e) => update("type", e.target.value)}
              className={`${inputClass} mt-2`}
            >
              {COMMIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cb-scope" className="schematic-label text-fg-muted">
              SCOPE (optional)
            </label>
            <input
              id="cb-scope"
              value={input.scope}
              onChange={(e) => update("scope", e.target.value)}
              placeholder="auth, api, ui…"
              className={`${inputClass} mt-2`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cb-desc" className="schematic-label text-fg-muted">
            DESCRIPTION
          </label>
          <input
            id="cb-desc"
            value={input.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="add password reset flow"
            className={`${inputClass} mt-2`}
          />
        </div>

        <div>
          <label htmlFor="cb-body" className="schematic-label text-fg-muted">
            BODY (optional)
          </label>
          <textarea
            id="cb-body"
            value={input.body}
            onChange={(e) => update("body", e.target.value)}
            rows={4}
            placeholder="Explain what and why, not how. Wrap at ~72 characters."
            className={`${inputClass} mt-2 py-2 leading-relaxed`}
          />
        </div>

        <div className="rounded-sm border border-border p-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={input.isBreaking}
              onChange={(e) => update("isBreaking", e.target.checked)}
              className="accent-[var(--accent)]"
            />
            This is a breaking change
          </label>
          {input.isBreaking && (
            <div className="mt-3">
              <label htmlFor="cb-breaking" className="schematic-label text-fg-muted">
                BREAKING CHANGE DESCRIPTION
              </label>
              <input
                id="cb-breaking"
                value={input.breakingDescription}
                onChange={(e) => update("breakingDescription", e.target.value)}
                placeholder="config format changed from JSON to YAML"
                className={`${inputClass} mt-2`}
              />
            </div>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="schematic-label text-fg-muted">PREVIEW</span>
            {valid && <CopyButton text={message} feature="commit-builder" label="Copy message" />}
          </div>
          <div className="mt-3">
            <TerminalPanel title="COMMIT_MSG">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-term-text">
                {message || <span className="text-term-comment">Fill in a description to see the message.</span>}
              </pre>
            </TerminalPanel>
          </div>
        </div>

        {hints.length > 0 && (
          <ul className="space-y-2" aria-label="Validation hints">
            {hints.map((hint, i) => {
              const { Icon, className } = HINT_META[hint.level];
              return (
                <li key={i} className={`flex items-start gap-2 text-sm ${className}`}>
                  <Icon size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>{hint.message}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
