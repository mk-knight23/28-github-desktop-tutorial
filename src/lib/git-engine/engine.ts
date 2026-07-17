/**
 * Pure in-memory Git graph engine.
 *
 * Zero DOM dependencies. Every exported operation is a pure function that takes
 * a Readonly<GitState> and returns a new GitState (or throws GitEngineError).
 * No operation mutates its input — this is what enables undo/redo/time-travel.
 */

import { makeSha } from "./sha";
import {
  type Commit,
  type GitState,
  GitEngineError,
  type Head,
  type OperationResult,
  type ResetMode,
} from "./types";

export const DEFAULT_BRANCH = "main";

/** A fresh repository: one unborn `main` branch, HEAD attached to it. */
export function initialState(): GitState {
  return {
    commits: {},
    branches: { [DEFAULT_BRANCH]: null },
    head: { type: "branch", name: DEFAULT_BRANCH },
    abandoned: [],
    seq: 1,
  };
}

/* --------------------------------- reads --------------------------------- */

/** The commit id HEAD currently resolves to, or null on an unborn branch. */
export function currentCommitId(state: GitState): string | null {
  if (state.head.type === "detached") return state.head.commitId;
  return state.branches[state.head.name] ?? null;
}

/** Branch name HEAD is on, or null when detached. */
export function currentBranch(state: GitState): string | null {
  return state.head.type === "branch" ? state.head.name : null;
}

export function isValidBranchName(name: string): boolean {
  if (!name || name.length > 100) return false;
  if (/\s/.test(name)) return false;
  if (name.startsWith("/") || name.endsWith("/") || name.endsWith(".")) return false;
  if (name.includes("..") || name.includes("//")) return false;
  if (name.startsWith("-")) return false;
  // Disallow characters git itself refuses in ref names.
  return !/[~^:?*[\]\\@{}]/.test(name);
}

/** All ancestor ids of `id` (inclusive of `id`). */
export function ancestors(state: GitState, id: string): Set<string> {
  const seen = new Set<string>();
  const stack = [id];
  while (stack.length > 0) {
    const cur = stack.pop() as string;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const commit = state.commits[cur];
    if (commit) stack.push(...commit.parents);
  }
  return seen;
}

/** True when `maybeAncestor` is an ancestor of (or equal to) `id`. */
export function isAncestor(state: GitState, maybeAncestor: string, id: string): boolean {
  return ancestors(state, id).has(maybeAncestor);
}

/**
 * Resolve a ref string to a commit id.
 * Supports: branch names, full/short commit ids, `HEAD`, and `<ref>~n`.
 * Returns null when unresolvable.
 */
export function resolveRef(state: GitState, ref: string): string | null {
  const trimmed = ref.trim();
  if (!trimmed) return null;

  const tildeMatch = trimmed.match(/^(.*?)~(\d+)$/);
  if (tildeMatch) {
    const base = resolveRef(state, tildeMatch[1] === "" ? "HEAD" : tildeMatch[1]);
    if (base === null) return null;
    let cur: string | null = base;
    const steps = Number(tildeMatch[2]);
    for (let i = 0; i < steps; i += 1) {
      const commit: Commit | undefined = cur ? state.commits[cur] : undefined;
      if (!commit || commit.parents.length === 0) return null;
      cur = commit.parents[0];
    }
    return cur;
  }

  if (trimmed === "HEAD") return currentCommitId(state);
  if (Object.prototype.hasOwnProperty.call(state.branches, trimmed)) {
    return state.branches[trimmed];
  }
  if (state.commits[trimmed]) return trimmed;

  // Prefix match on commit ids (e.g. user typed 4 of 7 chars).
  const prefixMatches = Object.keys(state.commits).filter((id) => id.startsWith(trimmed));
  if (prefixMatches.length === 1) return prefixMatches[0];

  return null;
}

/** Closest existing branch name to `name` (for helpful error suggestions). */
function closestBranch(state: GitState, name: string): string | undefined {
  const names = Object.keys(state.branches);
  if (names.length === 0) return undefined;
  let best: string | undefined;
  let bestDist = Infinity;
  for (const candidate of names) {
    const dist = levenshtein(name, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return bestDist <= Math.max(2, Math.floor(name.length / 2)) ? best : undefined;
}

function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length];
}

/* Ids reachable from any branch tip or HEAD — everything else is abandoned. */
function reachableIds(state: GitState): Set<string> {
  const roots = new Set<string>();
  for (const tip of Object.values(state.branches)) {
    if (tip) roots.add(tip);
  }
  const headId = currentCommitId(state);
  if (headId) roots.add(headId);
  const all = new Set<string>();
  for (const root of roots) {
    for (const id of ancestors(state, root)) all.add(id);
  }
  return all;
}

