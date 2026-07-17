import { describe, expect, it } from "vitest";
import { parseCommand, tokenize } from "./parse";
import { applyCommand, isDestructiveOperation } from "./apply";
import { commit, initialState } from "./engine";
import { GitEngineError } from "./types";

describe("tokenize", () => {
  it("splits on whitespace and honors quotes", () => {
    expect(tokenize('commit -m "add login form"')).toEqual(["commit", "-m", "add login form"]);
    expect(tokenize("commit -m 'single quoted'")).toEqual(["commit", "-m", "single quoted"]);
  });
});

describe("parseCommand", () => {
  it("accepts commands with and without a leading git", () => {
    expect(parseCommand('git commit -m "x"')).toEqual({ kind: "commit", message: "x" });
    expect(parseCommand('commit -m "x"')).toEqual({ kind: "commit", message: "x" });
  });

  it("parses commit forms", () => {
    expect(parseCommand('commit "msg"')).toEqual({ kind: "commit", message: "msg" });
    expect(parseCommand('commit --message "msg"')).toEqual({ kind: "commit", message: "msg" });
  });

  it("parses branch and checkout, including -b and switch", () => {
    expect(parseCommand("branch feature")).toEqual({ kind: "branch", name: "feature" });
    expect(parseCommand("checkout main")).toEqual({ kind: "checkout", ref: "main" });
    expect(parseCommand("checkout -b feature")).toEqual({ kind: "checkout-b", name: "feature" });
    expect(parseCommand("switch main")).toEqual({ kind: "checkout", ref: "main" });
    expect(parseCommand("switch -c feature")).toEqual({ kind: "checkout-b", name: "feature" });
  });

  it("parses merge and rebase", () => {
    expect(parseCommand("merge feature")).toEqual({ kind: "merge", branch: "feature" });
    expect(parseCommand("rebase main")).toEqual({ kind: "rebase", branch: "main" });
  });

  it("parses reset modes and defaults", () => {
    expect(parseCommand("reset --hard HEAD~1")).toEqual({ kind: "reset", mode: "hard", ref: "HEAD~1" });
    expect(parseCommand("reset --soft main")).toEqual({ kind: "reset", mode: "soft", ref: "main" });
    expect(parseCommand("reset HEAD~2")).toEqual({ kind: "reset", mode: "mixed", ref: "HEAD~2" });
    expect(parseCommand("reset")).toEqual({ kind: "reset", mode: "mixed", ref: "HEAD~1" });
  });

  it("throws helpful errors on bad input", () => {
    expect(() => parseCommand("")).toThrow(GitEngineError);
    expect(() => parseCommand("git")).toThrow(GitEngineError);
    expect(() => parseCommand("frobnicate")).toThrow(/not a command/i);
    expect(() => parseCommand("commit")).toThrow(/needs a message/);
    expect(() => parseCommand("branch")).toThrow(/needs a name/);
    expect(() => parseCommand("checkout")).toThrow(/needs a branch/);
    expect(() => parseCommand("checkout -b")).toThrow(/needs a branch name/);
    expect(() => parseCommand("merge")).toThrow(/needs a branch/);
    expect(() => parseCommand("reset --wat")).toThrow(/Unknown reset flag/);
    expect(() => parseCommand("switch")).toThrow(/needs a branch/);
    expect(() => parseCommand("switch -c")).toThrow(/needs a branch name/);
    expect(() => parseCommand("rebase")).toThrow(/needs a branch/);
  });

  it("tokenizes empty quoted strings", () => {
    expect(tokenize('commit -m ""')).toEqual(["commit", "-m", ""]);
  });
});

describe("applyCommand", () => {
  it("parses and applies end to end", () => {
    const { state } = applyCommand(initialState(), 'commit -m "first"');
    expect(Object.keys(state.commits)).toHaveLength(1);
  });
});

describe("isDestructiveOperation", () => {
  it("flags only reset --hard", () => {
    expect(isDestructiveOperation({ kind: "reset", mode: "hard", ref: "HEAD~1" })).toBe(true);
    expect(isDestructiveOperation({ kind: "reset", mode: "soft", ref: "HEAD~1" })).toBe(false);
    expect(isDestructiveOperation({ kind: "commit", message: "x" })).toBe(false);
  });

  it("keeps commit non-destructive after a real commit", () => {
    const s = commit(initialState(), "a").state;
    expect(isDestructiveOperation({ kind: "commit", message: "b" })).toBe(false);
    expect(s.seq).toBe(2);
  });
});
