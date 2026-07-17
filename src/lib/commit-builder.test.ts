import { describe, expect, test } from "vitest";
import {
  buildCommitMessage,
  EMPTY_COMMIT,
  isCommitValid,
  validateCommit,
  type CommitInput,
} from "./commit-builder";

function make(overrides: Partial<CommitInput>): CommitInput {
  return { ...EMPTY_COMMIT, ...overrides };
}

describe("buildCommitMessage", () => {
  test("builds a simple type + description header", () => {
    const msg = buildCommitMessage(make({ type: "feat", description: "add login form" }));
    expect(msg).toBe("feat: add login form");
  });

  test("includes a scope in parentheses", () => {
    const msg = buildCommitMessage(make({ type: "fix", scope: "auth", description: "reject empty passwords" }));
    expect(msg).toBe("fix(auth): reject empty passwords");
  });

  test("appends a body separated by a blank line", () => {
    const msg = buildCommitMessage(make({ description: "add cache", body: "Speeds up repeat requests." }));
    expect(msg).toBe("feat: add cache\n\nSpeeds up repeat requests.");
  });

  test("marks breaking changes with ! and a footer", () => {
    const msg = buildCommitMessage(
      make({ type: "feat", description: "drop node 16", isBreaking: true, breakingDescription: "Node 18+ is required" }),
    );
    expect(msg).toBe("feat!: drop node 16\n\nBREAKING CHANGE: Node 18+ is required");
  });

  test("breaking footer falls back to the description when unset", () => {
    const msg = buildCommitMessage(make({ description: "change api", isBreaking: true }));
    expect(msg).toContain("BREAKING CHANGE: change api");
  });
});

describe("validateCommit", () => {
  test("requires a description", () => {
    const hints = validateCommit(make({ description: "" }));
    expect(hints.some((h) => h.level === "error")).toBe(true);
  });

  test("flags non-imperative mood with a suggestion", () => {
    const hints = validateCommit(make({ description: "added login form" }));
    expect(hints.some((h) => h.message.includes("add"))).toBe(true);
  });

  test("warns on a trailing period", () => {
    const hints = validateCommit(make({ description: "add login form." }));
    expect(hints.some((h) => h.message.toLowerCase().includes("period"))).toBe(true);
  });

  test("warns when the header exceeds the soft limit", () => {
    const hints = validateCommit(make({ description: "x".repeat(90) }));
    expect(hints.some((h) => h.message.includes("characters"))).toBe(true);
  });

  test("rejects an unknown type", () => {
    const hints = validateCommit(make({ type: "wip", description: "do stuff" }));
    expect(hints.some((h) => h.level === "error")).toBe(true);
  });

  test("a clean imperative message is valid", () => {
    expect(isCommitValid(make({ type: "fix", scope: "api", description: "handle 429 responses" }))).toBe(true);
  });
});
