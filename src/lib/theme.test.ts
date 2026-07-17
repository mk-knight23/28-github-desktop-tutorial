import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PREF_KEYS } from "@/lib/site";
import {
  applyMotionPref,
  applyThemePref,
  getMotionPref,
  getServerThemePref,
  getThemePref,
  isMotionReduced,
  resolveTheme,
  subscribeThemePref,
} from "./theme";

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.motion;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Force a matchMedia result for a given query substring. */
function stubMatchMedia(matches: (query: string) => boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) => ({ matches: matches(query), media: query }) as MediaQueryList,
  );
}

describe("getThemePref", () => {
  test("defaults to dark when nothing is stored", () => {
    expect(getThemePref()).toBe("dark");
  });

  test("returns a stored valid preference", () => {
    window.localStorage.setItem(PREF_KEYS.theme, "light");
    expect(getThemePref()).toBe("light");
  });

  test("ignores an invalid stored value", () => {
    window.localStorage.setItem(PREF_KEYS.theme, "neon");
    expect(getThemePref()).toBe("dark");
  });
});

describe("getServerThemePref", () => {
  test("matches the SSR default of dark", () => {
    expect(getServerThemePref()).toBe("dark");
  });
});

describe("resolveTheme", () => {
  test("returns an explicit preference unchanged", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  test("resolves system to light when the OS prefers light", () => {
    stubMatchMedia((q) => q.includes("light"));
    expect(resolveTheme("system")).toBe("light");
  });

  test("resolves system to dark when the OS does not prefer light", () => {
    stubMatchMedia(() => false);
    expect(resolveTheme("system")).toBe("dark");
  });
});

describe("applyThemePref", () => {
  test("persists the preference and stamps the resolved theme on <html>", () => {
    applyThemePref("light");
    expect(window.localStorage.getItem(PREF_KEYS.theme)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  test("notifies subscribers, and unsubscribing stops further calls", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeThemePref(listener);
    applyThemePref("dark");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    applyThemePref("light");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("motion preferences", () => {
  test("getMotionPref defaults to system", () => {
    expect(getMotionPref()).toBe("system");
  });

  test("applyMotionPref sets the dataset for an explicit preference", () => {
    applyMotionPref("reduce");
    expect(document.documentElement.dataset.motion).toBe("reduce");
    expect(window.localStorage.getItem(PREF_KEYS.motion)).toBe("reduce");
  });

  test("applyMotionPref removes the dataset attribute for system", () => {
    applyMotionPref("allow");
    applyMotionPref("system");
    expect(document.documentElement.dataset.motion).toBeUndefined();
  });

  test("isMotionReduced honours an explicit reduce preference", () => {
    applyMotionPref("reduce");
    expect(isMotionReduced()).toBe(true);
  });

  test("isMotionReduced honours an explicit allow preference", () => {
    applyMotionPref("allow");
    expect(isMotionReduced()).toBe(false);
  });

  test("isMotionReduced falls back to the OS setting under system", () => {
    applyMotionPref("system");
    stubMatchMedia((q) => q.includes("reduce"));
    expect(isMotionReduced()).toBe(true);
  });
});
