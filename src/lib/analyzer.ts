/**
 * Public repo analyzer (PRODUCT_SPEC §3.9).
 *
 * Fetches GitHub REST v3 UNAUTHENTICATED, read-only public data, and computes a
 * documented, deterministic docs-health score. 403/429 rate limits are handled
 * gracefully with an honest message. The scoring rubric (scoreRepo) is a pure
 * function so it is unit-testable without any network.
 *
 * The analyzer never sends tokens and never executes anything.
 */

const API_BASE = "https://api.github.com";
const RAW_LIMITS = { readmeChars: 20000 };

export interface RepoMeta {
  fullName: string;
  description: string | null;
  homepage: string | null;
  license: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  pushedAt: string | null;
  archived: boolean;
}

export interface LanguageShare {
  name: string;
  bytes: number;
  percent: number;
}

export interface ReadmeFacts {
  present: boolean;
  length: number;
  headingCount: number;
  hasBadge: boolean;
  hasCodeBlock: boolean;
}

/** Deterministic evidence gathered from the API — the input to scoreRepo(). */
export interface RepoFacts {
  hasDescription: boolean;
  readme: ReadmeFacts;
  hasLicense: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  hasSecurity: boolean;
  hasIssueTemplate: boolean;
  hasPrTemplate: boolean;
  workflowCount: number;
  releaseCount: number;
}

export type CheckStatus = "pass" | "partial" | "fail";

export interface ChecklistItem {
  id: string;
  label: string;
  points: number;
  earned: number;
  status: CheckStatus;
  detail: string;
  /** Actionable next step when not fully passing. */
  action?: string;
}

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface AnalysisResult {
  slug: string;
  meta: RepoMeta;
  languages: LanguageShare[];
  checklist: ChecklistItem[];
  score: number;
  maxScore: number;
  grade: Grade;
}

export type AnalyzerErrorKind = "invalid" | "not-found" | "rate-limited" | "network";

export interface AnalyzerError {
  ok: false;
  kind: AnalyzerErrorKind;
  message: string;
  /** Unix ms when the rate limit resets, when known. */
  retryAt?: number;
}

export type AnalyzerOutcome = { ok: true; result: AnalysisResult } | AnalyzerError;

/* ------------------------------ pure scoring ----------------------------- */

function gradeFor(percent: number): Grade {
  if (percent >= 85) return "A";
  if (percent >= 70) return "B";
  if (percent >= 55) return "C";
  if (percent >= 40) return "D";
  return "F";
}

function readmeQualityPoints(readme: ReadmeFacts): { earned: number; status: CheckStatus; detail: string; action?: string } {
  if (!readme.present) {
    return {
      earned: 0,
      status: "fail",
      detail: "No README found.",
      action: "Add a README.md that explains what the project does and how to use it.",
    };
  }
  let earned = 0;
  const notes: string[] = [];
  if (readme.length >= 300) earned += 4;
  else notes.push("longer than a couple of lines");
  if (readme.headingCount >= 3) earned += 4;
  else notes.push("more section headings");
  if (readme.hasCodeBlock) earned += 2;
  else notes.push("a usage code block");
  if (readme.hasBadge) earned += 2;
  else notes.push("status or version badges");

  const max = 12;
  if (earned >= max) {
    return { earned, status: "pass", detail: "README covers the essentials." };
  }
  return {
    earned,
    status: earned > 0 ? "partial" : "fail",
    detail: `README is present but could add ${notes.join(", ")}.`,
    action: `Improve the README: add ${notes.slice(0, 2).join(" and ")}.`,
  };
}

