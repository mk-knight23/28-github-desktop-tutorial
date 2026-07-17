/**
 * Typed local-first storage (STANDARDS §1 / §4).
 *
 * All user-generated data lives in IndexedDB via the `idb` package behind this
 * single module. Tiny prefs (theme, motion, consent, history-disabled) live in
 * localStorage — see src/lib/site.ts PREF_KEYS.
 *
 * The module is SSR-safe: every call that touches IndexedDB first checks for a
 * browser environment and resolves to an inert default on the server.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { PREF_KEYS } from "@/lib/site";

const DB_NAME = "mk-gitflow";
const DB_VERSION = 1;

/* ------------------------------- record types ---------------------------- */

export interface QuizAttempt {
  /** Unique id (crypto.randomUUID). */
  id: string;
  topicId: string;
  topicTitle: string;
  score: number;
  total: number;
  /** questionId -> chosen option index. */
  answers: Record<string, number>;
  at: number;
}

export interface TutorialProgress {
  /** Tutorial id is the primary key. */
  tutorialId: string;
  path: "desktop" | "cli";
  level: "beginner" | "intermediate" | "advanced";
  title: string;
  completedSteps: string[];
  totalSteps: number;
  updatedAt: number;
}

export interface SimulatorSession {
  id: string;
  name: string;
  /** Command log lines, newest last. */
  log: string[];
  /** Serialized GitState (JSON). */
  stateJson: string;
  createdAt: number;
  updatedAt: number;
}

export interface AnalysisRecord {
  /** "owner/repo" is the primary key. */
  slug: string;
  score: number;
  grade: string;
  /** Full serialized analyzer result. */
  resultJson: string;
  at: number;
}

export interface AiResultRecord {
  id: string;
  capability: string;
  /** Short human label for the history list (never raw user input). */
  label: string;
  at: number;
}

interface GitFlowDB extends DBSchema {
  quizAttempts: { key: string; value: QuizAttempt; indexes: { "by-at": number } };
  tutorialProgress: { key: string; value: TutorialProgress };
  simulatorSessions: { key: string; value: SimulatorSession; indexes: { "by-at": number } };
  analyses: { key: string; value: AnalysisRecord; indexes: { "by-at": number } };
  aiResults: { key: string; value: AiResultRecord; indexes: { "by-at": number } };
}

const ALL_STORES = [
  "quizAttempts",
  "tutorialProgress",
  "simulatorSessions",
  "analyses",
  "aiResults",
] as const;

type StoreName = (typeof ALL_STORES)[number];

/* --------------------------------- helpers ------------------------------- */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

let dbPromise: Promise<IDBPDatabase<GitFlowDB>> | null = null;

function getDB(): Promise<IDBPDatabase<GitFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GitFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const quiz = db.createObjectStore("quizAttempts", { keyPath: "id" });
        quiz.createIndex("by-at", "at");
        db.createObjectStore("tutorialProgress", { keyPath: "tutorialId" });
        const sessions = db.createObjectStore("simulatorSessions", { keyPath: "id" });
        sessions.createIndex("by-at", "updatedAt");
        const analyses = db.createObjectStore("analyses", { keyPath: "slug" });
        analyses.createIndex("by-at", "at");
        const ai = db.createObjectStore("aiResults", { keyPath: "id" });
        ai.createIndex("by-at", "at");
      },
    });
  }
  return dbPromise;
}

/** History logging can be disabled from /settings (STANDARDS §4). */
export function isHistoryDisabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PREF_KEYS.historyDisabled) === "true";
  } catch {
    return false;
  }
}

export function setHistoryDisabled(disabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREF_KEYS.historyDisabled, disabled ? "true" : "false");
  } catch {
    // Private mode — pref simply won't persist.
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

/* ------------------------------ quiz attempts ---------------------------- */

/** Records an attempt unless history logging is off. Returns the stored id or null. */
export async function recordQuizAttempt(
  attempt: Omit<QuizAttempt, "id" | "at">,
): Promise<string | null> {
  if (!isBrowser() || isHistoryDisabled()) return null;
  const record: QuizAttempt = { ...attempt, id: newId(), at: Date.now() };
  const db = await getDB();
  await db.put("quizAttempts", record);
  return record.id;
}

export async function listQuizAttempts(): Promise<QuizAttempt[]> {
  if (!isBrowser()) return [];
  const db = await getDB();
  const all = await db.getAllFromIndex("quizAttempts", "by-at");
  return all.reverse();
}

/* --------------------------- tutorial progress --------------------------- */

export async function getTutorialProgress(
  tutorialId: string,
): Promise<TutorialProgress | undefined> {
  if (!isBrowser()) return undefined;
  const db = await getDB();
  return db.get("tutorialProgress", tutorialId);
}

export async function listTutorialProgress(): Promise<TutorialProgress[]> {
  if (!isBrowser()) return [];
  const db = await getDB();
  return db.getAll("tutorialProgress");
}

export async function saveTutorialProgress(
  progress: Omit<TutorialProgress, "updatedAt">,
): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDB();
  await db.put("tutorialProgress", { ...progress, updatedAt: Date.now() });
}

/* -------------------------- simulator sessions --------------------------- */

export async function saveSimulatorSession(
  session: Omit<SimulatorSession, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: number;
  },
): Promise<string> {
  const now = Date.now();
  const id = session.id ?? newId();
  const record: SimulatorSession = {
    id,
    name: session.name,
    log: session.log,
    stateJson: session.stateJson,
    createdAt: session.createdAt ?? now,
    updatedAt: now,
  };
  if (!isBrowser()) return id;
  const db = await getDB();
  await db.put("simulatorSessions", record);
  return id;
}

