import { beforeEach, describe, expect, test } from "vitest";
import { DAILY_QUOTA, consumeQuota, getQuota, hasQuota } from "./quota";

const QUOTA_KEY = "mk-gitflow:ai-quota";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

describe("quota", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("reports a full budget for a fresh browser", () => {
    // Arrange: no stored counter yet.
    // Act
    const state = getQuota();

    // Assert
    expect(state.used).toBe(0);
    expect(state.limit).toBe(DAILY_QUOTA);
    expect(state.remaining).toBe(DAILY_QUOTA);
    expect(state.date).toBe(today());
  });

  test("consuming decrements the remaining budget by one", () => {
    // Arrange
    const before = getQuota();

    // Act
    const after = consumeQuota();

    // Assert
    expect(after.used).toBe(before.used + 1);
    expect(after.remaining).toBe(before.remaining - 1);
  });

  test("persists the counter across reads within the same day", () => {
    // Arrange
    consumeQuota();
    consumeQuota();

    // Act
    const state = getQuota();

    // Assert
    expect(state.used).toBe(2);
    expect(state.remaining).toBe(DAILY_QUOTA - 2);
  });

  test("resets when the stored counter is from a previous day", () => {
    // Arrange: a stale entry from yesterday with usage on it.
    window.localStorage.setItem(
      QUOTA_KEY,
      JSON.stringify({ date: "2000-01-01", used: 25 }),
    );

    // Act
    const state = getQuota();

    // Assert
    expect(state.date).toBe(today());
    expect(state.used).toBe(0);
    expect(state.remaining).toBe(DAILY_QUOTA);
  });

  test("never reports usage or remaining outside the valid range", () => {
    // Arrange: a corrupt over-limit counter for today.
    window.localStorage.setItem(
      QUOTA_KEY,
      JSON.stringify({ date: today(), used: 9999 }),
    );

    // Act
    const state = getQuota();

    // Assert
    expect(state.used).toBe(DAILY_QUOTA);
    expect(state.remaining).toBe(0);
  });

  test("treats a corrupt counter as a fresh day", () => {
    // Arrange
    window.localStorage.setItem(QUOTA_KEY, "{ not json");

    // Act
    const state = getQuota();

    // Assert
    expect(state.used).toBe(0);
    expect(state.remaining).toBe(DAILY_QUOTA);
  });

  test("hasQuota is true while budget remains and false once exhausted", () => {
    // Arrange: budget available.
    expect(hasQuota()).toBe(true);

    // Act: exhaust the whole day's budget.
    for (let i = 0; i < DAILY_QUOTA; i += 1) consumeQuota();

    // Assert
    expect(getQuota().remaining).toBe(0);
    expect(hasQuota()).toBe(false);
  });
});
