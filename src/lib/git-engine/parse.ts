/**
 * Parse a typed git command string into a GitOperation.
 *
 * Accepts commands with or without a leading `git`. Supports the subset the
 * simulator models. On failure it throws GitEngineError with a suggestion so the
 * UI never dead-ends (PRODUCT_SPEC §3.1).
 */

import { type GitOperation, GitEngineError, type ResetMode } from "./types";

/** Split a command line into tokens, honoring single and double quotes. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3] ?? "");
  }
  return tokens;
}

const SUPPORTED = "commit, branch, checkout, switch, merge, rebase, reset";

export function parseCommand(input: string): GitOperation {
  const trimmed = input.trim();
  if (!trimmed) throw new GitEngineError("Type a git command.", `Supported: ${SUPPORTED}`);

  let tokens = tokenize(trimmed);
  if (tokens[0] === "git") tokens = tokens.slice(1);
  if (tokens.length === 0) throw new GitEngineError("Type a git command after `git`.", `Supported: ${SUPPORTED}`);

  const [cmd, ...rest] = tokens;

  switch (cmd) {
    case "commit":
      return parseCommit(rest);
    case "branch":
      return parseBranch(rest);
    case "checkout":
      return parseCheckout(rest);
    case "switch":
      return parseSwitch(rest);
    case "merge":
      return parseSingleArg("merge", rest, (branch) => ({ kind: "merge", branch }));
    case "rebase":
      return parseSingleArg("rebase", rest, (branch) => ({ kind: "rebase", branch }));
    case "reset":
      return parseReset(rest);
    default:
      throw new GitEngineError(`"${cmd}" is not a command the simulator understands.`, `Supported: ${SUPPORTED}`);
  }
}

function parseCommit(rest: string[]): GitOperation {
  // Accept: commit -m "msg" | commit --message "msg" | commit "msg"
  const mIndex = rest.findIndex((t) => t === "-m" || t === "--message");
  let message: string | undefined;
  if (mIndex !== -1) {
    message = rest[mIndex + 1];
  } else {
    message = rest.find((t) => !t.startsWith("-"));
  }
  if (!message) {
    throw new GitEngineError("commit needs a message.", 'Try: commit -m "add login form"');
  }
  return { kind: "commit", message };
}

function parseBranch(rest: string[]): GitOperation {
  const name = rest.find((t) => !t.startsWith("-"));
  if (!name) throw new GitEngineError("branch needs a name.", "Try: branch feature/login");
  return { kind: "branch", name };
}

function parseCheckout(rest: string[]): GitOperation {
  const dashB = rest.findIndex((t) => t === "-b");
  if (dashB !== -1) {
    const name = rest[dashB + 1];
    if (!name) throw new GitEngineError("checkout -b needs a branch name.", "Try: checkout -b feature/login");
    return { kind: "checkout-b", name };
  }
  const ref = rest.find((t) => !t.startsWith("-"));
  if (!ref) throw new GitEngineError("checkout needs a branch or commit.", "Try: checkout main");
  return { kind: "checkout", ref };
}

function parseSwitch(rest: string[]): GitOperation {
  // `switch -c name` == `checkout -b name`; `switch name` == `checkout name`.
  const dashC = rest.findIndex((t) => t === "-c" || t === "--create");
  if (dashC !== -1) {
    const name = rest[dashC + 1];
    if (!name) throw new GitEngineError("switch -c needs a branch name.", "Try: switch -c feature/login");
    return { kind: "checkout-b", name };
  }
  const ref = rest.find((t) => !t.startsWith("-"));
  if (!ref) throw new GitEngineError("switch needs a branch.", "Try: switch main");
  return { kind: "checkout", ref };
}

function parseReset(rest: string[]): GitOperation {
  let mode: ResetMode = "mixed";
  const refs: string[] = [];
  for (const token of rest) {
    if (token === "--hard") mode = "hard";
    else if (token === "--soft") mode = "soft";
    else if (token === "--mixed") mode = "mixed";
    else if (token.startsWith("-")) {
      throw new GitEngineError(`Unknown reset flag "${token}".`, "Use --soft, --mixed or --hard.");
    } else {
      refs.push(token);
    }
  }
  const ref = refs[0] ?? "HEAD~1";
  return { kind: "reset", mode, ref };
}

function parseSingleArg(
  name: string,
  rest: string[],
  build: (arg: string) => GitOperation,
): GitOperation {
  const arg = rest.find((t) => !t.startsWith("-"));
  if (!arg) throw new GitEngineError(`${name} needs a branch name.`, `Try: ${name} main`);
  return build(arg);
}
