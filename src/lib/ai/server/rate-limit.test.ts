import { beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimit, checkRateLimit } from "@/lib/ai/server/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
  });

  it("allows an initial burst then blocks with a retry-after", () => {
    const now = 1_000_000;
    // Capacity is 8: first 8 succeed at the same instant.
    for (let i = 0; i < 8; i += 1) {
      expect(checkRateLimit("1.1.1.1", now).ok).toBe(true);
    }
    const blocked = checkRateLimit("1.1.1.1", now);
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe("rate");
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("refills over time", () => {
    const start = 2_000_000;
    for (let i = 0; i < 8; i += 1) checkRateLimit("2.2.2.2", start);
    expect(checkRateLimit("2.2.2.2", start).ok).toBe(false);
    // ~8 seconds later one token is back (refill = 8/60 per second).
    expect(checkRateLimit("2.2.2.2", start + 8_000).ok).toBe(true);
  });

  it("tracks IPs independently", () => {
    const now = 3_000_000;
    for (let i = 0; i < 8; i += 1) checkRateLimit("3.3.3.3", now);
    expect(checkRateLimit("3.3.3.3", now).ok).toBe(false);
    expect(checkRateLimit("4.4.4.4", now).ok).toBe(true);
  });

  it("enforces a daily cap independent of refill", () => {
    let now = 4_000_000;
    let allowed = 0;
    // Space calls far enough apart that the token bucket never blocks, so only
    // the daily cap (200) can stop them.
    for (let i = 0; i < 210; i += 1) {
      const result = checkRateLimit("5.5.5.5", now);
      if (result.ok) allowed += 1;
      else {
        expect(result.reason).toBe("daily");
        break;
      }
      now += 60_000;
    }
    expect(allowed).toBe(200);
  });
});
