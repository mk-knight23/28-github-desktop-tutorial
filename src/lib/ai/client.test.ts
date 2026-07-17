import { afterEach, describe, expect, test, vi } from "vitest";
import { callAi } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown) {
  return { json: async () => body };
}

describe("callAi", () => {
  test("posts to the capability route and returns a well-formed envelope", async () => {
    const success = { status: "success", capability: "nl-to-command", data: { command: "git status" } };
    const fetchSpy = vi.fn(async () => jsonResponse(success));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await callAi("nl-to-command", { text: "show status" });

    expect(result).toEqual(success);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/ai/nl-to-command",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("attaches the BYOK key only as the x-byok-key header", async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ status: "success" }));
    vi.stubGlobal("fetch", fetchSpy);

    await callAi("nl-to-command", { text: "x" }, { byokKey: "sk-user" });

    const init = (fetchSpy.mock.calls[0] as unknown[])[1] as RequestInit;
    expect((init.headers as Record<string, string>)["x-byok-key"]).toBe("sk-user");
    expect(init.body as string).not.toContain("sk-user");
  });

  test("omits the BYOK header when no key is given", async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ status: "success" }));
    vi.stubGlobal("fetch", fetchSpy);

    await callAi("nl-to-command", { text: "x" });

    const init = (fetchSpy.mock.calls[0] as unknown[])[1] as RequestInit;
    expect((init.headers as Record<string, string>)["x-byok-key"]).toBeUndefined();
  });

  test("maps an unexpected response shape to an upstream error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ nope: true })));

    const result = await callAi("nl-to-command", { text: "x" });

    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("upstream-error");
  });

  test("maps a thrown network error to an upstream error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );

    const result = await callAi("nl-to-command", { text: "x" });

    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("upstream-error");
  });

  test("maps an aborted request to a cancelled error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("aborted", "AbortError");
      }),
    );

    const result = await callAi("nl-to-command", { text: "x" });

    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("cancelled");
  });
});
