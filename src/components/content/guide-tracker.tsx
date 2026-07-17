"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Fires the `guide_opened` analytics event once on mount. Sends only the guide
 * slug (a non-identifying feature name) — never content. No-op unless analytics
 * is active (consent granted + production + GTM id set).
 */
export function GuideTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track("guide_opened", { guide: slug });
  }, [slug]);
  return null;
}
