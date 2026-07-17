/**
 * Pure layout pass: turn a GitState into positioned nodes/edges for the SVG
 * renderer. Horizontal graph — generation increases left→right, each branch
 * gets a lane (row). No DOM, no colors (the renderer maps lane index → token).
 */

import { ancestors, currentBranch, currentCommitId, DEFAULT_BRANCH } from "./engine";
import { type Commit, type GitState } from "./types";

export const COL_WIDTH = 84;
export const LANE_HEIGHT = 64;
export const PADDING_X = 48;
export const PADDING_Y = 44;
export const NODE_RADIUS = 11;

export interface GraphNode {
  readonly id: string;
  readonly commit: Commit;
  readonly x: number;
  readonly y: number;
  readonly lane: number;
  readonly generation: number;
  /** Branch names whose tip is this commit. */
  readonly tips: readonly string[];
  readonly isHead: boolean;
  readonly abandoned: boolean;
}

export interface GraphEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** Lane color to paint the edge with (child's lane). */
  readonly lane: number;
  readonly isMerge: boolean;
  readonly abandoned: boolean;
}

export interface BranchLabel {
  readonly name: string;
  readonly commitId: string;
  readonly x: number;
  readonly y: number;
  readonly lane: number;
  readonly isCurrent: boolean;
}

export interface GraphLayout {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly branchLabels: readonly BranchLabel[];
  readonly laneCount: number;
  readonly width: number;
  readonly height: number;
  readonly head:
    | { readonly type: "branch"; readonly name: string; readonly commitId: string | null }
    | { readonly type: "detached"; readonly commitId: string };
}

/** Generation = longest path from a root; drives the x column. */
function computeGenerations(state: GitState): Map<string, number> {
  const gen = new Map<string, number>();
  const commits = Object.values(state.commits).sort((a, b) => a.seq - b.seq);
  // Seq order guarantees parents are computed before children.
  for (const c of commits) {
    if (c.parents.length === 0) {
      gen.set(c.id, 0);
    } else {
      const parentGen = Math.max(...c.parents.map((p) => gen.get(p) ?? 0));
      gen.set(c.id, parentGen + 1);
    }
  }
  return gen;
}

/**
 * Assign each commit to a lane. Branches are ordered main-first then by the
 * seq of their tip commit (stable). Each branch claims, via its first-parent
 * chain, any commit not already owned by an earlier branch.
 */
function computeLanes(state: GitState): Map<string, number> {
  const lane = new Map<string, number>();
  const branchNames = Object.keys(state.branches).sort((a, b) => {
    if (a === DEFAULT_BRANCH) return -1;
    if (b === DEFAULT_BRANCH) return 1;
    const at = state.branches[a];
    const bt = state.branches[b];
    const as = at ? (state.commits[at]?.seq ?? 0) : 0;
    const bs = bt ? (state.commits[bt]?.seq ?? 0) : 0;
    return as - bs;
  });

  let nextLane = 0;
  const laneOfBranch = new Map<string, number>();
  for (const name of branchNames) {
    laneOfBranch.set(name, nextLane);
    let cur: string | null = state.branches[name];
    while (cur !== null && !lane.has(cur)) {
      lane.set(cur, nextLane);
      const c: Commit | undefined = state.commits[cur];
      cur = c && c.parents.length > 0 ? c.parents[0] : null;
    }
    nextLane += 1;
  }

  // Abandoned commits get their own trailing lanes so they don't overlap.
  for (const id of state.abandoned) {
    if (!lane.has(id)) {
      lane.set(id, nextLane);
      nextLane += 1;
    }
  }
  return lane;
}

export function computeLayout(state: GitState): GraphLayout {
  const gen = computeGenerations(state);
  const lane = computeLanes(state);
  const abandonedSet = new Set(state.abandoned);
  const headId = currentCommitId(state);
  const curBranch = currentBranch(state);

  const tipsByCommit = new Map<string, string[]>();
  for (const [name, tip] of Object.entries(state.branches)) {
    if (tip) {
      const list = tipsByCommit.get(tip) ?? [];
      list.push(name);
      tipsByCommit.set(tip, list);
    }
  }

  const commits = Object.values(state.commits);
  let maxLane = 0;
  let maxGen = 0;

  const nodes: GraphNode[] = commits.map((c) => {
    const g = gen.get(c.id) ?? 0;
    const l = lane.get(c.id) ?? 0;
    maxLane = Math.max(maxLane, l);
    maxGen = Math.max(maxGen, g);
    return {
      id: c.id,
      commit: c,
      generation: g,
      lane: l,
      x: PADDING_X + g * COL_WIDTH,
      y: PADDING_Y + l * LANE_HEIGHT,
      tips: (tipsByCommit.get(c.id) ?? []).slice().sort(),
      isHead: headId === c.id,
      abandoned: abandonedSet.has(c.id),
    };
  });

  const nodeById = new Map(nodes.map((n) => [n.id, n] as const));

  const edges: GraphEdge[] = [];
  for (const c of commits) {
    c.parents.forEach((parentId, index) => {
      const child = nodeById.get(c.id);
      const parent = nodeById.get(parentId);
      if (!child || !parent) return;
      edges.push({
        id: `${parentId}->${c.id}`,
        fromId: parentId,
        toId: c.id,
        x1: parent.x,
        y1: parent.y,
        x2: child.x,
        y2: child.y,
        lane: child.lane,
        isMerge: index > 0,
        abandoned: child.abandoned || parent.abandoned,
      });
    });
  }

  const branchLabels: BranchLabel[] = [];
  for (const [name, tip] of Object.entries(state.branches)) {
    if (!tip) continue;
    const node = nodeById.get(tip);
    if (!node) continue;
    branchLabels.push({
      name,
      commitId: tip,
      x: node.x,
      y: node.y,
      lane: node.lane,
      isCurrent: name === curBranch,
    });
  }
  branchLabels.sort((a, b) => a.lane - b.lane);

  const head =
    state.head.type === "branch"
      ? { type: "branch" as const, name: state.head.name, commitId: state.branches[state.head.name] ?? null }
      : { type: "detached" as const, commitId: state.head.commitId };

  return {
    nodes,
    edges,
    branchLabels,
    laneCount: maxLane + 1,
    width: PADDING_X * 2 + maxGen * COL_WIDTH,
    height: PADDING_Y * 2 + maxLane * LANE_HEIGHT,
    head,
  };
}

/** How many distinct paths to a root — used only for tests/introspection. */
export function reachableFromHead(state: GitState): Set<string> {
  const headId = currentCommitId(state);
  return headId ? ancestors(state, headId) : new Set<string>();
}
