/**
 * POST /api/ai/<capability> (PRODUCT_SPEC §3.8).
 *
 * One dynamic route serves all nine capabilities. The slug is validated against
 * the typed registry before any work happens; everything else lives in the
 * shared server handler.
 */

import { handleAiRequest } from "@/lib/ai/server/handler";
import { isCapabilitySlug } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ capability: string }>;
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const { capability } = await context.params;
  if (!isCapabilitySlug(capability)) {
    return new Response(
      JSON.stringify({
        status: "error",
        capability,
        code: "invalid-input",
        message: "Unknown AI capability.",
      }),
      { status: 404, headers: { "content-type": "application/json" } },
    );
  }
  return handleAiRequest(capability, request);
}
