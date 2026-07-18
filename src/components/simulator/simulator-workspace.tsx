"use client";

/**
 * Interactive branch visualizer + simulator.
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
  Terminal,
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

/** Pre-seeds a rich branching tree on initial load so the visitor sees a result immediately. */
function seedTimeline(): TimelineEntry[] {
  const t: TimelineEntry[] = [];
  let s = initialState();
  t.push({ state: s, message: "Initialized empty repository on main", risk: "safe" as RiskLevel });

  try {
    let res = applyOperation(s, { kind: "commit", message: "Initial commit" });
    s = res.state;
    t.push({ state: s, message: res.message, risk: res.risk });

    res = applyOperation(s, { kind: "commit", message: "Add landing page layout" });
    s = res.state;
    t.push({ state: s, message: res.message, risk: res.risk });

    res = applyOperation(s, { kind: "checkout-b", name: "feature/auth" });
    s = res.state;
    t.push({ state: s, message: res.message, risk: res.risk });

    res = applyOperation(s, { kind: "commit", message: "Implement email login form" });
    s = res.state;
    t.push({ state: s, message: res.message, risk: res.risk });

    res = applyOperation(s, { kind: "checkout", ref: "main" });
    s = res.state;
    t.push({ state: s, message: res.message, risk: res.risk });
  } catch (e) {
    console.error("Failed to seed git timeline", e);
  }

  return t;
}

interface SimulatorWorkspaceProps {
  /** Optional pre-seeded state (tutorials embed scenes). */
  initial?: GitState;
}

