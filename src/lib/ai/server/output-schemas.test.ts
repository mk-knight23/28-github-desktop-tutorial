import { describe, expect, test } from "vitest";
import { CAPABILITY_SLUGS } from "@/lib/ai/types";
import { nlToCommandOutput, OUTPUT_SCHEMAS, releaseNotesOutput } from "./output-schemas";

describe("OUTPUT_SCHEMAS registry", () => {
  test("has an output schema for every capability slug", () => {
    for (const slug of CAPABILITY_SLUGS) {
      expect(OUTPUT_SCHEMAS[slug], slug).toBeDefined();
    }
  });

  test("has no extra schemas beyond the known slugs", () => {
    expect(Object.keys(OUTPUT_SCHEMAS).sort()).toEqual([...CAPABILITY_SLUGS].sort());
  });
});

describe("nlToCommandOutput", () => {
  const valid = {
    command: "git reset --hard HEAD~1",
    explanation: "Moves the branch back one commit and discards changes.",
    riskLevel: "destructive" as const,
    destructiveWarning: "Permanently discards uncommitted work.",
    saferAlternative: "git reset --soft HEAD~1",
    undoGuidance: "Recover the commit from git reflog.",
  };

  test("parses a complete destructive result", () => {
    expect(nlToCommandOutput.parse(valid)).toMatchObject({ riskLevel: "destructive" });
  });

  test("accepts null for the nullable warning and alternative", () => {
    const safe = { ...valid, riskLevel: "safe" as const, destructiveWarning: null, saferAlternative: null };
    expect(nlToCommandOutput.safeParse(safe).success).toBe(true);
  });

  test("rejects an invalid risk level", () => {
    expect(nlToCommandOutput.safeParse({ ...valid, riskLevel: "dangerous" }).success).toBe(false);
  });

  test("rejects a missing required field", () => {
    const rest: Partial<typeof valid> = { ...valid };
    delete rest.undoGuidance;
    expect(nlToCommandOutput.safeParse(rest).success).toBe(false);
  });
});

describe("releaseNotesOutput", () => {
  test("parses grouped sections and markdown", () => {
    const parsed = releaseNotesOutput.parse({
      version: "v2.0.0",
      highlights: ["New simulator"],
      sections: [{ title: "Features", entries: ["Add analyzer"] }],
      markdown: "# v2.0.0\n- Add analyzer",
    });
    expect(parsed.sections[0].entries).toContain("Add analyzer");
  });

  test("accepts a null version", () => {
    const parsed = releaseNotesOutput.safeParse({
      version: null,
      highlights: [],
      sections: [],
      markdown: "notes",
    });
    expect(parsed.success).toBe(true);
  });
});
