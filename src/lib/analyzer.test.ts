import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { analyzeRepo, parseRepoSlug, scoreRepo, type RepoFacts } from "./analyzer";

const PERFECT_README = {
  present: true,
  length: 800,
  headingCount: 5,
  hasBadge: true,
  hasCodeBlock: true,
};

function facts(overrides: Partial<RepoFacts> = {}): RepoFacts {
  return {
    hasDescription: true,
    readme: PERFECT_README,
    hasLicense: true,
    hasContributing: true,
    hasCodeOfConduct: true,
    hasSecurity: true,
    hasIssueTemplate: true,
    hasPrTemplate: true,
    workflowCount: 2,
    releaseCount: 3,
    ...overrides,
  };
}

describe("parseRepoSlug", () => {
  test("accepts owner/repo", () => {
    expect(parseRepoSlug("facebook/react")).toBe("facebook/react");
  });

  test("accepts a full https URL", () => {
    expect(parseRepoSlug("https://github.com/vercel/next.js")).toBe("vercel/next.js");
  });

  test("accepts an ssh-style git URL", () => {
    expect(parseRepoSlug("git@github.com:owner/repo")).toBe("owner/repo");
  });

  test("strips a trailing .git", () => {
    expect(parseRepoSlug("https://github.com/user/repo.git")).toBe("user/repo");
  });

  test("trims surrounding whitespace", () => {
    expect(parseRepoSlug("  owner/repo  ")).toBe("owner/repo");
  });

  test("rejects nonsense", () => {
    expect(parseRepoSlug("not a repo")).toBeNull();
    expect(parseRepoSlug("")).toBeNull();
    expect(parseRepoSlug("just-an-owner")).toBeNull();
  });
});

describe("scoreRepo", () => {
  test("a fully documented repo scores 100 and grade A", () => {
    const { score, maxScore, grade } = scoreRepo(facts());
    expect(maxScore).toBe(100);
    expect(score).toBe(100);
    expect(grade).toBe("A");
  });

  test("a bare repo scores low and grade F", () => {
    const { score, grade } = scoreRepo(
      facts({
        hasDescription: false,
        readme: { present: false, length: 0, headingCount: 0, hasBadge: false, hasCodeBlock: false },
        hasLicense: false,
        hasContributing: false,
        hasCodeOfConduct: false,
        hasSecurity: false,
        hasIssueTemplate: false,
        hasPrTemplate: false,
        workflowCount: 0,
        releaseCount: 0,
      }),
    );
    expect(score).toBe(0);
    expect(grade).toBe("F");
  });

  test("a thin README earns partial quality points and an action", () => {
    // Long enough for the length points but missing headings, badges and code.
    const { checklist } = scoreRepo(
      facts({ readme: { present: true, length: 400, headingCount: 1, hasBadge: false, hasCodeBlock: false } }),
    );
    const quality = checklist.find((c) => c.id === "readme-quality");
    expect(quality?.status).toBe("partial");
    expect(quality?.earned).toBeGreaterThan(0);
    expect(quality?.earned).toBeLessThan(12);
    expect(quality?.action).toBeTruthy();
  });

  test("a present but empty README fails quality with a zero score", () => {
    const { checklist } = scoreRepo(
      facts({ readme: { present: true, length: 10, headingCount: 0, hasBadge: false, hasCodeBlock: false } }),
    );
    const quality = checklist.find((c) => c.id === "readme-quality");
    expect(quality?.earned).toBe(0);
    expect(quality?.status).toBe("fail");
  });

  test("missing README fails the quality check with guidance", () => {
    const { checklist } = scoreRepo(
      facts({ readme: { present: false, length: 0, headingCount: 0, hasBadge: false, hasCodeBlock: false } }),
    );
    const quality = checklist.find((c) => c.id === "readme-quality");
    expect(quality?.status).toBe("fail");
    expect(quality?.action).toMatch(/README/i);
  });

  test("grade boundaries map percent to letters", () => {
    // Full = 100 => A.
    expect(scoreRepo(facts()).grade).toBe("A");
    // Remove 12 (license) + 8 (coc) + 8 (security) => 72 => B.
    expect(
      scoreRepo(facts({ hasLicense: false, hasCodeOfConduct: false, hasSecurity: false })).grade,
    ).toBe("B");
    // Remove 10 (ci) + 12 (contributing) + 8 (coc) + 8 (security) => 62 => C.
    expect(
      scoreRepo(
        facts({
          workflowCount: 0,
          hasContributing: false,
          hasCodeOfConduct: false,
          hasSecurity: false,
        }),
      ).grade,
    ).toBe("C");
    // Remove 15 (readme) + 12 (quality) + 12 (license) + 12 (contributing) => 49 => D.
    expect(
      scoreRepo(
        facts({
          readme: { present: false, length: 0, headingCount: 0, hasBadge: false, hasCodeBlock: false },
          hasLicense: false,
          hasContributing: false,
        }),
      ).grade,
    ).toBe("D");
  });

  test("workflow count of one is described in the singular", () => {
    const { checklist } = scoreRepo(facts({ workflowCount: 1 }));
    const ci = checklist.find((c) => c.id === "ci");
    expect(ci?.detail).toContain("1 workflow ");
    expect(ci?.detail).not.toContain("workflows");
  });

  test("every failing item ships an actionable next step", () => {
    const { checklist } = scoreRepo(facts({ hasLicense: false, hasSecurity: false }));
    for (const item of checklist) {
      if (item.status === "fail") expect(item.action).toBeTruthy();
    }
  });

  test("passing items never carry a leftover action", () => {
    const { checklist } = scoreRepo(facts());
    for (const item of checklist) {
      if (item.status === "pass") expect(item.action).toBeUndefined();
    }
  });

  test("checklist points always sum to the max score", () => {
    const { checklist, maxScore } = scoreRepo(facts());
    const sum = checklist.reduce((a, c) => a + c.points, 0);
    expect(sum).toBe(maxScore);
  });
});