export function SimulatorWorkspace({ initial }: SimulatorWorkspaceProps) {
  const seeded = useMemo(() => {
    return initial
      ? [{ state: initial, message: "Loaded starting scene", risk: "safe" as RiskLevel }]
      : seedTimeline();
  }, [initial]);

  const [timeline, setTimeline] = useState<TimelineEntry[]>(seeded);
  const [cursor, setCursor] = useState(() => seeded.length - 1);
  const [commandText, setCommandText] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [branchName, setBranchName] = useState("");
  const [error, setError] = useState<{ message: string; suggestion?: string } | null>(null);
  const [pendingOp, setPendingOp] = useState<GitOperation | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    const freshSeeded = initial
      ? [{ state: initial, message: "Loaded starting scene", risk: "safe" as RiskLevel }]
      : seedTimeline();
    setTimeline(freshSeeded);
    setCursor(freshSeeded.length - 1);
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
    "min-h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-45 w-full font-medium cursor-pointer";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Left Column: Visual Branch Graph */}
      <div className="min-w-0 space-y-4">
        <GraphCanvas state={state} />

        {/* Live operational log - visible inside advanced drawer */}
        {showAdvanced && (
          <section aria-label="Command log" className="rounded-xl border border-line bg-surface overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-line bg-surface-sunken px-4 py-2">
              <span className="schematic-label text-fg-muted font-bold text-3xs tracking-wider">COMMAND_LOG</span>
              <span className="schematic-label text-fg-muted font-bold text-3xs tracking-wider">
                STEP {cursor} / {timeline.length - 1}
              </span>
            </div>
            <ol
              aria-live="polite"
              className="max-h-48 space-y-1 overflow-auto p-4 font-mono text-xs leading-relaxed"
            >
              {timeline.slice(0, cursor + 1).map((entry, i) => (
                <li key={i} className="flex gap-2">
                  <span className="select-none text-fg-faint">{String(i).padStart(2, "0")}</span>
                  <span className={RISK_TEXT[entry.risk]}>{entry.message}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {/* Right Column: UI Controls & Settings */}
      <div className="space-y-5">
        {/* Basic Quick Actions */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h3 className="font-semibold text-sm">Git Actions</h3>

          {/* Commit Action */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="basic-commit" className="text-xs font-semibold text-fg-muted">New Commit</label>
            <div className="flex gap-2">
              <input
                id="basic-commit"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="Initial commit / Login layout"
                aria-label="Commit message"
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-fg-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <Button size="sm" onClick={onCommit} className="shrink-0 cursor-pointer">
                <GitCommitHorizontal size={15} aria-hidden="true" /> Commit
              </Button>
            </div>
          </div>

          {/* Branch Action */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="basic-branch" className="text-xs font-semibold text-fg-muted">New Branch</label>
            <div className="flex gap-2">
              <input
                id="basic-branch"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="feature/login"
                aria-label="New branch name"
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-fg-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <Button size="sm" variant="secondary" onClick={onNewBranch} className="shrink-0 cursor-pointer">
                <GitBranch size={15} aria-hidden="true" /> Branch
              </Button>
            </div>
          </div>

          <div className="h-px bg-line" />

          {/* Checkout & Switch dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sim-checkout" className="text-xs font-semibold text-fg-muted">Active Branch</label>
            <select
              id="sim-checkout"
              className={selectClass}
              value=""
              onChange={(e) => e.target.value && submit(`checkout ${e.target.value}`)}
            >
              <option value="">Checkout branch...</option>
              {branches.map((b) => (
                <option key={b} value={b} disabled={b === activeBranch}>
                  {b} {b === activeBranch ? " (current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Merge dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sim-merge" className="text-xs font-semibold text-fg-muted">Merge Branch</label>
            <select
              id="sim-merge"
              className={selectClass}
              value=""
              disabled={otherBranches.length === 0}
              onChange={(e) => e.target.value && submit(`merge ${e.target.value}`)}
            >
              <option value="">Merge into current...</option>
              {otherBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Session controls */}
        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <span className="schematic-label text-fg-muted font-bold text-3xs tracking-wider">TIMELINE CONTROLS</span>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" variant="secondary" onClick={undo} disabled={!canUndo} className="cursor-pointer">
              <Undo2 size={15} aria-hidden="true" /> Undo
            </Button>
            <Button size="sm" variant="secondary" onClick={redo} disabled={!canRedo} className="cursor-pointer">
              <Redo2 size={15} aria-hidden="true" /> Redo
            </Button>
            <Button size="sm" variant="ghost" onClick={resetAll} className="col-span-2 justify-center cursor-pointer">
              <RotateCcw size={15} aria-hidden="true" /> Reset to Starting Scene
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-muted justify-center">
            <GitMerge size={13} aria-hidden="true" className="text-accent" />
            <span>Active branch: <strong>{activeBranch ?? "detached"}</strong></span>
          </p>
        </div>

        {/* Advanced Shell Input & Operations Accordion */}
        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            <Terminal size={14} className="text-fg-muted" />
            <span>Advanced shell command terminal & rebase/reset</span>
            {showAdvanced ? "▲" : "▼"}
          </button>

          {showAdvanced && (
            <div className="mt-4 flex flex-col gap-4 border border-line p-4 rounded-xl bg-surface-sunken animate-fade-in">
              
              {/* Command Input terminal form */}
              <form onSubmit={onSubmitCommand} className="flex flex-col gap-1.5">
                <label htmlFor="sim-command" className="text-xs font-semibold text-fg-muted">Raw Shell Command</label>
                <div className="flex gap-2">
                  <input
                    id="sim-command"
                    value={commandText}
                    onChange={(e) => setCommandText(e.target.value)}
                    placeholder='git commit -m "add feature" · git merge main'
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-describedby={error ? "sim-error" : undefined}
                    className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-terminal px-3 font-mono text-sm text-term-text placeholder:text-term-comment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />
                  <Button type="submit" size="sm" className="cursor-pointer">
                    Run
                  </Button>
                </div>
                {error && (
                  <div id="sim-error" role="alert" className="mt-2 rounded-lg bg-risk-danger-bg px-3 py-2 text-xs text-risk-danger border border-risk-danger/20">
                    <strong>Error:</strong> {error.message}
                    {error.suggestion && (
                      <span className="mt-1 block text-fg-secondary">{error.suggestion}</span>
                    )}
                  </div>
                )}
              </form>

              {/* Advanced Rebase dropdown */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sim-rebase" className="text-xs font-semibold text-fg-muted">Rebase</label>
                <select
                  id="sim-rebase"
                  className={selectClass}
                  value=""
                  disabled={otherBranches.length === 0}
                  onChange={(e) => e.target.value && submit(`rebase ${e.target.value}`)}
                >
                  <option value="">Rebase onto branch...</option>
                  {otherBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Reset dropdown */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sim-reset" className="text-xs font-semibold text-fg-muted">Reset</label>
                <select
                  id="sim-reset"
                  className={selectClass}
                  value=""
                  onChange={(e) => e.target.value && submit(`reset ${e.target.value} HEAD~1`)}
                >
                  <option value="">Reset to HEAD~1...</option>
                  <option value="--soft">--soft (keep changes staged)</option>
                  <option value="--mixed">--mixed (keep changes unstaged)</option>
                  <option value="--hard">--hard (discard changes)</option>
                </select>
                <p className="flex items-center gap-1.5 text-3xs text-fg-muted mt-1 leading-normal">
                  <RiskBadge risk="destructive" size={10} /> reset --hard prompts for verification.
                </p>
              </div>

              {/* Advanced Export/Import controls */}
              <div className="h-px bg-line my-1" />
              <div>
                <span className="text-xs font-semibold text-fg-muted block mb-2">Export / Import Session</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button size="sm" variant="secondary" onClick={onExport} className="cursor-pointer text-xs">
                    <Download size={12} /> Export
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="cursor-pointer text-xs">
                    <Upload size={12} /> Import
                  </Button>
                  <Button size="sm" variant="secondary" onClick={onSaveSession} className="cursor-pointer text-xs">
                    <Save size={12} /> {saveState === "saved" ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
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
