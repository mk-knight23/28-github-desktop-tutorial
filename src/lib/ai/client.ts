/**
 * Browser client for the AI routes (STANDARDS §10).
 *
 * A thin, typed fetch wrapper. It attaches the optional BYOK header, supports
 * cancellation via an AbortSignal, and always resolves to the typed AiResponse
 * envelope — network and parse failures are mapped to a safe error shape rather
 * than throwing.
 */

import type { CapabilityInput } from "@/lib/ai/schemas";
import type { AiResponse, CapabilitySlug } from "@/lib/ai/types";

export interface CallOptions {
  /** User-provided gateway key; sent only as the x-byok-key header. */
  byokKey?: string;
  signal?: AbortSignal;
}

export async function callAi<S extends CapabilitySlug>(
  slug: S,
  input: CapabilityInput<S>,
  options: CallOptions = {},
): Promise<AiResponse<S>> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (options.byokKey) headers["x-byok-key"] = options.byokKey;

  try {
    const response = await fetch(`/api/ai/${slug}`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
      signal: options.signal,
    });

    const json: unknown = await response.json().catch(() => null);
    if (json && typeof json === "object" && "status" in json) {
      return json as AiResponse<S>;
    }
    return {
      status: "error",
      capability: slug,
      code: "upstream-error",
      message: "The server returned an unexpected response.",
    };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { status: "error", capability: slug, code: "cancelled", message: "Request cancelled." };
    }
    return {
      status: "error",
      capability: slug,
      code: "upstream-error",
      message: "Network error. Check your connection and try again.",
    };
  }
}
