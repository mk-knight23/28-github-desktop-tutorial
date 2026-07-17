import { describe, expect, it } from "vitest";
import { applyOperation } from "./apply";
import { commit, initialState } from "./engine";
import { type GitState } from "./types";

function seed(): GitState {
  // main: a -> b, plus a feature branch off a.
  let s = commit(initialState(), "a").state;
  s = applyOperation(s, { kind: "branch", name: "feature" }).state;
  s = commit(s, "b").state;
  return s;
}

describe("applyOperation dispatch", () => {
  it("dispatches commit", () => {
    const { state } = applyOperation(initialState(), { kind: "commit", message: "x" });
    expect(Object.keys(state.commits)).toHaveLength(1);
  });

  it("dispatches branch", () => {
    const s = commit(initialState(), "a").state;
    const { state } = applyOperation(s, { kind: "branch", name: "dev" });
    expect(state.branches.dev).toBeTruthy();
  });

  it("dispatches checkout and checkout-b", () => {
    const s = seed();
    expect(applyOperation(s, { kind: "checkout", ref: "feature" }).state.head).toEqual({
      type: "branch",
      name: "feature",
    });
    const created = applyOperation(s, { kind: "checkout-b", name: "hotfix" }).state;
    expect(created.head).toEqual({ type: "branch", name: "hotfix" });
  });

  it("dispatches merge", () => {
    let s = seed();
    s = applyOperation(s, { kind: "checkout", ref: "feature" }).state;
    s = applyOperation(s, { kind: "commit", message: "feat" }).state;
    s = applyOperation(s, { kind: "checkout", ref: "main" }).state;
    const { state } = applyOperation(s, { kind: "merge", branch: "feature" });
    const tip = state.branches.main as string;
    expect(state.commits[tip].parents).toHaveLength(2);
  });

  it("dispatches rebase", () => {
    let s = seed();
    s = applyOperation(s, { kind: "checkout", ref: "feature" }).state;
    s = applyOperation(s, { kind: "commit", message: "feat" }).state;
    const { state } = applyOperation(s, { kind: "rebase", branch: "main" });
    expect(state.abandoned.length).toBeGreaterThan(0);
  });

  it("dispatches reset", () => {
    const s = seed();
    const { state } = applyOperation(s, { kind: "reset", mode: "hard", ref: "HEAD~1" });
    expect(state.commits[state.branches.main as string].message).toBe("a");
  });
});
