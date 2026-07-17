import { describe, expect, test } from "vitest";
import { getScenario, UNDO_SCENARIOS } from "./undo-scenarios";

describe("UNDO_SCENARIOS data set", () => {
  test("ships at least the eight entry scenarios the spec requires", () => {
    // PRODUCT_SPEC §3.7: >= 8 entry scenarios.
    expect(UNDO_SCENARIOS.length).toBeGreaterThanOrEqual(8);
  });

  test("every scenario slug is unique", () => {
    const slugs = UNDO_SCENARIOS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every scenario has symptom, detail, steps and a fallback", () => {
    for (const s of UNDO_SCENARIOS) {
      expect(s.title, s.slug).toBeTruthy();
      expect(s.symptom, s.slug).toBeTruthy();
      expect(s.detail, s.slug).toBeTruthy();
      expect(s.steps.length, s.slug).toBeGreaterThan(0);
      // The "if this doesn't match, safest next step" fallback is mandatory.
      expect(s.fallback, s.slug).toBeTruthy();
    }
  });

  test("destructive steps always state a consequence and a safer alternative", () => {
    // DESIGN_SYSTEM.md §9: destructive commands need the consequence line.
    let sawDestructive = false;
    for (const scenario of UNDO_SCENARIOS) {
      for (const step of scenario.steps) {
        if (step.risk === "destructive") {
          sawDestructive = true;
          expect(step.consequence, `${scenario.slug}: ${step.command}`).toBeTruthy();
          expect(step.saferAlternative, `${scenario.slug}: ${step.command}`).toBeTruthy();
        }
      }
    }
    expect(sawDestructive).toBe(true);
  });

  test("steps that carry a command use a valid risk level", () => {
    const levels = new Set(["safe", "caution", "destructive"]);
    for (const scenario of UNDO_SCENARIOS) {
      for (const step of scenario.steps) {
        if (step.command) {
          expect(step.risk, `${scenario.slug}: ${step.command}`).toBeDefined();
          expect(levels.has(step.risk as string)).toBe(true);
        }
      }
    }
  });

  test("every related slug resolves to a real scenario", () => {
    const known = new Set(UNDO_SCENARIOS.map((s) => s.slug));
    for (const scenario of UNDO_SCENARIOS) {
      for (const rel of scenario.related) {
        expect(known.has(rel), `${scenario.slug} -> ${rel}`).toBe(true);
      }
    }
  });
});

describe("getScenario", () => {
  test("returns a scenario for a known slug", () => {
    expect(getScenario("committed-wrong-branch")?.title).toMatch(/wrong branch/i);
  });

  test("returns undefined for an unknown slug", () => {
    expect(getScenario("not-a-scenario")).toBeUndefined();
  });
});
