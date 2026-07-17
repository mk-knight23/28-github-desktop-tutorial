import { describe, expect, test } from "vitest";
import { makeSha } from "./sha";

describe("makeSha", () => {
  test("produces a 7-character lowercase hex id", () => {
    const sha = makeSha(1, "initial commit", []);
    expect(sha).toHaveLength(7);
    expect(sha).toMatch(/^[0-9a-f]{7}$/);
  });

  test("is deterministic for identical inputs", () => {
    const a = makeSha(3, "add login", ["abc1234"]);
    const b = makeSha(3, "add login", ["abc1234"]);
    expect(a).toBe(b);
  });

  test("changes when the sequence number changes", () => {
    const first = makeSha(1, "same message", []);
    const second = makeSha(2, "same message", []);
    expect(first).not.toBe(second);
  });

  test("changes when the message changes", () => {
    const a = makeSha(1, "fix bug", []);
    const b = makeSha(1, "fix typo", []);
    expect(a).not.toBe(b);
  });

  test("changes when the parents change", () => {
    const a = makeSha(5, "merge", ["aaaaaaa"]);
    const b = makeSha(5, "merge", ["bbbbbbb"]);
    expect(a).not.toBe(b);
  });

  test("distinguishes one parent from two (merge commits)", () => {
    const single = makeSha(9, "merge feature", ["1111111"]);
    const merge = makeSha(9, "merge feature", ["1111111", "2222222"]);
    expect(single).not.toBe(merge);
  });

  test("stays unique across a realistic run of sequential commits", () => {
    const ids = new Set<string>();
    for (let seq = 0; seq < 200; seq += 1) {
      ids.add(makeSha(seq, `commit ${seq}`, seq === 0 ? [] : [`p${seq - 1}`]));
    }
    // Collisions in a 7-char space are possible but should not appear at this size.
    expect(ids.size).toBe(200);
  });
});
