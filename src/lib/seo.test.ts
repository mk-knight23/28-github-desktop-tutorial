import { describe, expect, test } from "vitest";
import { SITE_NAME } from "@/lib/site";
import { buildMetadata } from "./seo";

describe("buildMetadata", () => {
  const meta = buildMetadata({
    title: "Command reference",
    description: "Risk-graded git command reference.",
    path: "/reference",
  });

  test("sets the bare title and description", () => {
    expect(meta.title).toBe("Command reference");
    expect(meta.description).toBe("Risk-graded git command reference.");
  });

  test("sets the canonical to the given path", () => {
    expect(meta.alternates?.canonical).toBe("/reference");
  });

  test("suffixes the site name on the OG and Twitter titles", () => {
    expect(meta.openGraph?.title).toBe(`Command reference · ${SITE_NAME}`);
    expect(meta.twitter && "title" in meta.twitter ? meta.twitter.title : undefined).toBe(
      `Command reference · ${SITE_NAME}`,
    );
  });

  test("carries an OG image and a summary_large_image card", () => {
    const images = meta.openGraph?.images;
    expect(Array.isArray(images) ? images.length : 0).toBeGreaterThan(0);
    expect(meta.twitter && "card" in meta.twitter ? meta.twitter.card : undefined).toBe(
      "summary_large_image",
    );
  });

  test("points the OG url at the page path", () => {
    expect(meta.openGraph && "url" in meta.openGraph ? meta.openGraph.url : undefined).toBe(
      "/reference",
    );
  });
});
