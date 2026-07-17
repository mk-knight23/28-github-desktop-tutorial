/** Per-page metadata helper (STANDARDS §5). Canonical is relative; metadataBase
 * in layout.tsx resolves it against SITE_URL. */

import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

interface PageMetaInput {
  title: string;
  description: string;
  /** Absolute path beginning with "/". */
  path: string;
}

export function buildMetadata({ title, description, path }: PageMetaInput): Metadata {
  const fullTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
