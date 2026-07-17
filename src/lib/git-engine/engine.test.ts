import { describe, expect, it } from "vitest";
import {
  ancestors,
  branch,
  checkout,
  checkoutNewBranch,
  commit,
  currentBranch,
  currentCommitId,
  DEFAULT_BRANCH,
  initialState,
  isAncestor,
  isValidBranchName,
  merge,
  rebase,
  reset,
  resolveRef,
} from "./engine";
import { GitEngineError, type GitState } from "./types";

/** Helper: apply a linear series of commits, returning the final state. */
function commits(state: GitState, ...messages: string[]): GitState {
  return messages.reduce((s, m) => commit(s, m).state, state);
}

describe("initialState", () => {
  it("starts with an unborn main branch and HEAD attached to it", () => {
    const s = initialState();
    expect(s.branches).toEqual({ [DEFAULT_BRANCH]: null });
    expect(s.head).toEqual({ type: "branch", name: DEFAULT_BRANCH });
    expect(currentCommitId(s)).toBeNull();
    expect(currentBranch(s)).toBe("main");
    expect(Object.keys(s.commits)).toHaveLength(0);
  });
});

describe("commit", () => {
  it("creates the first commit as a root (no parents)", () => {
    const { state } = commit(initialState(), "init");
    const id = state.branches.main as string;
    expect(id).toBeTruthy();
    expect(state.commits[id].parents).toEqual([]);
    expect(state.commits[id].message).toBe("init");
    expect(currentCommitId(state)).toBe(id);
  });

  it("links subsequent commits to the previous tip", () => {
    const s = commits(initialState(), "a", "b");
    const tip = s.branches.main as string;
    const parent = s.commits[tip].parents[0];
    expect(s.commits[parent].message).toBe("a");
    expect(s.commits[tip].message).toBe("b");
  });

  it("rejects an empty message", () => {
    expect(() => commit(initialState(), "   ")).toThrow(GitEngineError);
  });

  it("does not mutate the input state (immutability)", () => {
    const before = initialState();
    const snapshot = JSON.stringify(before);
    commit(before, "x");
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it("advances a detached HEAD without moving any branch", () => {
    const s = commits(initialState(), "a", "b");
    const first = s.commits[(s.branches.main as string)].parents[0];
    const detached = checkout(s, first).state;
    const after = commit(detached, "c").state;
    expect(after.head.type).toBe("detached");
    expect(after.branches.main).toBe(s.branches.main); // main unchanged
  });
});

describe("branch", () => {
  it("creates a branch at the current tip without switching", () => {
    const s = commits(initialState(), "a");
    const { state } = branch(s, "feature");
    expect(state.branches.feature).toBe(state.branches.main);
    expect(currentBranch(state)).toBe("main");
  });

  it("rejects duplicate branch names", () => {
    const s = branch(commits(initialState(), "a"), "feature").state;
    expect(() => branch(s, "feature")).toThrow(/already exists/);
  });

  it("rejects invalid names", () => {
    const s = commits(initialState(), "a");
    expect(() => branch(s, "bad name")).toThrow(GitEngineError);
    expect(() => branch(s, "-x")).toThrow(GitEngineError);
  });

  it("refuses to branch before the first commit", () => {
    expect(() => branch(initialState(), "feature")).toThrow(/before the first commit/);
  });
});

describe("isValidBranchName", () => {
  it.each([
    ["main", true],
    ["feature/login", true],
    ["release-1.2", true],
    ["with space", false],
    ["end.", false],
    ["a..b", false],
    ["-leading", false],
    ["ha~sh", false],
    ["", false],
  ])("%s -> %s", (name, expected) => {
    expect(isValidBranchName(name)).toBe(expected);
  });
});

describe("checkout", () => {
  it("switches to an existing branch", () => {
    const s = branch(commits(initialState(), "a"), "feature").state;
    const { state } = checkout(s, "feature");
    expect(currentBranch(state)).toBe("feature");
  });

  it("detaches HEAD when checking out a commit id", () => {
    const s = commits(initialState(), "a", "b");
    const first = s.commits[(s.branches.main as string)].parents[0];
    const { state, risk } = checkout(s, first);
    expect(state.head).toEqual({ type: "detached", commitId: first });
    expect(risk).toBe("caution");
  });

  it("suggests the closest branch on a typo", () => {
    const s = branch(commits(initialState(), "a"), "feature").state;
    try {
      checkout(s, "featuer");
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GitEngineError);
      expect((err as GitEngineError).suggestion).toContain("feature");
    }
  });

  it("checkout -b creates and switches", () => {
    const s = commits(initialState(), "a");
    const { state } = checkoutNewBranch(s, "feature");
    expect(currentBranch(state)).toBe("feature");
    expect(state.branches.feature).toBe(state.branches.main);
  });

  it("falls back to a create hint when nothing is close", () => {
    const s = commits(initialState(), "a");
    try {
      checkout(s, "zzzzzzzzzz");
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as GitEngineError).suggestion).toContain("branch zzzzzzzzzz");
    }
  });
});

