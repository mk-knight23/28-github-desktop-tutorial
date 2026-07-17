/**
 * Typed, consent-gated analytics (STANDARDS §6).
 *
 * GTM only loads after explicit consent (default declined) and never in
 * development. `track()` pushes to the data layer with a strictly typed event
 * union. Event params are limited to counts, bucketed sizes, feature names and
 * durations — NEVER command text, repo names, quiz content, error logs, or keys.
 */

import { PREF_KEYS } from "@/lib/site";

export type AnalyticsEvent =
  | "tool_opened"
  | "tool_started"
  | "tool_completed"
  | "tool_failed"
  | "file_selected"
  | "file_processed"
  | "ai_started"
  | "ai_completed"
  | "ai_failed"
  | "result_exported"
  | "result_copied"
  | "result_shared"
  | "history_opened"
  | "settings_changed"
  | "feedback_submitted"
  | "guide_opened"
  | "quota_reached";

/** Only non-identifying primitives are allowed as event params. */
export type AnalyticsParams = Record<string, string | number | boolean>;

export type ConsentState = "granted" | "denied" | "unset";

interface DataLayerWindow extends Window {
  dataLayer?: unknown[];
}

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const raw = window.localStorage.getItem(PREF_KEYS.consent);
    if (raw === "granted" || raw === "denied") return raw;
  } catch {
    // fall through
  }
  return "unset";
}

const consentListeners = new Set<() => void>();

export function subscribeConsent(listener: () => void): () => void {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}

export function getServerConsent(): ConsentState {
  return "unset";
}

export function setConsent(state: Exclude<ConsentState, "unset">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREF_KEYS.consent, state);
  } catch {
    // Private mode — consent applies for this page view only.
  }
  consentListeners.forEach((listener) => listener());
  if (state === "granted") ensureGtmLoaded();
}

function gtmId(): string | undefined {
  return process.env.NEXT_PUBLIC_GTM_ID || undefined;
}

/** True only when a GTM id is set, we're in production, and consent is granted. */
export function isAnalyticsActive(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    !!gtmId() &&
    getConsent() === "granted"
  );
}

let gtmLoaded = false;

/** Injects the GTM script exactly once, only when analytics is active. */
export function ensureGtmLoaded(): void {
  if (gtmLoaded || !isAnalyticsActive()) return;
  const id = gtmId();
  if (!id) return;
  gtmLoaded = true;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/**
 * Push a typed event. No-op unless analytics is active. Params are passed
 * through as-is (callers are responsible for sending only non-identifying data;
 * the type restricts values to primitives to make leaks harder).
 */
export function track(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (!isAnalyticsActive()) return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

/** Bucket a raw size/count into a coarse label so exact values never leak. */
export function bucket(value: number): string {
  if (value <= 0) return "0";
  if (value <= 5) return "1-5";
  if (value <= 20) return "6-20";
  if (value <= 50) return "21-50";
  if (value <= 100) return "51-100";
  return "100+";
}