/** The documented rubric. Total is 100 points. */
export function scoreRepo(facts: RepoFacts): { score: number; maxScore: number; grade: Grade; checklist: ChecklistItem[] } {
  const checklist: ChecklistItem[] = [];

  const simple = (
    id: string,
    label: string,
    points: number,
    present: boolean,
    passDetail: string,
    failDetail: string,
    action: string,
  ): void => {
    checklist.push({
      id,
      label,
      points,
      earned: present ? points : 0,
      status: present ? "pass" : "fail",
      detail: present ? passDetail : failDetail,
      action: present ? undefined : action,
    });
  };

  simple(
    "description",
    "Repository description",
    8,
    facts.hasDescription,
    "The repo has a one-line description.",
    "No description set.",
    "Add a short description in the repo's About section.",
  );

  simple(
    "readme-present",
    "README file",
    15,
    facts.readme.present,
    "A README is present.",
    "No README file found.",
    "Add a README.md at the project root.",
  );

  const rq = readmeQualityPoints(facts.readme);
  checklist.push({
    id: "readme-quality",
    label: "README quality",
    points: 12,
    earned: rq.earned,
    status: rq.status,
    detail: rq.detail,
    action: rq.action,
  });

  simple(
    "license",
    "License",
    12,
    facts.hasLicense,
    "The project has a license.",
    "No license detected.",
    "Add a LICENSE file so others know how they can use the code.",
  );
  simple(
    "contributing",
    "Contributing guide",
    12,
    facts.hasContributing,
    "A CONTRIBUTING guide is present.",
    "No CONTRIBUTING guide.",
    "Add CONTRIBUTING.md describing how to set up and submit changes.",
  );
  simple(
    "code-of-conduct",
    "Code of conduct",
    8,
    facts.hasCodeOfConduct,
    "A code of conduct is present.",
    "No code of conduct.",
    "Add CODE_OF_CONDUCT.md (the Contributor Covenant is a common choice).",
  );
  simple(
    "security",
    "Security policy",
    8,
    facts.hasSecurity,
    "A SECURITY policy is present.",
    "No security policy.",
    "Add SECURITY.md with how to report vulnerabilities responsibly.",
  );
  simple(
    "issue-template",
    "Issue templates",
    5,
    facts.hasIssueTemplate,
    "Issue templates are configured.",
    "No issue templates.",
    "Add .github/ISSUE_TEMPLATE to guide bug reports and requests.",
  );
  simple(
    "pr-template",
    "Pull request template",
    5,
    facts.hasPrTemplate,
    "A pull request template is present.",
    "No pull request template.",
    "Add .github/pull_request_template.md so PRs arrive with context.",
  );
  simple(
    "ci",
    "Continuous integration",
    10,
    facts.workflowCount > 0,
    `${facts.workflowCount} workflow${facts.workflowCount === 1 ? "" : "s"} configured.`,
    "No GitHub Actions workflows.",
    "Add a CI workflow under .github/workflows to run tests on each push.",
  );
  simple(
    "releases",
    "Releases",
    5,
    facts.releaseCount > 0,
    "The project publishes releases.",
    "No releases published.",
    "Tag versions and publish releases so users can track changes.",
  );

  const score = checklist.reduce((sum, c) => sum + c.earned, 0);
  const maxScore = checklist.reduce((sum, c) => sum + c.points, 0);
  const percent = maxScore === 0 ? 0 : (score / maxScore) * 100;
  return { score, maxScore, grade: gradeFor(percent), checklist };
}

/* ------------------------------- fetching -------------------------------- */

/** Parse an "owner/repo" or GitHub URL into a normalized slug, or null. */
export function parseRepoSlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/github\.com[/:]([^/\s]+)\/([^/\s#?]+)/i);
  if (urlMatch) {
    return `${urlMatch[1]}/${stripGit(urlMatch[2])}`;
  }
  const plain = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (plain) return `${plain[1]}/${stripGit(plain[2])}`;
  return null;
}

function stripGit(name: string): string {
  return name.replace(/\.git$/i, "");
}

interface FetchResult<T> {
  status: number;
  data: T | null;
  rateLimited: boolean;
  retryAt?: number;
}

async function ghFetch<T>(path: string): Promise<FetchResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  const retryAt = reset ? Number(reset) * 1000 : undefined;
  const rateLimited =
    (res.status === 403 || res.status === 429) && remaining === "0";
  let data: T | null = null;
  if (res.ok) {
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
  }
  return { status: res.status, data, rateLimited, retryAt };
}

function decodeBase64(content: string): string {
  const clean = content.replace(/\s/g, "");
  if (typeof atob === "function") {
    try {
      const binary = atob(clean);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return "";
    }
  }
  return Buffer.from(clean, "base64").toString("utf-8");
}

