import { describe, expect, test } from "vitest";
import { GITIGNORE_TEMPLATES, mergeTemplates } from "./gitignore-templates";

describe("gitignore templates", () => {
  test("ships at least 12 templates (PRODUCT_SPEC §3.5)", () => {
    expect(GITIGNORE_TEMPLATES.length).toBeGreaterThanOrEqual(12);
  });

  test("every template has a unique id", () => {
    const ids = GITIGNORE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("mergeTemplates", () => {
  test("returns empty string for no selection", () => {
    expect(mergeTemplates([])).toBe("");
  });

  test("emits a labeled section per template", () => {
    const out = mergeTemplates(["node", "macos"]);
    expect(out).toContain("### Node");
    expect(out).toContain("### macOS");
  });

  test("deduplicates a pattern shared across templates", () => {
    // Both Java and Gradle include build/ — it should appear once.
    const out = mergeTemplates(["java", "gradle"]);
    const occurrences = out.split("\n").filter((l) => l.trim() === "build/").length;
    expect(occurrences).toBe(1);
  });

  test("ignores unknown ids", () => {
    const out = mergeTemplates(["node", "does-not-exist"]);
    expect(out).toContain("### Node");
  });

  test("keeps node_modules for a Node selection", () => {
    expect(mergeTemplates(["node"])).toContain("node_modules/");
  });
});
