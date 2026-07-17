import { describe, expect, test } from "vitest";
import {
  getTutorial,
  LEVEL_LABEL,
  PATH_LABEL,
  TUTORIALS,
  type TutorialLevel,
  type TutorialPath,
} from "./tutorials";

describe("TUTORIALS data set", () => {
  test("ships at least the six tutorials the spec requires", () => {
    // PRODUCT_SPEC §3.2: >= 6 tutorials at launch.
    expect(TUTORIALS.length).toBeGreaterThanOrEqual(6);
  });

  test("covers every path and level combination", () => {
    const paths: TutorialPath[] = ["desktop", "cli"];
    const levels: TutorialLevel[] = ["beginner", "intermediate", "advanced"];
    for (const path of paths) {
      for (const level of levels) {
        const match = TUTORIALS.some((t) => t.path === path && t.level === level);
        expect(match, `${path}/${level}`).toBe(true);
      }
    }
  });

  test("every tutorial id is unique", () => {
    const ids = TUTORIALS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every tutorial has at least five steps with checkpoints", () => {
    for (const tut of TUTORIALS) {
      expect(tut.steps.length, tut.id).toBeGreaterThanOrEqual(5);
      for (const step of tut.steps) {
        expect(step.title, `${tut.id}/${step.id}`).toBeTruthy();
        expect(step.body, `${tut.id}/${step.id}`).toBeTruthy();
        expect(step.checkpoint, `${tut.id}/${step.id}`).toBeTruthy();
      }
    }
  });

  test("step ids are unique within each tutorial", () => {
    for (const tut of TUTORIALS) {
      const stepIds = tut.steps.map((s) => s.id);
      expect(new Set(stepIds).size, tut.id).toBe(stepIds.length);
    }
  });

  test("CLI tutorials attach a command to at least one step", () => {
    const cliTutorials = TUTORIALS.filter((t) => t.path === "cli");
    for (const tut of cliTutorials) {
      expect(tut.steps.some((s) => Boolean(s.command)), tut.id).toBe(true);
    }
  });

  test("estimated minutes are positive", () => {
    for (const tut of TUTORIALS) {
      expect(tut.minutes, tut.id).toBeGreaterThan(0);
    }
  });

  test("exposes human-readable labels for every path and level", () => {
    expect(PATH_LABEL.desktop).toBeTruthy();
    expect(PATH_LABEL.cli).toBeTruthy();
    expect(LEVEL_LABEL.beginner).toBeTruthy();
    expect(LEVEL_LABEL.intermediate).toBeTruthy();
    expect(LEVEL_LABEL.advanced).toBeTruthy();
  });
});

describe("getTutorial", () => {
  test("returns a tutorial for a known id", () => {
    const known = TUTORIALS[0];
    expect(getTutorial(known.id)?.id).toBe(known.id);
  });

  test("returns undefined for an unknown id", () => {
    expect(getTutorial("no-such-tutorial")).toBeUndefined();
  });
});
