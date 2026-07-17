import { describe, expect, test } from "vitest";
import {
  getCommand,
  getRelated,
  REF_CATEGORIES,
  REFERENCE,
  type RefCommand,
} from "./reference";

describe("REFERENCE data set", () => {
  test("ships at least the 40 commands the spec requires", () => {
    // PRODUCT_SPEC §3.4: >= 40 commands.
    expect(REFERENCE.length).toBeGreaterThanOrEqual(40);
  });

  test("every command slug is unique", () => {
    const slugs = REFERENCE.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every command carries the required display fields", () => {
    for (const cmd of REFERENCE) {
      expect(cmd.name, cmd.slug).toBeTruthy();
      expect(cmd.summary, cmd.slug).toBeTruthy();
      expect(cmd.syntax, cmd.slug).toBeTruthy();
      expect(cmd.explanation.length, cmd.slug).toBeGreaterThan(20);
      expect(cmd.undo, cmd.slug).toBeTruthy();
      expect(cmd.examples.length, cmd.slug).toBeGreaterThan(0);
    }
  });

  test("every command belongs to a declared category", () => {
    for (const cmd of REFERENCE) {
      expect(REF_CATEGORIES, cmd.slug).toContain(cmd.category);
    }
  });

  test("every command uses a valid risk level", () => {
    const levels = new Set(["safe", "caution", "destructive"]);
    for (const cmd of REFERENCE) {
      expect(levels.has(cmd.risk), `${cmd.slug} risk=${cmd.risk}`).toBe(true);
    }
  });

  test("destructive commands document a consequence and a safer alternative", () => {
    // DESIGN_SYSTEM.md §9.3: destructive entries need the strong warning content.
    const destructive = REFERENCE.filter((c) => c.risk === "destructive");
    expect(destructive.length).toBeGreaterThan(0);
    for (const cmd of destructive) {
      expect(cmd.consequence, cmd.slug).toBeTruthy();
      expect(cmd.saferAlternative, cmd.slug).toBeTruthy();
    }
  });

  test("every related slug resolves to a real command", () => {
    const known = new Set(REFERENCE.map((c) => c.slug));
    for (const cmd of REFERENCE) {
      for (const rel of cmd.related) {
        expect(known.has(rel), `${cmd.slug} -> ${rel}`).toBe(true);
      }
    }
  });
});

describe("getCommand", () => {
  test("returns the command for a known slug", () => {
    const cmd = getCommand("git-gc");
    expect(cmd?.name).toBe("git gc");
  });

  test("returns undefined for an unknown slug", () => {
    expect(getCommand("git-does-not-exist")).toBeUndefined();
  });
});

describe("getRelated", () => {
  test("resolves related slugs into command objects", () => {
    const cmd = getCommand("git-gc") as RefCommand;
    const related = getRelated(cmd);
    expect(related.length).toBe(cmd.related.length);
    expect(related.every((c) => cmd.related.includes(c.slug))).toBe(true);
  });

  test("silently drops any related slug that does not resolve", () => {
    const fake: RefCommand = {
      slug: "fake",
      name: "fake",
      category: "Advanced",
      summary: "s",
      syntax: "x",
      explanation: "explanation long enough to be meaningful text",
      examples: [{ command: "x", note: "n" }],
      risk: "safe",
      undo: "none",
      related: ["git-gc", "totally-missing"],
    };
    expect(getRelated(fake).map((c) => c.slug)).toEqual(["git-gc"]);
  });
});
