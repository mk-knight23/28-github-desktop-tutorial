/** Dispatch a parsed GitOperation (or a raw command string) to the engine. */

import {
  branch,
  checkout,
  checkoutNewBranch,
  commit,
  merge,
  rebase,
  reset,
} from "./engine";
import { parseCommand } from "./parse";
import { type GitOperation, type GitState, type OperationResult } from "./types";

export function applyOperation(state: GitState, op: GitOperation): OperationResult {
  switch (op.kind) {
    case "commit":
      return commit(state, op.message);
    case "branch":
      return branch(state, op.name);
    case "checkout":
      return checkout(state, op.ref);
    case "checkout-b":
      return checkoutNewBranch(state, op.name);
    case "merge":
      return merge(state, op.branch);
    case "rebase":
      return rebase(state, op.branch);
    case "reset":
      return reset(state, op.mode, op.ref);
  }
}

/** Parse then apply. Throws GitEngineError on invalid input or operation. */
export function applyCommand(state: GitState, input: string): OperationResult {
  return applyOperation(state, parseCommand(input));
}

/** Is this operation destructive enough to require the confirm gate? */
export function isDestructiveOperation(op: GitOperation): boolean {
  return op.kind === "reset" && op.mode === "hard";
}
