import { describe, expect, test } from "vitest";
import { CAPABILITY_SLUGS } from "@/lib/ai/types";
import {
  INPUT_LIMITS,
  INPUT_SCHEMAS,
  nlToCommandInput,
  rebasePlanInput,
  releaseNotesInput,
} from "./schemas";

describe("INPUT_SCHEMAS registry", () => {
  test("has a schema for every capability slug", () => {
    for (const slug of CAPABILITY_SLUGS) {
      expect(INPUT_SCHEMAS[slug], slug).toBeDefined();
    }
  });

  test("has no extra schemas beyond the known slugs", () => {
    expect(Object.keys(INPUT_SCHEMAS).sort()).toEqual([...CAPABILITY_SLUGS].sort());
  });
});

describe("nlToCommandInput", () => {
  test("accepts a description and trims it", () => {
    const parsed = nlToCommandInput.parse({ text: "  undo my last commit  " });
    expect(parsed.text).toBe("undo my last commit");
  });

  test("accepts an optional surface enum", () => {
    expect(nlToCommandInput.parse({ text: "x", surface: "cli" }).surface).toBe("cli");
  });

  test("rejects an unknown surface value", () => {
    expect(nlToCommandInput.safeParse({ text: "x", surface: "gui" }).success).toBe(false);
  });

  test("rejects an empty or whitespace-only description", () => {
    expect(nlToCommandInput.safeParse({ text: "" }).success).toBe(false);
    expect(nlToCommandInput.safeParse({ text: "    " }).success).toBe(false);
  });

  test("rejects text over the short-text limit", () => {
    const tooLong = "a".repeat(INPUT_LIMITS.shortText + 1);
    expect(nlToCommandInput.safeParse({ text: tooLong }).success).toBe(false);
  });

  test("accepts text exactly at the limit", () => {
    const atLimit = "a".repeat(INPUT_LIMITS.shortText);
    expect(nlToCommandInput.safeParse({ text: atLimit }).success).toBe(true);
  });
});

describe("optional fields", () => {
  test("rebasePlanInput allows omitting branches", () => {
    expect(rebasePlanInput.safeParse({ goal: "linear history" }).success).toBe(true);
  });

  test("releaseNotesInput allows omitting the version", () => {
    expect(releaseNotesInput.safeParse({ commits: "feat: a\nfix: b" }).success).toBe(true);
  });

  test("releaseNotesInput rejects an over-long version tag", () => {
    const parsed = releaseNotesInput.safeParse({ commits: "feat: a", version: "v".repeat(41) });
    expect(parsed.success).toBe(false);
  });
});
