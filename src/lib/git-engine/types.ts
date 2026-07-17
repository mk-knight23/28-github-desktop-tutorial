/**
 * Types for the in-memory Git graph engine.
 *
 * The engine is a pure, zero-DOM module. Every operation takes a Readonly state
 * and returns a brand-new state (immutable transitions), which is what makes
 * undo / redo / time-travel possible in the simulator.
 */

/** A single commit node in the DAG. */
export interface Commit {
  /** 7-char deterministic pseudo-SHA. */
  readonly id: string;
  readonly message: string;
  /** Parent commit ids. 0 = root, 1 = normal, 2 = merge commit. */
  readonly parents: readonly string[];
  /** Monotonic creation index — drives deterministic layout ordering. */
  readonly seq: number;
}

/** Where HEAD points: at a branch (normal) or a raw commit (detached). */
export type Head =
  | { readonly type: "branch"; readonly name: string }
  | { readonly type: "detached"; readonly commitId: string };

/** The complete, serializable engine state. */
export interface GitState {
  readonly commits: Readonly<Record<string, Commit>>;
  /** branch name -> tip commit id, or null for an unborn branch. */
  readonly branches: Readonly<Record<string, string | null>>;
  readonly head: Head;
  /** Ids abandoned by rebase/reset --hard, kept for ghost rendering. */
  readonly abandoned: readonly string[];
  /** Next sequence number to assign. */
  readonly seq: number;
}

export type ResetMode = "soft" | "mixed" | "hard";

export type RiskLevel = "safe" | "caution" | "destructive";

/** A supported operation, produced by the parser or the UI buttons. */
export type GitOperation =
  | { readonly kind: "commit"; readonly message: string }
  | { readonly kind: "branch"; readonly name: string }
  | { readonly kind: "checkout"; readonly ref: string }
  | { readonly kind: "checkout-b"; readonly name: string }
  | { readonly kind: "merge"; readonly branch: string }
  | { readonly kind: "rebase"; readonly branch: string }
  | { readonly kind: "reset"; readonly mode: ResetMode; readonly ref: string };

/** Result of applying an operation: new state + a human/screen-reader log line. */
export interface OperationResult {
  readonly state: GitState;
  readonly message: string;
  readonly risk: RiskLevel;
}

/** Thrown for invalid operations; `suggestion` powers the "never a dead end" UX. */
export class GitEngineError extends Error {
  readonly suggestion?: string;
  constructor(message: string, suggestion?: string) {
    super(message);
    this.name = "GitEngineError";
    this.suggestion = suggestion;
  }
}
