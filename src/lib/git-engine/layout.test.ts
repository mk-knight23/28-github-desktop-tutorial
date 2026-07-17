import { describe, expect, it } from "vitest";
import { computeLayout } from "./layout";
import { branch, checkout, checkoutNewBranch, commit, initialState, merge, rebase } from "./engine";
import { makeSha } from "./sha";
import { type GitState } from "./types";

function commits(state: GitState, ...messages: string[]): GitState {
  return messages.reduce((s, m) => commit(s, m).state, state);
}

describe("computeLayout", () => {
  it("assigns increasing generations along a linear history", () => {
    const s = commits(initialState(), "a", "b", "c");
    const layout = computeLayout(s);
    const byMessage = new Map(layout.nodes.map((n) => [n.commit.message, n]));
    expect(byMessage.get("a")!.generation).toBe(0);
    expect(byMessage.get("b")!.generation).toBe(1);
    expect(byMessage.get("c")!.generation).toBe(2);
    // Linear history stays on one lane.
    expect(new Set(layout.nodes.map((n) => n.lane)).size).toBe(1);
  });

  it("gives main lane 0 and a feature branch its own lane", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "main-1");
    s = checkout(s, "feature").state;
    s = commits(s, "feat-1");
    const layout = computeLayout(s);
    const mainLabel = layout.branchLabels.find((b) => b.name === "main")!;
    const featLabel = layout.branchLabels.find((b) => b.name === "feature")!;
    expect(mainLabel.lane).toBe(0);
    expect(featLabel.lane).toBeGreaterThan(0);
  });

  it("marks the HEAD node and produces a merge edge with two parents", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "main-1");
    s = checkout(s, "feature").state;
    s = commits(s, "feat-1");
    s = checkout(s, "main").state;
    s = merge(s, "feature").state;
    const layout = computeLayout(s);
    const headNode = layout.nodes.find((n) => n.isHead);
    expect(headNode).toBeTruthy();
    expect(headNode!.commit.parents).toHaveLength(2);
    const mergeEdges = layout.edges.filter((e) => e.isMerge);
    expect(mergeEdges).toHaveLength(1);
  });

  it("reports detached HEAD in the layout head descriptor", () => {
    let s = commits(initialState(), "a", "b");
    const tip = s.branches.main as string;
    s = checkout(s, tip).state;
    const layout = computeLayout(s);
    expect(layout.head.type).toBe("detached");
  });

  it("handles the empty repo without throwing", () => {
    const layout = computeLayout(initialState());
    expect(layout.nodes).toHaveLength(0);
    expect(layout.branchLabels).toHaveLength(0);
  });

  it("places rebase-abandoned commits on their own trailing lanes", () => {
    let s = commits(initialState(), "a");
    s = branch(s, "feature").state;
    s = commits(s, "main-1");
    s = checkout(s, "feature").state;
    s = commits(s, "feat-1");
    const rebased = rebase(s, "main").state;
    const layout = computeLayout(rebased);
    const abandonedNodes = layout.nodes.filter((n) => n.abandoned);
    expect(abandonedNodes.length).toBeGreaterThan(0);
    // Abandoned commits do not collide with a live lane at the same generation.
    for (const node of abandonedNodes) {
      const clash = layout.nodes.find(
        (o) => !o.abandoned && o.generation === node.generation && o.lane === node.lane,
      );
      expect(clash).toBeUndefined();
    }
  });

  it("orders three branch lanes with main first and skips unborn branches", () => {
    let s = commits(initialState(), "a");
    s = checkoutNewBranch(s, "feature").state;
    s = commits(s, "feat-1");
    s = checkout(s, "main").state;
    s = checkoutNewBranch(s, "hotfix").state;
    s = commits(s, "hot-1");
    // Inject an unborn branch to exercise the null-tip guards.
    const withUnborn: GitState = { ...s, branches: { ...s.branches, staging: null } };
    const layout = computeLayout(withUnborn);
    expect(layout.branchLabels.find((b) => b.name === "main")!.lane).toBe(0);
    // Unborn branch produces no label and no node.
    expect(layout.branchLabels.find((b) => b.name === "staging")).toBeUndefined();
    // Lanes are strictly ordered.
    const lanes = layout.branchLabels.map((b) => b.lane);
    expect(lanes).toEqual([...lanes].sort((a, b) => a - b));
  });

  it("gives checkout -b feature the same tip as main initially", () => {
    let s = commits(initialState(), "a");
    s = checkoutNewBranch(s, "feature").state;
    const layout = computeLayout(s);
    const tipNode = layout.nodes.find((n) => n.tips.includes("feature"))!;
    expect(tipNode.tips).toContain("main");
    expect(tipNode.tips).toContain("feature");
  });
});

describe("makeSha", () => {
  it("is deterministic and 7 chars", () => {
    const a = makeSha(1, "init", []);
    const b = makeSha(1, "init", []);
    expect(a).toBe(b);
    expect(a).toHaveLength(7);
  });

  it("varies with seq, message and parents", () => {
    expect(makeSha(1, "x", [])).not.toBe(makeSha(2, "x", []));
    expect(makeSha(1, "x", [])).not.toBe(makeSha(1, "y", []));
    expect(makeSha(1, "x", [])).not.toBe(makeSha(1, "x", ["abc1234"]));
  });
});