export async function listSimulatorSessions(): Promise<SimulatorSession[]> {
  if (!isBrowser()) return [];
  const db = await getDB();
  const all = await db.getAllFromIndex("simulatorSessions", "by-at");
  return all.reverse();
}

export async function deleteSimulatorSession(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDB();
  await db.delete("simulatorSessions", id);
}

/* ----------------------------- analyzer cache ---------------------------- */

export async function cacheAnalysis(record: Omit<AnalysisRecord, "at">): Promise<void> {
  if (!isBrowser() || isHistoryDisabled()) return;
  const db = await getDB();
  await db.put("analyses", { ...record, at: Date.now() });
}

export async function getCachedAnalysis(slug: string): Promise<AnalysisRecord | undefined> {
  if (!isBrowser()) return undefined;
  const db = await getDB();
  return db.get("analyses", slug);
}

export async function listAnalyses(): Promise<AnalysisRecord[]> {
  if (!isBrowser()) return [];
  const db = await getDB();
  const all = await db.getAllFromIndex("analyses", "by-at");
  return all.reverse();
}

/* ------------------------------- AI results ------------------------------ */

export async function recordAiResult(
  record: Omit<AiResultRecord, "id" | "at">,
): Promise<string | null> {
  if (!isBrowser() || isHistoryDisabled()) return null;
  const stored: AiResultRecord = { ...record, id: newId(), at: Date.now() };
  const db = await getDB();
  await db.put("aiResults", stored);
  return stored.id;
}

export async function listAiResults(): Promise<AiResultRecord[]> {
  if (!isBrowser()) return [];
  const db = await getDB();
  const all = await db.getAllFromIndex("aiResults", "by-at");
  return all.reverse();
}

/* ------------------------ export / import / clear ------------------------ */

export interface ExportBundle {
  app: "mk-gitflow";
  version: number;
  exportedAt: number;
  data: {
    quizAttempts: QuizAttempt[];
    tutorialProgress: TutorialProgress[];
    simulatorSessions: SimulatorSession[];
    analyses: AnalysisRecord[];
    aiResults: AiResultRecord[];
  };
}

export async function exportAll(): Promise<ExportBundle> {
  const empty: ExportBundle = {
    app: "mk-gitflow",
    version: DB_VERSION,
    exportedAt: Date.now(),
    data: {
      quizAttempts: [],
      tutorialProgress: [],
      simulatorSessions: [],
      analyses: [],
      aiResults: [],
    },
  };
  if (!isBrowser()) return empty;
  const db = await getDB();
  const [quizAttempts, tutorialProgress, simulatorSessions, analyses, aiResults] =
    await Promise.all([
      db.getAll("quizAttempts"),
      db.getAll("tutorialProgress"),
      db.getAll("simulatorSessions"),
      db.getAll("analyses"),
      db.getAll("aiResults"),
    ]);
  return {
    ...empty,
    data: { quizAttempts, tutorialProgress, simulatorSessions, analyses, aiResults },
  };
}

/** Validate then merge an imported bundle. Returns the number of records written. */
export async function importBundle(bundle: unknown): Promise<number> {
  if (!isBrowser()) return 0;
  if (
    typeof bundle !== "object" ||
    bundle === null ||
    (bundle as ExportBundle).app !== "mk-gitflow" ||
    typeof (bundle as ExportBundle).data !== "object"
  ) {
    throw new Error("This file is not a MK GitFlow export.");
  }
  const data = (bundle as ExportBundle).data;
  const db = await getDB();
  let count = 0;
  const tx = db.transaction(ALL_STORES, "readwrite");
  for (const record of data.quizAttempts ?? []) {
    await tx.objectStore("quizAttempts").put(record);
    count += 1;
  }
  for (const record of data.tutorialProgress ?? []) {
    await tx.objectStore("tutorialProgress").put(record);
    count += 1;
  }
  for (const record of data.simulatorSessions ?? []) {
    await tx.objectStore("simulatorSessions").put(record);
    count += 1;
  }
  for (const record of data.analyses ?? []) {
    await tx.objectStore("analyses").put(record);
    count += 1;
  }
  for (const record of data.aiResults ?? []) {
    await tx.objectStore("aiResults").put(record);
    count += 1;
  }
  await tx.done;
  return count;
}

export async function clearAll(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDB();
  const tx = db.transaction(ALL_STORES, "readwrite");
  await Promise.all(ALL_STORES.map((store) => tx.objectStore(store).clear()));
  await tx.done;
}

export interface StorageUsage {
  /** Records per store. */
  counts: Record<StoreName, number>;
  totalRecords: number;
  /** Best-effort bytes used by the origin, when the browser exposes it. */
  usageBytes: number | null;
  quotaBytes: number | null;
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const counts = {
    quizAttempts: 0,
    tutorialProgress: 0,
    simulatorSessions: 0,
    analyses: 0,
    aiResults: 0,
  } as Record<StoreName, number>;
  let usageBytes: number | null = null;
  let quotaBytes: number | null = null;
  if (isBrowser()) {
    const db = await getDB();
    for (const store of ALL_STORES) {
      counts[store] = await db.count(store);
    }
    if (navigator.storage && typeof navigator.storage.estimate === "function") {
      try {
        const est = await navigator.storage.estimate();
        usageBytes = est.usage ?? null;
        quotaBytes = est.quota ?? null;
      } catch {
        // estimate() unsupported — leave nulls.
      }
    }
  }
  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, totalRecords, usageBytes, quotaBytes };
}
