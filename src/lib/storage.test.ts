import "fake-indexeddb/auto";
import { beforeEach, describe, expect, test } from "vitest";
import {
  cacheAnalysis,
  clearAll,
  exportAll,
  getCachedAnalysis,
  getStorageUsage,
  getTutorialProgress,
  importBundle,
  isHistoryDisabled,
  listAiResults,
  listAnalyses,
  listQuizAttempts,
  listSimulatorSessions,
  listTutorialProgress,
  newId,
  recordAiResult,
  recordQuizAttempt,
  saveSimulatorSession,
  saveTutorialProgress,
  setHistoryDisabled,
  deleteSimulatorSession,
} from "./storage";

describe("newId", () => {
  test("returns distinct ids on each call", () => {
    const a = newId();
    const b = newId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });
});

describe("history preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("logging is enabled by default", () => {
    expect(isHistoryDisabled()).toBe(false);
  });

  test("can be turned off and back on", () => {
    setHistoryDisabled(true);
    expect(isHistoryDisabled()).toBe(true);
    setHistoryDisabled(false);
    expect(isHistoryDisabled()).toBe(false);
  });
});

describe("quiz attempts", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("records an attempt and lists it back", async () => {
    // Act
    const id = await recordQuizAttempt({
      topicId: "branching",
      topicTitle: "Branching",
      score: 7,
      total: 8,
      answers: { q1: 0, q2: 1 },
    });

    // Assert
    expect(id).toBeTruthy();
    const attempts = await listQuizAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].topicId).toBe("branching");
    expect(attempts[0].score).toBe(7);
  });

  test("lists attempts newest first", async () => {
    // Arrange
    await recordQuizAttempt({ topicId: "a", topicTitle: "A", score: 1, total: 8, answers: {} });
    await recordQuizAttempt({ topicId: "b", topicTitle: "B", score: 2, total: 8, answers: {} });

    // Act
    const attempts = await listQuizAttempts();

    // Assert: most recent record leads.
    expect(attempts[0].topicId).toBe("b");
    expect(attempts[1].topicId).toBe("a");
  });

  test("does not record when history logging is disabled", async () => {
    // Arrange
    setHistoryDisabled(true);

    // Act
    const id = await recordQuizAttempt({
      topicId: "x",
      topicTitle: "X",
      score: 0,
      total: 8,
      answers: {},
    });

    // Assert
    expect(id).toBeNull();
    expect(await listQuizAttempts()).toHaveLength(0);
  });
});

describe("tutorial progress", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("saves progress and reads it back by id", async () => {
    // Act
    await saveTutorialProgress({
      tutorialId: "cli-beginner",
      path: "cli",
      level: "beginner",
      title: "CLI Basics",
      completedSteps: ["s1"],
      totalSteps: 5,
    });

    // Assert
    const progress = await getTutorialProgress("cli-beginner");
    expect(progress?.completedSteps).toEqual(["s1"]);
    expect(progress?.updatedAt).toBeTypeOf("number");
  });

  test("overwrites progress for the same tutorial id", async () => {
    // Arrange
    await saveTutorialProgress({
      tutorialId: "cli-beginner",
      path: "cli",
      level: "beginner",
      title: "CLI Basics",
      completedSteps: ["s1"],
      totalSteps: 5,
    });

    // Act
    await saveTutorialProgress({
      tutorialId: "cli-beginner",
      path: "cli",
      level: "beginner",
      title: "CLI Basics",
      completedSteps: ["s1", "s2"],
      totalSteps: 5,
    });

    // Assert: a single record, updated in place.
    const all = await listTutorialProgress();
    expect(all).toHaveLength(1);
    expect(all[0].completedSteps).toEqual(["s1", "s2"]);
  });
});