describe("merge", () => {
  it("fast-forwards when the current branch is behind", () => {
    let s = commits(initialState(), "a");
    s = checkoutNewBranch(s, "feature").state;
    s = commits(s, "b", "c");
    s = checkout(s, "main").state;
    const { state, message } = merge(s, "feature");
    expect(state.branches.main).toBe(state.branches.feature);
    expect(message).toContain("Fast-forwarded");
  });

  it("creates a merge commit with two parents when histories diverge", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "main-1"); // advance main
    s = checkout(s, "feature").state;
    s = commits(s, "feat-1"); // advance feature
    s = checkout(s, "main").state;
    const mainTip = s.branches.main as string;
    const featTip = s.branches.feature as string;
    const { state } = merge(s, "feature");
    const newTip = state.branches.main as string;
    expect(state.commits[newTip].parents).toEqual([mainTip, featTip]);
  });

  it("reports already-up-to-date when nothing to merge", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "b"); // main ahead of feature
    const { message, state } = merge(s, "feature");
    expect(message).toContain("Already up to date");
    expect(state).toBe(s); // unchanged
  });

  it("errors on self-merge, missing branch, and detached HEAD", () => {
    let s = commits(initialState(), "a");
    expect(() => merge(s, "main")).toThrow(/into itself/);
    expect(() => merge(s, "ghost")).toThrow(/does not exist/);
    const first = s.branches.main as string;
    s = checkout(s, first).state;
    expect(() => merge(s, "main")).toThrow(/detached/);
  });
});

describe("rebase", () => {
  it("replays commits with new ids and abandons the originals", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "main-1"); // advance main
    s = checkout(s, "feature").state;
    s = commits(s, "feat-1", "feat-2");
    const oldFeatTip = s.branches.feature as string;
    const { state } = rebase(s, "main");
    const newTip = state.branches.feature as string;
    expect(newTip).not.toBe(oldFeatTip);
    // New feature tip's history should include main's tip.
    expect(isAncestor(state, state.branches.main as string, newTip)).toBe(true);
    // The old commits are now abandoned.
    expect(state.abandoned).toContain(oldFeatTip);
  });

  it("fast-forwards when the branch is strictly behind onto", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "b"); // advance main only
    s = checkout(s, "feature").state;
    const { state, message } = rebase(s, "main");
    expect(state.branches.feature).toBe(state.branches.main);
    expect(message).toContain("Fast-forwarded");
  });

  it("is a no-op when already based on onto", () => {
    let s = commits(initialState(), "a", "b");
    s = branch(s, "feature").state;
    s = checkout(s, "feature").state;
    s = commits(s, "c");
    const { message } = rebase(s, "main");
    expect(message).toContain("already based");
  });

  it("errors on detached HEAD and missing onto", () => {
    let s = commits(initialState(), "a");
    expect(() => rebase(s, "ghost")).toThrow(/does not exist/);
    const first = s.branches.main as string;
    s = checkout(s, first).state;
    expect(() => rebase(s, "main")).toThrow(/detached/);
  });
});

describe("reset", () => {
  it("moves the branch pointer and marks commits abandoned on --hard", () => {
    const s = commits(initialState(), "a", "b", "c");
    const { state, risk, message } = reset(s, "hard", "HEAD~2");
    const firstId = state.branches.main as string;
    expect(state.commits[firstId].message).toBe("a");
    expect(state.abandoned).toHaveLength(2); // b and c unreachable
    expect(risk).toBe("destructive");
    expect(message).toContain("reset --hard");
  });

  it("keeps risk at caution for --soft and --mixed with distinct messages", () => {
    const s = commits(initialState(), "a", "b");
    const soft = reset(s, "soft", "HEAD~1");
    const mixed = reset(s, "mixed", "HEAD~1");
    expect(soft.risk).toBe("caution");
    expect(soft.message).toContain("kept changes staged");
    expect(mixed.risk).toBe("caution");
    expect(mixed.message).toContain("working tree");
  });

  it("errors when detached or ref cannot resolve", () => {
    const s = commits(initialState(), "a", "b");
    expect(() => reset(s, "hard", "nope")).toThrow(/Cannot resolve/);
    const detached = checkout(s, s.branches.main as string).state;
    expect(() => reset(detached, "hard", "HEAD~1")).toThrow(/detached/);
  });
});

describe("resolveRef", () => {
  it("resolves HEAD, branches, ids, prefixes and ~n", () => {
    const s = commits(initialState(), "a", "b", "c");
    const tip = s.branches.main as string;
    expect(resolveRef(s, "HEAD")).toBe(tip);
    expect(resolveRef(s, "main")).toBe(tip);
    expect(resolveRef(s, tip)).toBe(tip);
    expect(resolveRef(s, tip.slice(0, 4))).toBe(tip);
    const grandparent = s.commits[s.commits[tip].parents[0]].parents[0];
    expect(resolveRef(s, "HEAD~2")).toBe(grandparent);
    expect(resolveRef(s, "main~1")).toBe(s.commits[tip].parents[0]);
  });

  it("returns null for unresolvable or too-deep refs", () => {
    const s = commits(initialState(), "a");
    expect(resolveRef(s, "ghost")).toBeNull();
    expect(resolveRef(s, "")).toBeNull();
    expect(resolveRef(s, "HEAD~5")).toBeNull();
  });
});

describe("ancestors / isAncestor", () => {
  it("includes the commit itself and all parents", () => {
    const s = commits(initialState(), "a", "b");
    const tip = s.branches.main as string;
    const set = ancestors(s, tip);
    expect(set.has(tip)).toBe(true);
    expect(set.size).toBe(2);
    const parent = s.commits[tip].parents[0];
    expect(isAncestor(s, parent, tip)).toBe(true);
    expect(isAncestor(s, tip, parent)).toBe(false);
  });
});
