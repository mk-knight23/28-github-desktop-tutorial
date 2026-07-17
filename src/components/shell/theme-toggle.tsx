"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  applyThemePref,
  getServerThemePref,
  getThemePref,
  resolveTheme,
  subscribeThemePref,
  type ThemePref,
} from "@/lib/theme";

const NEXT_PREF: Record<ThemePref, ThemePref> = {
  dark: "light",
  light: "system",
  system: "dark",
};

const LABEL: Record<ThemePref, string> = {
  dark: "Theme: dark. Switch to light.",
  light: "Theme: light. Switch to system.",
  system: "Theme: system. Switch to dark.",
};

/** Cycles dark → light → system. Full radio control lives in /settings. */
export function ThemeToggle() {
  const pref = useSyncExternalStore(
    subscribeThemePref,
    getThemePref,
    getServerThemePref,
  );

  // Follow OS changes live while the pref is "system".
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      document.documentElement.dataset.theme = resolveTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const Icon = pref === "light" ? Sun : pref === "system" ? Monitor : Moon;

  return (
    <button
      type="button"
      onClick={() => applyThemePref(NEXT_PREF[pref])}
      aria-label={LABEL[pref]}
      title={LABEL[pref]}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm border border-border text-fg-secondary transition-colors duration-(--motion-fast) hover:bg-surface-raised hover:text-fg"
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}
