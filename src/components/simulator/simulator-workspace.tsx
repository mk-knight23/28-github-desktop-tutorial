"use client";

/**
 * Interactive branch visualizer + simulator (PRODUCT_SPEC §3.1).
 *
 * Pure in-memory Git graph — the site NEVER executes shell commands. Every
 * operation returns a new immutable state, which powers step-by-step undo/redo
 * and time-travel. Destructive ops (reset --hard) open a confirm dialog before
 * mutating the graph. The command log is an aria-live region so the SVG is never
 * the only representation. Sessions export/import as local JSON.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import {
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  Download,
  Upload,
  Undo2,
  Redo2,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  applyOperation,
  currentBranch,
  initialState,
  isDestructiveOperation,
  parseCommand,
  GitEngineError,
  type GitOperation,
  type GitState,
  type RiskLevel,
} from "@/lib/git-engine";
import { GraphCanvas } from "@/components/simulator/graph-canvas";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RiskBadge } from "@/components/ui/risk-badge";
import { saveSimulatorSession } from "@/lib/storage";
import { track } from "@/lib/analytics";

interface TimelineEntry {
  state: GitState;
  message: string;
  risk: RiskLevel;
}

const RISK_TEXT: Record<RiskLevel, string> = {
  safe: "text-term-ok",
  caution: "text-term-warn",
  destructive: "text-term-err",
};

function seedTimeline(): TimelineEntry[] {
  return [
    { state: initialState(), message: "Initialized empty repository on main", risk: "safe" },
  ];
}

interface SimulatorWorkspaceProps {
  /** Optional pre-seeded state (tutorials embed scenes). */
  initial?: GitState;
}

