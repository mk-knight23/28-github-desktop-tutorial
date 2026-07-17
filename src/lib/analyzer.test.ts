import { describe, expect, test } from "vitest";
import { parseRepoSlug, scoreRepo, type RepoFacts } from "./analyzer";

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

  test("strips a trailing .git", () => {
    expect(parseRepoSlug("https://github.com/user/repo.git")).toBe("user/repo");
  });

  test("rejects nonsense", () => {
    expect(parseRepoSlug("not a repo")).toBeNull();
    expect(parseRepoSlug("")).toBeNull();
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

  test("every failing item ships an actionable next step", () => {
    const { checklist } = scoreRepo(facts({ hasLicense: false, hasSecurity: false }));
    for (const item of checklist) {
      if (item.status === "fail") expect(item.action).toBeTruthy();
    }
  });

  test("checklist points always sum to the max score", () => {
    const { checklist, maxScore } = scoreRepo(facts());
    const sum = checklist.reduce((a, c) => a + c.points, 0);
    expect(sum).toBe(maxScore);
  });
});
