"use client";

/**
 * Live analytics-consent control (used on /cookies and available for /settings).
 * Reflects the current stored choice and lets the visitor change it. Reads the
 * same store the consent banner and analytics util use, so changes take effect
 * immediately (GTM loads on grant; stays absent on deny).
 */

import { useSyncExternalStore } from "react";
import { Check, X } from "lucide-react";
import {
  getConsent,
  getServerConsent,
  setConsent,
  subscribeConsent,
  type ConsentState,
} from "@/lib/analytics";

const LABEL: Record<ConsentState, string> = {
  granted: "Analytics are on",
  denied: "Analytics are off",
  unset: "You haven't chosen yet",
};

export function ConsentControls() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            consent === "granted" ? "bg-risk-safe" : "bg-fg-muted"
          }`}
        />
        <span className="text-sm font-medium text-fg">{LABEL[consent]}</span>
      </p>
      <p className="mt-2 text-sm text-fg-secondary">
        Analytics are optional and off unless you turn them on. We never send command text, repo
        names, quiz content, error logs, or keys — only counts, coarse sizes, feature names, and
        timings, and only in production.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConsent("granted")}
          aria-pressed={consent === "granted"}
          className={`inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-sm font-medium transition-colors duration-(--motion-fast) ${
            consent === "granted"
              ? "bg-accent text-accent-contrast"
              : "border border-border-strong bg-surface text-fg hover:bg-surface-raised"
          }`}
        >
          <Check size={16} aria-hidden="true" />
          Allow analytics
        </button>
        <button
          type="button"
          onClick={() => setConsent("denied")}
          aria-pressed={consent === "denied"}
          className={`inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-sm font-medium transition-colors duration-(--motion-fast) ${
            consent === "denied"
              ? "bg-surface-raised text-fg ring-1 ring-border-strong"
              : "border border-border-strong bg-surface text-fg hover:bg-surface-raised"
          }`}
        >
          <X size={16} aria-hidden="true" />
          Turn off analytics
        </button>
      </div>
    </div>
  );
}