export function SimulatorWorkspace({ initial }: SimulatorWorkspaceProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>(() =>
    initial
      ? [{ state: initial, message: "Loaded starting scene", risk: "safe" }]
      : seedTimeline(),
  );
  const [cursor, setCursor] = useState(0);
  const [commandText, setCommandText] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [branchName, setBranchName] = useState("");
  const [error, setError] = useState<{ message: string; suggestion?: string } | null>(null);
  const [pendingOp, setPendingOp] = useState<GitOperation | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = timeline[cursor];
  const state = current.state;
  const branches = useMemo(() => Object.keys(state.branches).sort(), [state.branches]);
  const activeBranch = currentBranch(state);
  const otherBranches = branches.filter((b) => b !== activeBranch);
  const canUndo = cursor > 0;
  const canRedo = cursor < timeline.length - 1;

  const pushResult = useCallback(
    (entry: TimelineEntry) => {
      setTimeline((prev) => [...prev.slice(0, cursor + 1), entry]);
      setCursor((c) => c + 1);
      setError(null);
      track("tool_completed", { feature: "simulator" });
    },
    [cursor],
  );

  const runOperation = useCallback(
    (op: GitOperation) => {
      try {
        const result = applyOperation(state, op);
        pushResult({ state: result.state, message: result.message, risk: result.risk });
      } catch (e) {
        if (e instanceof GitEngineError) {
          setError({ message: e.message, suggestion: e.suggestion });
        } else {
          setError({ message: "Something went wrong applying that operation." });
        }
      }
    },
    [state, pushResult],
  );

  const submit = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;
      let op: GitOperation;
      try {
        op = parseCommand(input);
      } catch (e) {
        if (e instanceof GitEngineError) {
          setError({ message: e.message, suggestion: e.suggestion });
        } else {
          setError({ message: "Could not parse that command." });
        }
        return;
      }
      if (isDestructiveOperation(op)) {
        setPendingOp(op);
        return;
      }
      runOperation(op);
    },
    [runOperation],
  );

  const onSubmitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    submit(commandText);
    setCommandText("");
  };

  const onCommit = () => {
    runOperation({ kind: "commit", message: commitMsg.trim() || "update files" });
    setCommitMsg("");
  };

  const onNewBranch = () => {
    const name = branchName.trim();
    if (!name) {
      setError({ message: "Enter a branch name first.", suggestion: "e.g. feature/login" });
      return;
    }
    submit(`checkout -b ${name}`);
    setBranchName("");
  };

  const undo = () => canUndo && setCursor((c) => c - 1);
  const redo = () => canRedo && setCursor((c) => c + 1);
  const resetAll = () => {
    setTimeline(seedTimeline());
    setCursor(0);
    setError(null);
  };

  const confirmPending = () => {
    if (pendingOp) runOperation(pendingOp);
    setPendingOp(null);
  };

  const onExport = () => {
    const bundle = {
      app: "mk-gitflow-sim",
      version: 1,
      exportedAt: Date.now(),
      log: timeline.slice(0, cursor + 1).map((t) => t.message),
      state,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gitflow-session.json";
    a.click();
    URL.revokeObjectURL(url);
    track("result_exported", { feature: "simulator" });
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.app !== "mk-gitflow-sim" || typeof parsed.state !== "object") {
          throw new Error("not a simulator export");
        }
        setTimeline([{ state: parsed.state as GitState, message: "Imported session", risk: "safe" }]);
        setCursor(0);
        setError(null);
      } catch {
        setError({ message: "That file is not a MK GitFlow simulator export." });
      }
    };
    reader.readAsText(file);
  };

  const onSaveSession = async () => {
    await saveSimulatorSession({
      name: `Session ${new Date().toLocaleString()}`,
      log: timeline.slice(0, cursor + 1).map((t) => t.message),
      stateJson: JSON.stringify(state),
    });
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  };

  const selectClass =
    "min-h-9 rounded-sm border border-border-strong bg-surface px-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-45";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Graph + log */}
      <div className="min-w-0 space-y-4">
        <GraphCanvas state={state} />

        <section aria-label="Command log" className="rounded-md border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="schematic-label text-fg-muted">OP_LOG</span>
            <span className="schematic-label text-fg-muted">
              STEP {cursor} / {timeline.length - 1}
            </span>
          </div>
          <ol
            aria-live="polite"
            className="max-h-56 space-y-1 overflow-auto p-3 font-mono text-sm"
          >
            {timeline.slice(0, cursor + 1).map((entry, i) => (
              <li key={i} className="flex gap-2">
                <span className="select-none text-fg-muted">{String(i).padStart(2, "0")}</span>
                <span className={RISK_TEXT[entry.risk]}>{entry.message}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <form onSubmit={onSubmitCommand} className="rounded-md border border-border bg-surface p-4">
          <label htmlFor="sim-command" className="schematic-label text-fg-muted">
            COMMAND INPUT
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="sim-command"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder='commit "message" · merge dev · reset --hard'
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-describedby={error ? "sim-error" : undefined}
              className="min-w-0 flex-1 rounded-sm border border-border-strong bg-terminal px-3 py-2 font-mono text-sm text-term-text placeholder:text-term-comment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Button type="submit" size="sm">
              Run
            </Button>
          </div>
          {error && (
            <div id="sim-error" role="alert" className="mt-2 rounded-sm bg-risk-danger-bg px-3 py-2 text-sm text-risk-danger">
              {error.message}
              {error.suggestion && (
                <span className="mt-1 block text-fg-secondary">{error.suggestion}</span>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-fg-muted">
            Supported: commit, branch, checkout, switch, merge, rebase, reset. Nothing runs on
            a real repo.
          </p>
        </form>

        {/* Quick actions */}
        <div className="space-y-3 rounded-md border border-border bg-surface p-4">
          <span className="schematic-label text-fg-muted">QUICK ACTIONS</span>

          <div className="flex gap-2">
            <input
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="commit message"
              aria-label="Commit message"
              className="min-w-0 flex-1 rounded-sm border border-border-strong bg-surface px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Button size="sm" onClick={onCommit} className="shrink-0">
              <GitCommitHorizontal size={15} aria-hidden="true" /> Commit
            </Button>
          </div>

          <div className="flex gap-2">
            <input
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="new branch name"
              aria-label="New branch name"
              className="min-w-0 flex-1 rounded-sm border border-border-strong bg-surface px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Button size="sm" variant="secondary" onClick={onNewBranch} className="shrink-0">
              <GitBranch size={15} aria-hidden="true" /> Branch
            </Button>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-2">
            <label htmlFor="sim-checkout" className="schematic-label text-fg-muted">
              CHECKOUT
            </label>
            <select
              id="sim-checkout"
              className={selectClass}
              value=""
              onChange={(e) => e.target.value && submit(`checkout ${e.target.value}`)}
            >
              <option value="">Switch to…</option>
              {branches.map((b) => (
                <option key={b} value={b} disabled={b === activeBranch}>
                  {b}
                  {b === activeBranch ? " (current)" : ""}
                </option>
              ))}
            </select>

            <label htmlFor="sim-merge" className="schematic-label text-fg-muted">
              MERGE
            </label>
            <select
              id="sim-merge"
              className={selectClass}
              value=""
              disabled={otherBranches.length === 0}
              onChange={(e) => e.target.value && submit(`merge ${e.target.value}`)}
            >
              <option value="">Merge into current…</option>
              {otherBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <label htmlFor="sim-rebase" className="schematic-label text-fg-muted">
              REBASE
            </label>
            <select
              id="sim-rebase"
              className={selectClass}
              value=""
              disabled={otherBranches.length === 0}
              onChange={(e) => e.target.value && submit(`rebase ${e.target.value}`)}
            >
              <option value="">Rebase onto…</option>
              {otherBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <label htmlFor="sim-reset" className="schematic-label text-fg-muted">
              RESET
            </label>
            <select
              id="sim-reset"
              className={selectClass}
              value=""
              onChange={(e) => e.target.value && submit(`reset ${e.target.value} HEAD~1`)}
            >
              <option value="">Reset to HEAD~1…</option>
              <option value="--soft">--soft (keep changes staged)</option>
              <option value="--mixed">--mixed (keep changes unstaged)</option>
              <option value="--hard">--hard (discard changes)</option>
            </select>
          </div>
          <p className="flex items-center gap-2 text-xs text-fg-muted">
            <RiskBadge risk="destructive" size={12} /> reset --hard asks for confirmation.
          </p>
        </div>

        {/* Session controls */}
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="schematic-label text-fg-muted">SESSION</span>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" variant="secondary" onClick={undo} disabled={!canUndo}>
              <Undo2 size={15} aria-hidden="true" /> Undo
            </Button>
            <Button size="sm" variant="secondary" onClick={redo} disabled={!canRedo}>
              <Redo2 size={15} aria-hidden="true" /> Redo
            </Button>
            <Button size="sm" variant="secondary" onClick={onExport}>
              <Download size={15} aria-hidden="true" /> Export
            </Button>
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} aria-hidden="true" /> Import
            </Button>
            <Button size="sm" variant="secondary" onClick={onSaveSession}>
              <Save size={15} aria-hidden="true" /> {saveState === "saved" ? "Saved" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetAll}>
              <RotateCcw size={15} aria-hidden="true" /> Clear
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
          <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-muted">
            <GitMerge size={13} aria-hidden="true" />
            HEAD → {activeBranch ?? "detached"}. Sessions save to this browser only.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={pendingOp !== null}
        title="Run a destructive reset?"
        description="reset --hard moves the branch pointer and throws away the commits after it. In real Git this permanently discards uncommitted work."
        consequence="In this simulator the commits become abandoned (shown dashed). You can still Undo."
        confirmLabel="Reset --hard"
        onConfirm={confirmPending}
        onCancel={() => setPendingOp(null)}
      />
    </div>
  );
}
