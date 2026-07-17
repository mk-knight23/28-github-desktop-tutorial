/**
 * Client-side daily AI quota (STANDARDS §10, PRODUCT_SPEC §3.8).
 *
 * Anonymous, best-effort, per-browser: a localStorage counter that resets each
 * calendar day (local time). This is the visible usage indicator; the server
 * enforces its own best-effort per-IP limits independently. No user content is
 * involved — only a date and a count.
 */

const QUOTA_KEY = "mk-gitflow:ai-quota";

/** Daily request budget shown in the UI. Deliberately generous for a free tool. */
export const DAILY_QUOTA = 40;

export interface QuotaState {
  date: string;
  used: number;
  limit: number;
  remaining: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): { date: string; used: number } {
  if (typeof window === "undefined") return { date: today(), used: 0 };
  try {
    const raw = window.localStorage.getItem(QUOTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { date?: unknown; used?: unknown };
      if (typeof parsed.date === "string" && typeof parsed.used === "number") {
        if (parsed.date === today()) return { date: parsed.date, used: parsed.used };
      }
    }
  } catch {
    // corrupt or unavailable — treat as a fresh day
  }
  return { date: today(), used: 0 };
}

function write(state: { date: string; used: number }): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUOTA_KEY, JSON.stringify(state));
  } catch {
    // private mode — quota simply resets on reload
  }
}

function toState(inner: { date: string; used: number }): QuotaState {
  const used = Math.min(inner.used, DAILY_QUOTA);
  return { date: inner.date, used, limit: DAILY_QUOTA, remaining: Math.max(0, DAILY_QUOTA - used) };
}

export function getQuota(): QuotaState {
  return toState(read());
}

export function hasQuota(): boolean {
  return getQuota().remaining > 0;
}

/** Increment today's counter (call only when a real request is made). */
export function consumeQuota(): QuotaState {
  const current = read();
  const next = { date: current.date, used: current.used + 1 };
  write(next);
  return toState(next);
}