function analyzeReadme(markdown: string): ReadmeFacts {
  const text = markdown.slice(0, RAW_LIMITS.readmeChars);
  const headingCount = (text.match(/^#{1,6}\s+/gm) ?? []).length;
  const hasBadge = /!\[[^\]]*\]\([^)]*(shields\.io|badge|img\.shields)[^)]*\)/i.test(text) ||
    /\[!\[/.test(text);
  const hasCodeBlock = /```/.test(text) || /^ {4}\S/m.test(text);
  return {
    present: true,
    length: text.length,
    headingCount,
    hasBadge,
    hasCodeBlock,
  };
}

interface GhContentEntry {
  name: string;
  type: string;
}

const CONTRIBUTING_NAMES = ["contributing.md", "contributing", "contributing.rst", ".github/contributing.md"];
const COC_NAMES = ["code_of_conduct.md", "code-of-conduct.md", "code_of_conduct"];
const SECURITY_NAMES = ["security.md", "security"];

function hasName(entries: GhContentEntry[], candidates: string[]): boolean {
  const lower = entries.map((e) => e.name.toLowerCase());
  return candidates.some((c) => lower.includes(c));
}

/**
 * Analyze a public repo. Returns a discriminated outcome so the UI can render
 * an honest state for rate limits, missing repos, and network failures.
 */
export async function analyzeRepo(slug: string): Promise<AnalyzerOutcome> {
  const normalized = parseRepoSlug(slug);
  if (!normalized) {
    return { ok: false, kind: "invalid", message: "Enter a repository as owner/repo or a GitHub URL." };
  }

  try {
    const repo = await ghFetch<Record<string, unknown>>(`/repos/${normalized}`);
    if (repo.rateLimited) {
      return {
        ok: false,
        kind: "rate-limited",
        message: "GitHub's unauthenticated rate limit is reached (60 requests per hour per IP).",
        retryAt: repo.retryAt,
      };
    }
    if (repo.status === 404) {
      return { ok: false, kind: "not-found", message: `No public repository found at ${normalized}.` };
    }
    if (!repo.data) {
      return { ok: false, kind: "network", message: `GitHub returned status ${repo.status}.` };
    }

    const data = repo.data;
    const licenseObj = data.license as { name?: string } | null | undefined;
    const meta: RepoMeta = {
      fullName: String(data.full_name ?? normalized),
      description: (data.description as string | null) ?? null,
      homepage: (data.homepage as string | null) || null,
      license: licenseObj?.name ?? null,
      defaultBranch: String(data.default_branch ?? "main"),
      stars: Number(data.stargazers_count ?? 0),
      forks: Number(data.forks_count ?? 0),
      openIssues: Number(data.open_issues_count ?? 0),
      topics: Array.isArray(data.topics) ? (data.topics as string[]) : [],
      pushedAt: (data.pushed_at as string | null) ?? null,
      archived: Boolean(data.archived),
    };

    // Fire the remaining reads in parallel (best-effort; failures = absent).
    const [langsRes, readmeRes, rootRes, ghDirRes, workflowsRes, releasesRes] =
      await Promise.all([
        ghFetch<Record<string, number>>(`/repos/${normalized}/languages`),
        ghFetch<{ content?: string }>(`/repos/${normalized}/readme`),
        ghFetch<GhContentEntry[]>(`/repos/${normalized}/contents`),
        ghFetch<GhContentEntry[]>(`/repos/${normalized}/contents/.github`),
        ghFetch<GhContentEntry[]>(`/repos/${normalized}/contents/.github/workflows`),
        ghFetch<unknown[]>(`/repos/${normalized}/releases?per_page=1`),
      ]);

    const rootEntries = rootRes.data ?? [];
    const ghEntries = ghDirRes.data ?? [];
    const allEntries = [...rootEntries, ...ghEntries.map((e) => ({ ...e, name: `.github/${e.name}` }))];

    const readme: ReadmeFacts = readmeRes.data?.content
      ? analyzeReadme(decodeBase64(readmeRes.data.content))
      : { present: false, length: 0, headingCount: 0, hasBadge: false, hasCodeBlock: false };

    const ghNames = ghEntries.map((e) => e.name.toLowerCase());
    const facts: RepoFacts = {
      hasDescription: !!meta.description && meta.description.trim().length > 0,
      readme,
      hasLicense: !!meta.license || hasName(rootEntries, ["license", "license.md", "license.txt", "copying"]),
      hasContributing: hasName(allEntries, CONTRIBUTING_NAMES) || ghNames.includes("contributing.md"),
      hasCodeOfConduct: hasName(allEntries, COC_NAMES) || ghNames.includes("code_of_conduct.md"),
      hasSecurity: hasName(allEntries, SECURITY_NAMES) || ghNames.includes("security.md"),
      hasIssueTemplate:
        ghNames.includes("issue_template.md") ||
        ghNames.includes("issue_template") ||
        ghEntries.some((e) => e.name.toLowerCase() === "issue_template" && e.type === "dir"),
      hasPrTemplate:
        ghNames.includes("pull_request_template.md") ||
        hasName(rootEntries, ["pull_request_template.md"]),
      workflowCount: (workflowsRes.data ?? []).filter((e) => /\.ya?ml$/i.test(e.name)).length,
      releaseCount: (releasesRes.data ?? []).length,
    };

    const totalBytes = Object.values(langsRes.data ?? {}).reduce((a, b) => a + b, 0);
    const languages: LanguageShare[] = Object.entries(langsRes.data ?? {})
      .map(([name, bytes]) => ({
        name,
        bytes,
        percent: totalBytes === 0 ? 0 : Math.round((bytes / totalBytes) * 1000) / 10,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 8);

    const { score, maxScore, grade, checklist } = scoreRepo(facts);
    return {
      ok: true,
      result: { slug: normalized, meta, languages, checklist, score, maxScore, grade },
    };
  } catch {
    return {
      ok: false,
      kind: "network",
      message: "Could not reach GitHub. Check your connection and try again.",
    };
  }
}