describe("simulator sessions", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("creates a session with a generated id", async () => {
    // Act
    const id = await saveSimulatorSession({
      name: "demo",
      log: ["$ git init"],
      stateJson: "{}",
    });

    // Assert
    expect(id).toBeTruthy();
    const sessions = await listSimulatorSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].name).toBe("demo");
  });

  test("updating an existing session keeps the passed created time and refreshes updatedAt", async () => {
    // Arrange
    const id = await saveSimulatorSession({ name: "demo", log: [], stateJson: "{}" });
    const created = (await listSimulatorSessions())[0].createdAt;

    // Act: re-save under the same id, carrying the original createdAt forward.
    await saveSimulatorSession({
      id,
      createdAt: created,
      name: "renamed",
      log: ["$ git status"],
      stateJson: "{}",
    });

    // Assert: one record, renamed, createdAt preserved, updatedAt not before it.
    const sessions = await listSimulatorSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].name).toBe("renamed");
    expect(sessions[0].createdAt).toBe(created);
    expect(sessions[0].updatedAt).toBeGreaterThanOrEqual(created);
  });

  test("deletes a session by id", async () => {
    // Arrange
    const id = await saveSimulatorSession({ name: "demo", log: [], stateJson: "{}" });

    // Act
    await deleteSimulatorSession(id);

    // Assert
    expect(await listSimulatorSessions()).toHaveLength(0);
  });
});

describe("analyzer cache", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("caches an analysis and reads it back by slug", async () => {
    // Act
    await cacheAnalysis({ slug: "vercel/next.js", score: 92, grade: "A", resultJson: "{}" });

    // Assert
    const cached = await getCachedAnalysis("vercel/next.js");
    expect(cached?.score).toBe(92);
    expect(cached?.grade).toBe("A");
  });

  test("does not cache when history logging is disabled", async () => {
    // Arrange
    setHistoryDisabled(true);

    // Act
    await cacheAnalysis({ slug: "a/b", score: 1, grade: "F", resultJson: "{}" });

    // Assert
    expect(await getCachedAnalysis("a/b")).toBeUndefined();
    expect(await listAnalyses()).toHaveLength(0);
  });
});

describe("ai results", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("records a result label and lists it back", async () => {
    // Act
    const id = await recordAiResult({ capability: "nl-to-command", label: "undo last commit" });

    // Assert
    expect(id).toBeTruthy();
    const results = await listAiResults();
    expect(results).toHaveLength(1);
    expect(results[0].capability).toBe("nl-to-command");
  });

  test("does not record when history logging is disabled", async () => {
    setHistoryDisabled(true);
    const id = await recordAiResult({ capability: "explain-error", label: "x" });
    expect(id).toBeNull();
  });
});

describe("export / import / clear", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("exports the current data as a versioned bundle", async () => {
    // Arrange
    await recordQuizAttempt({ topicId: "a", topicTitle: "A", score: 1, total: 8, answers: {} });

    // Act
    const bundle = await exportAll();

    // Assert
    expect(bundle.app).toBe("mk-gitflow");
    expect(bundle.version).toBeTypeOf("number");
    expect(bundle.data.quizAttempts).toHaveLength(1);
  });

  test("imports a valid bundle and returns the number of records written", async () => {
    // Arrange
    await recordQuizAttempt({ topicId: "a", topicTitle: "A", score: 1, total: 8, answers: {} });
    const bundle = await exportAll();
    await clearAll();

    // Act
    const written = await importBundle(bundle);

    // Assert
    expect(written).toBe(1);
    expect(await listQuizAttempts()).toHaveLength(1);
  });

  test("rejects a file that is not a MK GitFlow export", async () => {
    // Act / Assert
    await expect(importBundle({ app: "something-else" })).rejects.toThrow(
      /not a MK GitFlow export/i,
    );
  });

  test("clearAll removes every stored record", async () => {
    // Arrange
    await recordQuizAttempt({ topicId: "a", topicTitle: "A", score: 1, total: 8, answers: {} });
    await saveTutorialProgress({
      tutorialId: "t",
      path: "cli",
      level: "beginner",
      title: "T",
      completedSteps: [],
      totalSteps: 5,
    });

    // Act
    await clearAll();

    // Assert
    expect(await listQuizAttempts()).toHaveLength(0);
    expect(await listTutorialProgress()).toHaveLength(0);
  });
});

describe("getStorageUsage", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await clearAll();
  });

  test("counts records across every store", async () => {
    // Arrange
    await recordQuizAttempt({ topicId: "a", topicTitle: "A", score: 1, total: 8, answers: {} });
    await recordAiResult({ capability: "nl-to-command", label: "x" });

    // Act
    const usage = await getStorageUsage();

    // Assert
    expect(usage.counts.quizAttempts).toBe(1);
    expect(usage.counts.aiResults).toBe(1);
    expect(usage.totalRecords).toBe(2);
  });
});
