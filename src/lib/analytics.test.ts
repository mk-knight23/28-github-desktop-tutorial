import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  bucket,
  getConsent,
  getServerConsent,
  isAnalyticsActive,
  setConsent,
  subscribeConsent,
  track,
} from "./analytics";

const CONSENT_KEY = "mk-gitflow:consent";

interface DataLayerWindow extends Window {
  dataLayer?: unknown[];
}

function dataLayer(): unknown[] {
  return (window as DataLayerWindow).dataLayer ?? [];
}

describe("consent", () => {
  beforeEach(() => {
    window.localStorage.clear();
    (window as DataLayerWindow).dataLayer = [];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("defaults to unset before the user chooses", () => {
    expect(getConsent()).toBe("unset");
  });

  test("round-trips a granted choice through localStorage", () => {
    // Act
    setConsent("granted");

    // Assert
    expect(getConsent()).toBe("granted");
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe("granted");
  });

  test("round-trips a denied choice", () => {
    setConsent("denied");
    expect(getConsent()).toBe("denied");
  });

  test("ignores a corrupt stored value and returns unset", () => {
    // Arrange
    window.localStorage.setItem(CONSENT_KEY, "maybe");

    // Assert
    expect(getConsent()).toBe("unset");
  });

  test("notifies subscribers when consent changes", () => {
    // Arrange
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    // Act
    setConsent("denied");

    // Assert
    expect(listener).toHaveBeenCalledTimes(1);

    // Act again after unsubscribing
    unsubscribe();
    setConsent("granted");

    // Assert: no further calls after unsubscribe.
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("server consent is always unset (no request-time cookies)", () => {
    expect(getServerConsent()).toBe("unset");
  });
});

describe("isAnalyticsActive", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("is inactive in a non-production environment even with consent + id", () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
    setConsent("granted");

    // Assert
    expect(isAnalyticsActive()).toBe(false);
  });

  test("is inactive in production when no GTM id is configured", () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "");
    setConsent("granted");

    // Assert
    expect(isAnalyticsActive()).toBe(false);
  });

  test("is inactive in production with an id but without consent", () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
    setConsent("denied");

    // Assert
    expect(isAnalyticsActive()).toBe(false);
  });

  test("is active only in production with an id and granted consent", () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
    setConsent("granted");

    // Assert
    expect(isAnalyticsActive()).toBe(true);
  });
});

describe("track", () => {
  beforeEach(() => {
    window.localStorage.clear();
    (window as DataLayerWindow).dataLayer = [];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("is a no-op when analytics is inactive (default test env)", () => {
    // Arrange: no consent, not production.
    // Act
    track("tool_opened", { feature: "simulator" });

    // Assert: nothing pushed to the data layer.
    expect(dataLayer()).toHaveLength(0);
  });

  test("does not push events after the user declines", () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
    setConsent("denied");

    // Act
    track("guide_opened", { slug_count: 3 });

    // Assert
    expect(dataLayer()).toHaveLength(0);
  });

  test("pushes a typed event with params when active", () => {
    // Arrange
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
    setConsent("granted");

    // Act
    track("tool_completed", { feature: "gitignore", size: "6-20" });

    // Assert
    const pushed = dataLayer().find(
      (e): e is Record<string, unknown> =>
        typeof e === "object" && e !== null && "event" in e &&
        (e as Record<string, unknown>).event === "tool_completed",
    );
    expect(pushed).toBeDefined();
    expect(pushed?.feature).toBe("gitignore");
    expect(pushed?.size).toBe("6-20");
  });
});

describe("bucket", () => {
  test("maps raw counts to coarse, non-identifying labels", () => {
    // Assert: boundaries of each bucket.
    expect(bucket(0)).toBe("0");
    expect(bucket(-5)).toBe("0");
    expect(bucket(1)).toBe("1-5");
    expect(bucket(5)).toBe("1-5");
    expect(bucket(6)).toBe("6-20");
    expect(bucket(20)).toBe("6-20");
    expect(bucket(21)).toBe("21-50");
    expect(bucket(50)).toBe("21-50");
    expect(bucket(51)).toBe("51-100");
    expect(bucket(100)).toBe("51-100");
    expect(bucket(101)).toBe("100+");
    expect(bucket(10_000)).toBe("100+");
  });
});
