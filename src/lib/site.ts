/** Site-wide constants. Single source of truth for identity and URLs. */

export const SITE_NAME = "MK GitFlow";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitflow.mkazi.live";

export const SITE_DESCRIPTION =
  "Interactive Git learning platform: simulate commands on a visual branch graph, " +
  "follow guided tutorials, and look up risk-graded command references. " +
  "Never executes shell commands — it only shows and simulates them.";

export const CREATOR = {
  name: "Kazi Musharraf",
  tagline: "AI Engineer · Full-Stack Developer · Open-Source Builder",
  github: "https://github.com/mk-knight23",
  portfolio: "https://www.mkazi.live",
  repo: "https://github.com/mk-knight23/44-tool-github-desktop-guide",
  email: "kazi@reprime.com",
} as const;

/** GitHub issue tracker for the project (primary support channel). */
export const REPO_ISSUES = `${CREATOR.repo}/issues`;
export const REPO_SECURITY = `${CREATOR.repo}/security/advisories/new`;

/** Exact footer sentence per STANDARDS §3 — do not reword. */
export const FOOTER_SENTENCE =
  "Built and maintained by Kazi Musharraf. Open source for everyone.";

/** localStorage keys (tiny prefs only — everything else lives in IndexedDB). */
export const PREF_KEYS = {
  theme: "mk-gitflow:theme",
  motion: "mk-gitflow:motion",
  consent: "mk-gitflow:consent",
  historyDisabled: "mk-gitflow:history-disabled",
} as const;