/** Recompute the abandoned list from reachability (used after reset/rebase). */
function withRecomputedAbandoned(state: GitState): GitState {
  const reachable = reachableIds(state);
  const abandoned = Object.keys(state.commits).filter((id) => !reachable.has(id));
  return { ...state, abandoned };
}

/* ------------------------------- operations ------------------------------ */

/** Create a commit at HEAD, advancing the current branch (or detached HEAD). */
export function commit(state: GitState, message: string): OperationResult {
  const msg = message.trim();
  if (!msg) throw new GitEngineError("A commit needs a message.", 'Try: commit "your message"');

  const parentId = currentCommitId(state);
  const parents = parentId ? [parentId] : [];
  const id = makeSha(state.seq, msg, parents);
  const newCommit: Commit = { id, message: msg, parents, seq: state.seq };

  const commits = { ...state.commits, [id]: newCommit };
  let branches = state.branches;
  let head: Head = state.head;
  if (state.head.type === "branch") {
    branches = { ...state.branches, [state.head.name]: id };
  } else {
    head = { type: "detached", commitId: id };
  }

  const next: GitState = { ...state, commits, branches, head, seq: state.seq + 1 };
  const where = state.head.type === "branch" ? state.head.name : "detached HEAD";
  return { state: next, message: `Committed ${id} on ${where}: "${msg}"`, risk: "safe" };
}

/** Create a branch pointing at HEAD without switching to it. */
export function branch(state: GitState, name: string): OperationResult {
  if (!isValidBranchName(name)) {
    throw new GitEngineError(`"${name}" is not a valid branch name.`, "Use letters, digits, /, - or _ with no spaces.");
  }
  if (Object.prototype.hasOwnProperty.call(state.branches, name)) {
    throw new GitEngineError(`Branch "${name}" already exists.`, `Try: checkout ${name}`);
  }
  const tip = currentCommitId(state);
  if (tip === null) {
    throw new GitEngineError("Cannot branch before the first commit.", 'Commit something first, then branch.');
  }
  const branches = { ...state.branches, [name]: tip };
  return { state: { ...state, branches }, message: `Created branch ${name} at ${tip}`, risk: "safe" };
}

/** Switch HEAD to a branch, or to a commit id (detached HEAD). */
export function checkout(state: GitState, ref: string): OperationResult {
  const name = ref.trim();
  if (Object.prototype.hasOwnProperty.call(state.branches, name)) {
    return {
      state: { ...state, head: { type: "branch", name } },
      message: `Switched to branch ${name}`,
      risk: "safe",
    };
  }
  const commitId = resolveRef(state, name);
  if (commitId) {
    return {
      state: { ...state, head: { type: "detached", commitId } },
      message: `Checked out ${commitId} — you are in detached HEAD state`,
      risk: "caution",
    };
  }
  const suggestion = closestBranch(state, name);
  throw new GitEngineError(
    `No branch or commit matches "${name}".`,
    suggestion ? `Did you mean: checkout ${suggestion}?` : "Create it first: branch " + name,
  );
}

/** `checkout -b <name>`: create a branch at HEAD and switch to it. */
export function checkoutNewBranch(state: GitState, name: string): OperationResult {
  const created = branch(state, name);
  const switched = checkout(created.state, name);
  return {
    state: switched.state,
    message: `Created and switched to branch ${name}`,
    risk: "safe",
  };
}

