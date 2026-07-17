/**
 * Shared POST handler for every AI capability (STANDARDS §8 / §10).
 *
 * SERVER-ONLY. Pipeline: rate limit → body-size guard → JSON parse → zod
 * validate → availability/auth resolve → generateObject → typed response.
 *
 * Privacy guarantees enforced here:
 *   - Request content is NEVER logged (there are no logging calls on any path).
 *   - The BYOK key is read from the `x-byok-key` header only, used to build a
 *     one-off gateway, and never stored, cached, echoed, or logged.
 *   - Error responses use coarse codes and fixed messages that leak no upstream
 *     or input detail.
 */

import { APICallError, generateObject, NoObjectGeneratedError } from "ai";
import { getCapability } from "@/lib/ai/catalog";
import { INPUT_SCHEMAS } from "@/lib/ai/schemas";
import type { AiErrorCode, CapabilitySlug } from "@/lib/ai/types";
import { OUTPUT_SCHEMAS } from "@/lib/ai/server/output-schemas";
import { PROMPTS } from "@/lib/ai/server/prompts";
import { resolveModel, serverGatewayAvailable } from "@/lib/ai/server/models";
import { checkRateLimit } from "@/lib/ai/server/rate-limit";

/** Reject bodies larger than this before parsing (chars ≈ bytes for our text). */
const MAX_BODY_BYTES = 64 * 1024;
const TEMPERATURE = 0.3;
const MAX_OUTPUT_TOKENS = 2_000;

const HTTP_STATUS: Record<AiErrorCode, number> = {
  "invalid-input": 400,
  "rate-limited": 429,
  "quota-exceeded": 429,
  unavailable: 503,
  cancelled: 499,
  "upstream-error": 502,
  "bad-output": 502,
};

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function errorResponse(
  capability: string,
  code: AiErrorCode,
  message: string,
  retryAfter?: number,
): Response {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (retryAfter !== undefined) headers["retry-after"] = String(retryAfter);
  return new Response(
    JSON.stringify({ status: "error", capability, code, message, retryAfter }),
    { status: HTTP_STATUS[code], headers },
  );
}

export async function handleAiRequest(
  slug: CapabilitySlug,
  request: Request,
): Promise<Response> {
  const ip = clientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    const message =
      limit.reason === "daily"
        ? "You've reached today's request limit for this instance. Try again tomorrow, or add your own key in Settings."
        : "Too many requests in a short time. Wait a moment and try again.";
    return errorResponse(slug, limit.reason === "daily" ? "quota-exceeded" : "rate-limited", message, limit.retryAfter);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(slug, "invalid-input", "That input is too large. Please shorten it.");
  }

  const byokKey = request.headers.get("x-byok-key")?.trim() || undefined;
  if (!byokKey && !serverGatewayAvailable()) {
    return errorResponse(
      slug,
      "unavailable",
      "AI is not configured on this instance. Add your own key in Settings, or use the deterministic tools.",
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(slug, "invalid-input", "The request body must be valid JSON.");
  }

  const parsed = INPUT_SCHEMAS[slug].safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "The input didn't pass validation.";
    return errorResponse(slug, "invalid-input", message);
  }

  const meta = getCapability(slug);
  const { model, modelId } = resolveModel(meta.tier, byokKey);
  const { system, prompt } = PROMPTS[slug](parsed.data as never);

  try {
    const { object } = await generateObject({
      model,
      schema: OUTPUT_SCHEMAS[slug],
      system,
      prompt,
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      maxRetries: 1,
      abortSignal: request.signal,
    });

    return new Response(
      JSON.stringify({ status: "ok", capability: slug, model: modelId, data: object }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  } catch (error: unknown) {
    return mapGenerationError(slug, error);
  }
}

function mapGenerationError(slug: CapabilitySlug, error: unknown): Response {
  if (error instanceof DOMException && error.name === "AbortError") {
    return errorResponse(slug, "cancelled", "Request cancelled.");
  }
  if (NoObjectGeneratedError.isInstance(error)) {
    return errorResponse(
      slug,
      "bad-output",
      "The model returned an answer that didn't fit the expected format. Try rephrasing.",
    );
  }
  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    if (status === 401 || status === 403) {
      return errorResponse(
        slug,
        "unavailable",
        "The AI credentials were rejected. Check your key in Settings.",
      );
    }
    if (status === 429) {
      return errorResponse(
        slug,
        "rate-limited",
        "The AI gateway is rate-limiting requests right now. Try again shortly.",
      );
    }
    return errorResponse(slug, "upstream-error", "The AI service is temporarily unavailable.");
  }
  return errorResponse(slug, "upstream-error", "Something went wrong generating a response.");
}