/* --------------------------- analyzeRepo (network) --------------------------- */

interface FakeResponseInit {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}

function fakeResponse({ status = 200, body = null, headers = {} }: FakeResponseInit) {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v;
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (key: string) => lower[key.toLowerCase()] ?? null },
    json: async () => body,
  };
}

function base64(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64");
}

const RICH_README = [
  "# Project",
  "[![build](https://img.shields.io/badge/build-passing-green)](https://example.com)",
  "## Install",
  "```bash",
  "npm install project",
  "```",
  "## Usage",
  "Some more prose to comfortably clear the three-hundred character length bar so ",
  "the README length check passes. Padding padding padding padding padding padding ",
  "padding padding padding padding padding padding padding padding padding padding.",
].join("\n");

/** Route GitHub API paths to canned responses for a healthy repo. */
function healthyRouter(url: string) {
  if (url.endsWith("/languages")) {
    return fakeResponse({ body: { TypeScript: 8000, CSS: 2000 } });
  }
  if (url.endsWith("/readme")) {
    return fakeResponse({ body: { content: base64(RICH_README) } });
  }
  if (url.includes("/contents/.github/workflows")) {
    return fakeResponse({ body: [{ name: "ci.yml", type: "file" }, { name: "notes.txt", type: "file" }] });
  }
  if (url.includes("/contents/.github")) {
    return fakeResponse({
      body: [
        { name: "CODE_OF_CONDUCT.md", type: "file" },
        { name: "SECURITY.md", type: "file" },
        { name: "pull_request_template.md", type: "file" },
        { name: "ISSUE_TEMPLATE", type: "dir" },
      ],
    });
  }
  if (url.endsWith("/contents")) {
    return fakeResponse({ body: [{ name: "LICENSE", type: "file" }, { name: "CONTRIBUTING.md", type: "file" }] });
  }
  if (url.includes("/releases")) {
    return fakeResponse({ body: [{ tag_name: "v1.0.0" }] });
  }
  // repo metadata
  return fakeResponse({
    body: {
      full_name: "owner/repo",
      description: "A tidy repository",
      homepage: "https://example.com",
      license: { name: "MIT License" },
      default_branch: "main",
      stargazers_count: 42,
      forks_count: 7,
      open_issues_count: 3,
      topics: ["git", "cli"],
      pushed_at: "2026-01-01T00:00:00Z",
      archived: false,
    },
  });
}

describe("analyzeRepo", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("rejects an unparseable slug before any network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const outcome = await analyzeRepo("nonsense");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.kind).toBe("invalid");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("scores a well-documented public repo as an A", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => healthyRouter(url)));
    const outcome = await analyzeRepo("owner/repo");
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.slug).toBe("owner/repo");
    expect(outcome.result.meta.license).toBe("MIT License");
    expect(outcome.result.grade).toBe("A");
    expect(outcome.result.score).toBe(100);
    expect(outcome.result.checklist.find((c) => c.id === "readme-quality")?.status).toBe("pass");
  });

  test("computes language shares sorted by bytes with rounded percents", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => healthyRouter(url)));
    const outcome = await analyzeRepo("owner/repo");
    if (!outcome.ok) throw new Error("expected success");
    expect(outcome.result.languages[0]).toMatchObject({ name: "TypeScript", percent: 80 });
    expect(outcome.result.languages[1]).toMatchObject({ name: "CSS", percent: 20 });
  });

  test("reports a rate limit honestly with a retry time", async () => {
    const reset = Math.floor(Date.now() / 1000) + 600;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        fakeResponse({
          status: 403,
          headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(reset) },
        }),
      ),
    );
    const outcome = await analyzeRepo("owner/repo");
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.kind).toBe("rate-limited");
    expect(outcome.retryAt).toBe(reset * 1000);
  });

  test("maps a 404 to a not-found outcome", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => fakeResponse({ status: 404 })));
    const outcome = await analyzeRepo("owner/missing");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.kind).toBe("not-found");
  });

  test("maps an unexpected server status to a network outcome", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => fakeResponse({ status: 500 })));
    const outcome = await analyzeRepo("owner/repo");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.kind).toBe("network");
  });

  test("treats a thrown fetch as a network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    const outcome = await analyzeRepo("owner/repo");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.kind).toBe("network");
  });

  test("marks a repo with no docs as failing most checks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/languages")) return fakeResponse({ body: {} });
        if (url.endsWith("/readme")) return fakeResponse({ status: 404 });
        if (url.includes("/contents")) return fakeResponse({ body: [] });
        if (url.includes("/releases")) return fakeResponse({ body: [] });
        return fakeResponse({
          body: { full_name: "owner/bare", default_branch: "main", description: null, license: null },
        });
      }),
    );
    const outcome = await analyzeRepo("owner/bare");
    if (!outcome.ok) throw new Error("expected success");
    expect(outcome.result.checklist.find((c) => c.id === "readme-present")?.status).toBe("fail");
    expect(outcome.result.checklist.find((c) => c.id === "license")?.status).toBe("fail");
    expect(outcome.result.grade).toBe("F");
    expect(outcome.result.languages).toEqual([]);
  });
});
