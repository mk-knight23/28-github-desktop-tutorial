/**
 * Best-effort in-memory rate limiting (STANDARDS §8).
 *
 * SERVER-ONLY. Two independent gates per client IP:
 *   1. Token bucket — smooths bursts (BURST_CAPACITY tokens, refilled steadily).
 *   2. Daily cap — a coarse ceiling that resets each calendar day (UTC).
 *
 * This is per-instance and resets on redeploy/scale events; it is a guardrail,
 * not a billing control. Documented as best-effort in AI_ARCHITECTURE.md. No IP
 * is logged — it is only a map key held in memory.
 */

const BURST_CAPACITY = 8;
/** Tokens regained per second → 8 requests/minute sustained. */
const REFILL_PER_SECOND = BURST_CAPACITY / 60;
const DAILY_CAP = 200;
/** Prune idle buckets past this age so the map cannot grow without bound. */
const IDLE_TTL_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 10_000;

interface Bucket {
  tokens: number;
  updatedAt: number;
}

interface DailyCount {
  date: string;
  count: number;
}

const buckets = new Map<string, Bucket>();
const daily = new Map<string, DailyCount>();

function utcDate(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function prune(now: number): void {
  if (buckets.size < MAX_ENTRIES) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.updatedAt > IDLE_TTL_MS) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Set when blocked: which gate tripped. */
  reason?: "rate" | "daily";
  /** Set when blocked: seconds until the caller may retry. */
  retryAfter?: number;
}

/** Consume one unit of budget for `ip`. Call once per accepted request. */
export function checkRateLimit(ip: string, now: number = Date.now()): RateLimitResult {
  prune(now);

  const day = utcDate(now);
  const dayCount = daily.get(ip);
  if (dayCount && dayCount.date === day && dayCount.count >= DAILY_CAP) {
    return { ok: false, reason: "daily", retryAfter: secondsUntilNextUtcDay(now) };
  }

  const bucket = buckets.get(ip) ?? { tokens: BURST_CAPACITY, updatedAt: now };
  const elapsedSeconds = (now - bucket.updatedAt) / 1000;
  const refilled = Math.min(BURST_CAPACITY, bucket.tokens + elapsedSeconds * REFILL_PER_SECOND);

  if (refilled < 1) {
    buckets.set(ip, { tokens: refilled, updatedAt: now });
    const retryAfter = Math.ceil((1 - refilled) / REFILL_PER_SECOND);
    return { ok: false, reason: "rate", retryAfter: Math.max(1, retryAfter) };
  }

  buckets.set(ip, { tokens: refilled - 1, updatedAt: now });
  if (dayCount && dayCount.date === day) {
    dayCount.count += 1;
  } else {
    daily.set(ip, { date: day, count: 1 });
  }
  return { ok: true };
}

function secondsUntilNextUtcDay(now: number): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((next.getTime() - now) / 1000));
}

/** Test-only reset so limiter state does not leak across specs. */
export function __resetRateLimit(): void {
  buckets.clear();
  daily.clear();
}
