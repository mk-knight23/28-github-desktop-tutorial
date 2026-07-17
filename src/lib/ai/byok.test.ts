import { afterEach, describe, expect, test } from "vitest";
import { clearByokKey, getByokKey, hasByokKey, setByokKey } from "./byok";

afterEach(() => {
  clearByokKey();
});

describe("BYOK key storage", () => {
  test("returns an empty string when nothing is stored", () => {
    expect(getByokKey()).toBe("");
    expect(hasByokKey()).toBe(false);
  });

  test("stores a key and reports it present", () => {
    setByokKey("sk-test-123");
    expect(getByokKey()).toBe("sk-test-123");
    expect(hasByokKey()).toBe(true);
  });

  test("trims surrounding whitespace before storing", () => {
    setByokKey("   sk-padded   ");
    expect(getByokKey()).toBe("sk-padded");
  });

  test("setting an empty (or whitespace) value clears the key", () => {
    setByokKey("sk-real");
    setByokKey("   ");
    expect(getByokKey()).toBe("");
    expect(hasByokKey()).toBe(false);
  });

  test("clearByokKey removes a stored key", () => {
    setByokKey("sk-real");
    clearByokKey();
    expect(hasByokKey()).toBe(false);
  });
});
