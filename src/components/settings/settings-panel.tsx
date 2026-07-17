"use client";

/**
 * Settings (PRODUCT_SPEC §5 / STANDARDS §4): theme, reduced-motion override,
 * analytics consent, history logging toggle, storage usage, and
 * export / import / clear-all for all local data. Everything is local-first.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload, Trash2, Database, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getByokKey, setByokKey, clearByokKey } from "@/lib/ai/byok";
import {
  applyMotionPref,
  applyThemePref,
  getMotionPref,
  getThemePref,
  type MotionPref,
  type ThemePref,
} from "@/lib/theme";
import { getConsent, setConsent, type ConsentState } from "@/lib/analytics";
import {
  clearAll,
  exportAll,
  getStorageUsage,
  importBundle,
  isHistoryDisabled,
  setHistoryDisabled,
  type StorageUsage,
} from "@/lib/storage";
import { track } from "@/lib/analytics";

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "unavailable";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

interface RadioOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="schematic-label text-fg-muted">{legend}</legend>
      <div className="mt-3 space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 transition-colors duration-(--motion-fast) ${
              value === opt.value
                ? "border-accent bg-surface-raised"
                : "border-border hover:bg-surface-raised"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm font-medium text-fg">{opt.label}</span>
              {opt.hint && <span className="block text-xs text-fg-secondary">{opt.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const CARD = "rounded-lg border border-border bg-surface p-6";

export function SettingsPanel() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemePref>("dark");
  const [motion, setMotion] = useState<MotionPref>("system");
  const [consent, setConsentState] = useState<ConsentState>("unset");
  const [historyOff, setHistoryOff] = useState(false);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [byokKey, setByokKeyState] = useState("");
  const [byokDraft, setByokDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshUsage = useCallback(async () => {
    setUsage(await getStorageUsage());
  }, []);

  useEffect(() => {
    let active = true;
    // Read browser-only prefs and storage after mount (async, so setState here
    // is not a synchronous cascade) and gate initial render on a skeleton to
    // avoid hydration mismatch against the SSR defaults.
    (async () => {
      const usage = await getStorageUsage();
      if (!active) return;
      setTheme(getThemePref());
      setMotion(getMotionPref());
      setConsentState(getConsent());
      setHistoryOff(isHistoryDisabled());
      const storedKey = getByokKey();
      setByokKeyState(storedKey);
      setByokDraft(storedKey);
      setUsage(usage);
      setMounted(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const onTheme = (v: ThemePref) => {
    setTheme(v);
    applyThemePref(v);
  };
  const onMotion = (v: MotionPref) => {
    setMotion(v);
    applyMotionPref(v);
  };
  const onConsent = (v: "granted" | "denied") => {
    setConsentState(v);
    setConsent(v);
  };
  const onHistory = (off: boolean) => {
    setHistoryOff(off);
    setHistoryDisabled(off);
  };
  const onSaveByok = () => {
    setByokKey(byokDraft);
    const stored = getByokKey();
    setByokKeyState(stored);
    setByokDraft(stored);
    setStatus(stored ? "Saved your AI key in this browser." : "Cleared your AI key.");
  };
  const onClearByok = () => {
    clearByokKey();
    setByokKeyState("");
    setByokDraft("");
    setStatus("Cleared your AI key.");
  };

  const onExport = async () => {
    const bundle = await exportAll();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mk-gitflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    track("result_exported", { feature: "settings" });
    setStatus("Exported your data as JSON.");
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const count = await importBundle(parsed);
        await refreshUsage();
        setStatus(`Imported ${count} record${count === 1 ? "" : "s"}.`);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Import failed.");
      }
    };
    reader.readAsText(file);
  };

  const onClear = async () => {
    setConfirmClear(false);
    await clearAll();
    await refreshUsage();
    setStatus("All local data cleared.");
  };

  if (!mounted) {
    return (
      <div className={CARD} aria-hidden="true">
        <div className="h-40 animate-pulse rounded-md bg-surface-raised" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status && (
        <p role="status" className="rounded-sm border border-border bg-surface-raised px-4 py-3 text-sm text-fg">
          {status}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className={CARD}>
          <RadioGroup
            legend="THEME"
            name="theme"
            value={theme}
            onChange={onTheme}
            options={[
              { value: "dark", label: "Dark", hint: "The blueprint default." },
              { value: "light", label: "Light", hint: "Paper blueprint." },
              { value: "system", label: "System", hint: "Follow your OS setting." },
            ]}
          />
        </div>
        <div className={CARD}>
          <RadioGroup
            legend="MOTION"
            name="motion"
            value={motion}
            onChange={onMotion}
            options={[
              { value: "system", label: "System", hint: "Respect your OS reduced-motion setting." },
              { value: "allow", label: "Always animate", hint: "Graph transitions play even if the OS reduces motion." },
              { value: "reduce", label: "Reduce motion", hint: "Render final states instantly, everywhere." },
            ]}
          />
        </div>
      </div>

      <div className={CARD}>
        <RadioGroup
          legend="ANALYTICS CONSENT"
          name="consent"
          value={consent === "unset" ? "denied" : consent}
          onChange={(v) => onConsent(v as "granted" | "denied")}
          options={[
            { value: "denied", label: "Declined (default)", hint: "No analytics scripts load. Nothing is sent." },
            { value: "granted", label: "Allow anonymous analytics", hint: "Loads Google Tag Manager only in production. Never sends command text, repo names, or keys." },
          ]}
        />
      </div>

      <div className={CARD}>
        <legend className="schematic-label text-fg-muted">HISTORY LOGGING</legend>
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-sm border border-border p-3 hover:bg-surface-raised">
          <input
            type="checkbox"
            checked={historyOff}
            onChange={(e) => onHistory(e.target.checked)}
            className="mt-0.5 accent-[var(--accent)]"
          />
          <span>
            <span className="block text-sm font-medium text-fg">Don&apos;t record new history</span>
            <span className="block text-xs text-fg-secondary">
              When on, new quiz attempts, analyses, and AI results are not saved. Simulator
              sessions and tutorial progress still save when you choose to. Existing history is
              kept until you clear it below.
            </span>
          </span>
        </label>
      </div>

      <div className={CARD}>
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-fg-muted" aria-hidden="true" />
          <span className="schematic-label text-fg-muted">YOUR AI KEY (BYOK)</span>
        </div>
        <p className="mt-2 text-sm text-fg-secondary">
          The AI assistant works without any setup where a deterministic result exists, and shows an
          honest &ldquo;AI unavailable&rdquo; state otherwise. To unlock the model-backed answers,
          add your own Vercel AI Gateway key.
        </p>
        <p className="mt-2 text-xs text-fg-muted">
          Your key is stored only in this browser and sent with each request in the{" "}
          <code className="text-fg-secondary">x-byok-key</code> header. It is never logged, stored on
          the server, or included in analytics.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="password"
            autoComplete="off"
            value={byokDraft}
            onChange={(e) => setByokDraft(e.target.value)}
            placeholder="Vercel AI Gateway key"
            aria-label="Your AI gateway key"
            className="min-h-11 w-full rounded-sm border border-border-strong bg-surface px-3 font-mono text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onSaveByok} disabled={byokDraft.trim() === byokKey}>
              {byokKey && byokDraft.trim() === "" ? "Remove key" : "Save key"}
            </Button>
            {byokKey && (
              <Button variant="ghost" onClick={onClearByok}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          {byokKey ? "A key is saved in this browser." : "No key saved. AI runs in degraded mode."}
        </p>
      </div>

      <div className={CARD}>
        <div className="flex items-center gap-2">
          <Database size={18} className="text-fg-muted" aria-hidden="true" />
          <span className="schematic-label text-fg-muted">STORAGE USAGE</span>
        </div>
        {usage && (
          <div className="mt-4 space-y-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Quiz attempts</dt>
                <dd className="font-mono tabular-nums text-fg">{usage.counts.quizAttempts}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Tutorials</dt>
                <dd className="font-mono tabular-nums text-fg">{usage.counts.tutorialProgress}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Sessions</dt>
                <dd className="font-mono tabular-nums text-fg">{usage.counts.simulatorSessions}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">Analyses</dt>
                <dd className="font-mono tabular-nums text-fg">{usage.counts.analyses}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">AI results</dt>
                <dd className="font-mono tabular-nums text-fg">{usage.counts.aiResults}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-secondary">On disk</dt>
                <dd className="font-mono tabular-nums text-fg">{formatBytes(usage.usageBytes)}</dd>
              </div>
            </dl>
            <p className="text-xs text-fg-muted">
              {usage.totalRecords} record{usage.totalRecords === 1 ? "" : "s"} total, stored only
              in this browser.
            </p>
          </div>
        )}
      </div>

      <div className={CARD}>
        <span className="schematic-label text-fg-muted">YOUR DATA</span>
        <p className="mt-2 text-sm text-fg-secondary">
          Everything lives in this browser. Export a JSON backup, import it on another device,
          or clear it all.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onExport}>
            <Download size={16} aria-hidden="true" /> Export data
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden="true" /> Import data
          </Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            <Trash2 size={16} aria-hidden="true" /> Clear all data
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onImport}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all local data?"
        description="This removes every quiz attempt, tutorial progress record, saved simulator session, cached analysis, and AI result from this browser."
        consequence="This cannot be undone. Export a backup first if you want to keep it."
        confirmLabel="Clear everything"
        onConfirm={onClear}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