/** Merge `other` into the current branch (fast-forward or a true merge commit). */
export function merge(state: GitState, other: string): OperationResult {
  const cur = currentBranch(state);
  if (cur === null) {
    throw new GitEngineError("Cannot merge while HEAD is detached.", "Checkout a branch first.");
  }
  if (!Object.prototype.hasOwnProperty.call(state.branches, other)) {
    throw new GitEngineError(`Branch "${other}" does not exist.`, closestBranch(state, other) ? `Did you mean ${closestBranch(state, other)}?` : undefined);
  }
  if (other === cur) {
    throw new GitEngineError("Cannot merge a branch into itself.");
  }
  const curTip = state.branches[cur];
  const otherTip = state.branches[other];
  if (otherTip === null) {
    throw new GitEngineError(`Branch "${other}" has no commits to merge.`);
  }
  if (curTip === null) {
    // Current branch unborn: fast-forward to other.
    const branches = { ...state.branches, [cur]: otherTip };
    return { state: { ...state, branches }, message: `Fast-forwarded ${cur} to ${otherTip}`, risk: "safe" };
  }
  if (isAncestor(state, otherTip, curTip)) {
    return { state, message: `Already up to date — ${other} is already merged into ${cur}.`, risk: "safe" };
  }
  if (isAncestor(state, curTip, otherTip)) {
    const branches = { ...state.branches, [cur]: otherTip };
    return {
      state: { ...state, branches },
      message: `Fast-forwarded ${cur} to ${otherTip} (no merge commit needed)`,
      risk: "safe",
    };
  }
  // True merge: new commit with two parents.
  const message = `Merge branch '${other}' into ${cur}`;
  const parents = [curTip, otherTip];
  const id = makeSha(state.seq, message, parents);
  const mergeCommit: Commit = { id, message, parents, seq: state.seq };
  const commits = { ...state.commits, [id]: mergeCommit };
  const branches = { ...state.branches, [cur]: id };
  return {
    state: { ...state, commits, branches, seq: state.seq + 1 },
    message: `Merged ${other} into ${cur} — created merge commit ${id}`,
    risk: "caution",
  };
}

/** Rebase the current branch onto `onto`, replaying commits with new ids. */
export function rebase(state: GitState, onto: string): OperationResult {
  const cur = currentBranch(state);
  if (cur === null) {
    throw new GitEngineError("Cannot rebase while HEAD is detached.", "Checkout a branch first.");
  }
  if (!Object.prototype.hasOwnProperty.call(state.branches, onto)) {
    throw new GitEngineError(`Branch "${onto}" does not exist.`, closestBranch(state, onto) ? `Did you mean ${closestBranch(state, onto)}?` : undefined);
  }
  if (onto === cur) throw new GitEngineError("Cannot rebase a branch onto itself.");

  const curTip = state.branches[cur];
  const ontoTip = state.branches[onto];
  if (curTip === null) throw new GitEngineError(`Branch "${cur}" has no commits to rebase.`);
  if (ontoTip === null) throw new GitEngineError(`Branch "${onto}" has no commits.`);

  if (isAncestor(state, curTip, ontoTip)) {
    // Current is behind onto — fast-forward, nothing to replay.
    const branches = { ...state.branches, [cur]: ontoTip };
    return { state: { ...state, branches }, message: `Fast-forwarded ${cur} onto ${onto}`, risk: "caution" };
  }
  if (isAncestor(state, ontoTip, curTip)) {
    return { state, message: `${cur} is already based on ${onto} — nothing to do.`, risk: "safe" };
  }

  // Commits reachable from curTip but not from ontoTip, oldest-first.
  const ontoAncestors = ancestors(state, ontoTip);
  const toReplay = Array.from(ancestors(state, curTip))
    .filter((id) => !ontoAncestors.has(id))
    .map((id) => state.commits[id])
    .sort((a, b) => a.seq - b.seq);

  const commits = { ...state.commits };
  let base = ontoTip;
  let seq = state.seq;
  for (const original of toReplay) {
    const parents = [base];
    const id = makeSha(seq, original.message, parents);
    commits[id] = { id, message: original.message, parents, seq };
    base = id;
    seq += 1;
  }
  const branches = { ...state.branches, [cur]: base };
  const next = withRecomputedAbandoned({ ...state, commits, branches, seq });
  return {
    state: next,
    message: `Rebased ${cur} onto ${onto} — replayed ${toReplay.length} commit(s); originals abandoned`,
    risk: "caution",
  };
}

/** Move the current branch pointer to `ref`. `--hard` is destructive. */
export function reset(state: GitState, mode: ResetMode, ref: string): OperationResult {
  const cur = currentBranch(state);
  if (cur === null) {
    throw new GitEngineError("Cannot reset while HEAD is detached.", "Checkout a branch first.");
  }
  const target = resolveRef(state, ref);
  if (target === null) {
    throw new GitEngineError(`Cannot resolve "${ref}".`, "Use a branch, commit id, or HEAD~n.");
  }
  const branches = { ...state.branches, [cur]: target };
  const next = withRecomputedAbandoned({ ...state, branches });
  const lostCount = next.abandoned.length - state.abandoned.length;
  const risk = mode === "hard" ? "destructive" : "caution";
  const detail =
    mode === "hard"
      ? `discarded working changes; ${lostCount} commit(s) now unreachable`
      : mode === "soft"
        ? "kept changes staged"
        : "kept changes in the working tree";
  return {
    state: next,
    message: `reset --${mode} ${cur} to ${target} — ${detail}`,
    risk,
  };
}
