import { describe, expect, it } from "vitest";
import {
  commitFromDiffFallback,
  hasFallback,
  nlToCommandFallback,
  parseDiffPaths,
  prDescriptionFallback,
  releaseNotesFallback,
  runFallback,
} from "@/lib/ai/fallbacks";

describe("hasFallback", () => {
  it("reports deterministic capabilities", () => {
    expect(hasFallback("nl-to-command")).toBe(true);
    expect(hasFallback("commit-from-diff")).toBe(true);
    expect(hasFallback("pr-description")).toBe(true);
    expect(hasFallback("release-notes")).toBe(true);
  });

  it("reports AI-only capabilities as having no fallback", () => {
    expect(hasFallback("explain-error")).toBe(false);
    expect(hasFallback("explain-conflict")).toBe(false);
    expect(hasFallback("rebase-plan")).toBe(false);
    expect(hasFallback("branch-strategy")).toBe(false);
    expect(hasFallback("explain-ci-error")).toBe(false);
  });
});

describe("nlToCommandFallback", () => {
  it("matches a request to a reference command with its real risk level", () => {
    const result = nlToCommandFallback({ text: "delete a local branch I no longer need" });
    expect(result.command).toContain("git branch");
    expect(["safe", "caution", "destructive"]).toContain(result.riskLevel);
    expect(result.undoGuidance.length).toBeGreaterThan(0);
  });

  it("carries the destructive warning through for a destructive match", () => {
    const result = nlToCommandFallback({ text: "hard reset and throw away my changes" });
    expect(result.riskLevel).toBe("destructive");
    expect(result.destructiveWarning).not.toBeNull();
  });

  it("falls back to a safe default when nothing matches", () => {
    const result = nlToCommandFallback({ text: "zzzz qqqq wwww" });
    expect(result.command).toBe("git status");
    expect(result.riskLevel).toBe("safe");
    expect(result.destructiveWarning).toBeNull();
  });
});

describe("parseDiffPaths", () => {
  it("extracts b-side paths from a git diff header", () => {
    const diff = [
      "diff --git a/src/app/page.tsx b/src/app/page.tsx",
      "index 111..222 100644",
      "--- a/src/app/page.tsx",
      "+++ b/src/app/page.tsx",
      "@@ -1 +1 @@",
      "-old",
      "+new",
    ].join("\n");
    expect(parseDiffPaths(diff)).toEqual(["src/app/page.tsx"]);
  });
});

describe("commitFromDiffFallback", () => {
  it("classifies a docs-only diff as docs", () => {
    const diff = [
      "diff --git a/README.md b/README.md",
      "--- a/README.md",
      "+++ b/README.md",
      "@@ -1 +1 @@",
      "-old",
      "+new",
    ].join("\n");
    const result = commitFromDiffFallback({ diff });
    expect(result.type).toBe("docs");
    expect(result.message.startsWith("docs")).toBe(true);
  });

  it("classifies a new source file as feat", () => {
    const diff = [
      "diff --git a/src/lib/new.ts b/src/lib/new.ts",
      "new file mode 100644",
      "--- /dev/null",
      "+++ b/src/lib/new.ts",
      "@@ -0,0 +1 @@",
      "+export const x = 1;",
    ].join("\n");
    const result = commitFromDiffFallback({ diff });
    expect(result.type).toBe("feat");
    expect(result.scope).toBe("lib");
  });

  it("classifies workflow changes as ci", () => {
    const diff = [
      "diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml",
      "--- a/.github/workflows/ci.yml",
      "+++ b/.github/workflows/ci.yml",
      "@@ -1 +1 @@",
      "-old",
      "+new",
    ].join("\n");
    expect(commitFromDiffFallback({ diff }).type).toBe("ci");
  });
});

describe("prDescriptionFallback", () => {
  it("uses the first commit as the title and lists all changes", () => {
    const result = prDescriptionFallback({
      commits: "feat: add login\n- fix: handle empty state\n- docs: update readme",
    });
    expect(result.title).toBe("feat: add login");
    expect(result.changes).toHaveLength(3);
    expect(result.checklist.length).toBeGreaterThan(0);
  });
});

describe("releaseNotesFallback", () => {
  it("groups conventional commits into sections and builds markdown", () => {
    const result = releaseNotesFallback({
      version: "v1.2.0",
      commits: "feat(ui): add dark mode\nfix: correct off-by-one\nchore: bump deps",
    });
    expect(result.version).toBe("v1.2.0");
    const titles = result.sections.map((section) => section.title);
    expect(titles).toContain("Features");
    expect(titles).toContain("Bug Fixes");
    expect(result.markdown).toContain("## v1.2.0");
    expect(result.markdown).toContain("### Features");
    expect(result.highlights.length).toBeGreaterThan(0);
  });

  it("puts non-conventional lines under Other", () => {
    const result = releaseNotesFallback({ commits: "just some freeform text" });
    expect(result.sections.some((section) => section.title === "Other")).toBe(true);
  });
});

describe("runFallback", () => {
  it("returns null for capabilities without a deterministic path", () => {
    expect(runFallback("explain-error", { errorText: "fatal: not a git repo" })).toBeNull();
    expect(runFallback("rebase-plan", { goal: "clean history" })).toBeNull();
  });

  it("dispatches to the matching fallback", () => {
    const result = runFallback("nl-to-command", { text: "create a new branch" });
    expect(result).not.toBeNull();
  });
});
