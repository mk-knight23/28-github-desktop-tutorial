"use client";

/**
 * Settings (PRODUCT_SPEC §5 / STANDARDS §4): theme, reduced-motion override,
 * analytics consent, history logging toggle, storage usage, and
 * export / import / clear-all for all local data. Everything is local-first.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload, Trash2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshUsage = useCallback(async () => {
    setUsage(await getStorageUsage());
  }, []);

  useEffect(() => {
    setMounted(true);
    setTheme(getThemePref());
    setMotion(getMotionPref());
    setConsentState(getConsent());
    setHistoryOff(isHistoryDisabled());
    void refreshUsage();
  }, [refreshUsage]);

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
