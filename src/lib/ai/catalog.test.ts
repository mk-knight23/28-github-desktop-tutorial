import { describe, expect, test } from "vitest";
import { CAPABILITY_SLUGS } from "@/lib/ai/types";
import { CAPABILITIES, getCapability } from "./catalog";

describe("CAPABILITIES catalog", () => {
  test("describes every capability slug exactly once", () => {
    const slugs = CAPABILITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.sort()).toEqual([...CAPABILITY_SLUGS].sort());
  });

  test("every entry has the UI copy the assistant renders", () => {
    for (const cap of CAPABILITIES) {
      expect(cap.title, cap.slug).toBeTruthy();
      expect(cap.blurb, cap.slug).toBeTruthy();
      expect(cap.label, cap.slug).toBeTruthy();
      expect(cap.degraded, cap.slug).toBeTruthy();
    }
  });

  test("every entry uses a known tier", () => {
    for (const cap of CAPABILITIES) {
      expect(["fast", "quality"]).toContain(cap.tier);
    }
  });

  test("the analytics label never leaks free text (short and human)", () => {
    for (const cap of CAPABILITIES) {
      expect(cap.label.length, cap.slug).toBeLessThanOrEqual(40);
    }
  });
});

describe("getCapability", () => {
  test("returns the metadata for a known slug", () => {
    expect(getCapability("nl-to-command").title).toBeTruthy();
  });

  test("throws for an unknown slug", () => {
    // @ts-expect-error deliberately passing an invalid slug
    expect(() => getCapability("mystery")).toThrow(/Unknown capability/);
  });

  test("fallback-backed capabilities point at a deterministic alternative", () => {
    for (const cap of CAPABILITIES) {
      if (cap.hasFallback) {
        expect(cap.degraded.toLowerCase(), cap.slug).not.toContain("no deterministic equivalent");
      }
    }
  });
});
