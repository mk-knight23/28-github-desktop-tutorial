/**
 * Model resolution for the AI gateway (STANDARDS §10).
 *
 * SERVER-ONLY: imports the `ai` SDK. Models are gateway model strings so the
 * exact slug is a config change, never a code change:
 *   AI_MODEL          default anthropic/claude-haiku-4.5   (fast tier)
 *   AI_MODEL_QUALITY  default anthropic/claude-sonnet-4-5  (quality tier)
 *
 * Auth precedence:
 *   1. BYOK — a per-request key from the `x-byok-key` header. Used to build a
 *      one-off gateway instance; the key is never stored, cached, or logged.
 *   2. Server credentials — AI_GATEWAY_API_KEY, or Vercel OIDC on deploy.
 */

import { createGateway, gateway } from "ai";
import type { CapabilityTier } from "@/lib/ai/catalog";

export const FAST_MODEL = process.env.AI_MODEL ?? "anthropic/claude-haiku-4.5";
export const QUALITY_MODEL =
  process.env.AI_MODEL_QUALITY ?? "anthropic/claude-sonnet-4-5";

export function modelIdForTier(tier: CapabilityTier): string {
  return tier === "quality" ? QUALITY_MODEL : FAST_MODEL;
}

/** True when the server itself can reach the gateway (env key or Vercel OIDC). */
export function serverGatewayAvailable(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export interface ResolvedModel {
  model: ReturnType<typeof gateway>;
  modelId: string;
}

/**
 * Build a language model for a tier. When `byokKey` is present, a scoped gateway
 * is created with that key (BYOK); otherwise the default gateway is used, which
 * reads server credentials from the environment.
 */
export function resolveModel(tier: CapabilityTier, byokKey?: string): ResolvedModel {
  const modelId = modelIdForTier(tier);
  if (byokKey) {
    const scoped = createGateway({ apiKey: byokKey });
    return { model: scoped(modelId), modelId };
  }
  return { model: gateway(modelId), modelId };
}
