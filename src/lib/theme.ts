"use client";

import { PREF_KEYS } from "@/lib/site";

export type ThemePref = "dark" | "light" | "system";
export type MotionPref = "system" | "allow" | "reduce";

const THEME_VALUES: readonly ThemePref[] = ["dark", "light", "system"];
const MOTION_VALUES: readonly MotionPref[] = ["system", "allow", "reduce"];

function readPref<T extends string>(key: string, valid: readonly T[]): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return valid.includes(raw as T) ? (raw as T) : null;
  } catch {
    return null;
  }
}

/** Dark is the product default (DESIGN_SYSTEM.md §12). */
export function getThemePref(): ThemePref {
  return readPref(PREF_KEYS.theme, THEME_VALUES) ?? "dark";
}

/* Tiny external store so components can subscribe via useSyncExternalStore. */
const themeListeners = new Set<() => void>();

export function subscribeThemePref(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

/** Server snapshot for useSyncExternalStore — matches the SSR default. */
export function getServerThemePref(): ThemePref {
  return "dark";
}

export function resolveTheme(pref: ThemePref): "dark" | "light" {
  if (pref !== "system") return pref;
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function applyThemePref(pref: ThemePref): void {
  try {
    window.localStorage.setItem(PREF_KEYS.theme, pref);
  } catch {
    // Private mode: theme still applies for this page view.
  }
  document.documentElement.dataset.theme = resolveTheme(pref);
  themeListeners.forEach((listener) => listener());
}

export function getMotionPref(): MotionPref {
  return readPref(PREF_KEYS.motion, MOTION_VALUES) ?? "system";
}

export function applyMotionPref(pref: MotionPref): void {
  try {
    window.localStorage.setItem(PREF_KEYS.motion, pref);
  } catch {
    // Private mode: still apply for this page view.
  }
  if (pref === "system") {
    delete document.documentElement.dataset.motion;
  } else {
    document.documentElement.dataset.motion = pref;
  }
}

/** True when the user (or their OS) asked for reduced motion right now. */
export function isMotionReduced(): boolean {
  const pref = getMotionPref();
  if (pref === "reduce") return true;
  if (pref === "allow") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
