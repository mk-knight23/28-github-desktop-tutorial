import { describe, expect, test } from "vitest";
import { CREATOR, SITE_URL } from "@/lib/site";
import {
  absoluteUrl,
  articleLd,
  breadcrumbLd,
  faqPageLd,
  howToLd,
  personLd,
  webApplicationLd,
} from "./jsonld";

describe("absoluteUrl", () => {
  test("prefixes a site-relative path with the site URL", () => {
    expect(absoluteUrl("/guides")).toBe(`${SITE_URL}/guides`);
  });

  test("adds a missing leading slash", () => {
    expect(absoluteUrl("guides")).toBe(`${SITE_URL}/guides`);
  });

  test("leaves an already-absolute URL untouched", () => {
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });
});

describe("webApplicationLd", () => {
  test("is a free WebApplication node authored by the creator", () => {
    const node = webApplicationLd();
    expect(node["@type"]).toBe("WebApplication");
    expect(node.isAccessibleForFree).toBe(true);
    expect((node.author as Record<string, unknown>).name).toBe(CREATOR.name);
  });
});

describe("personLd", () => {
  test("is a Person node linking the creator's profiles", () => {
    const node = personLd();
    expect(node["@type"]).toBe("Person");
    expect(node.sameAs).toEqual([CREATOR.github, CREATOR.portfolio]);
  });
});

describe("faqPageLd", () => {
  test("maps each item into a Question with an accepted Answer", () => {
    const node = faqPageLd([{ question: "Does it run git?", answer: "No, it only simulates." }]);
    expect(node["@type"]).toBe("FAQPage");
    const entities = node.mainEntity as Array<Record<string, unknown>>;
    expect(entities[0].name).toBe("Does it run git?");
    expect((entities[0].acceptedAnswer as Record<string, unknown>).text).toBe(
      "No, it only simulates.",
    );
  });
});

describe("articleLd", () => {
  test("defaults dateModified to datePublished when omitted", () => {
    const node = articleLd({
      title: "Rebase vs merge",
      description: "How they differ.",
      path: "/guides/rebase-vs-merge",
      datePublished: "2026-01-01",
    });
    expect(node.dateModified).toBe("2026-01-01");
    expect(node.url).toBe(`${SITE_URL}/guides/rebase-vs-merge`);
  });

  test("keeps an explicit dateModified", () => {
    const node = articleLd({
      title: "t",
      description: "d",
      path: "/guides/x",
      datePublished: "2026-01-01",
      dateModified: "2026-02-02",
    });
    expect(node.dateModified).toBe("2026-02-02");
  });
});

describe("breadcrumbLd", () => {
  test("numbers items starting at position 1 with absolute urls", () => {
    const node = breadcrumbLd([
      { name: "Guides", path: "/guides" },
      { name: "Rebase vs merge", path: "/guides/rebase-vs-merge" },
    ]);
    const items = node.itemListElement as Array<Record<string, unknown>>;
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
    expect(items[1].item).toBe(`${SITE_URL}/guides/rebase-vs-merge`);
  });
});

describe("howToLd", () => {
  test("numbers steps and preserves their text", () => {
    const node = howToLd({
      name: "Undo a commit",
      description: "Safely undo the last commit.",
      steps: [
        { name: "Soft reset", text: "Run git reset --soft HEAD~1." },
        { name: "Recommit", text: "Recreate the commit." },
      ],
    });
    expect(node["@type"]).toBe("HowTo");
    const steps = node.step as Array<Record<string, unknown>>;
    expect(steps[0].position).toBe(1);
    expect(steps[1].name).toBe("Recommit");
  });
});
