import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { ConsentControls } from "@/components/content/consent-controls";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cookie policy",
  description:
    "MK GitFlow uses no cookies by default. Analytics cookies load only if you opt in, and you can change your choice here at any time.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Cookie policy", path: "/cookies" }])} />
      <Breadcrumb items={[{ name: "Cookie policy" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="POLICY · COOKIES"
        title="Cookie policy"
        description="Short version: nothing tracks you unless you say yes. Here's the detail, and the switch."
      />

      <div className="mt-8">
        <ConsentControls />
      </div>

      <article className="prose-doc mt-10">
        <h2>What we store by default</h2>
        <p>
          By default, MK GitFlow sets no tracking cookies. To make the app work, it keeps a few
          small values in your browser&rsquo;s local storage — not cookies sent to a server:
        </p>
        <ul>
          <li>Your theme choice (dark or light) and reduced-motion preference.</li>
          <li>Your analytics consent choice, so we don&rsquo;t ask again.</li>
          <li>Whether local history is disabled.</li>
        </ul>
        <p>
          Larger data — tutorial progress, quiz scores, simulator sessions, saved analyses — lives
          in IndexedDB on your device. None of it is a cookie, and none of it leaves your browser.
        </p>

        <h2>Analytics cookies (opt-in)</h2>
        <p>
          If, and only if, you choose &ldquo;Allow analytics&rdquo; above, we load Google Tag Manager, which
          may set analytics cookies. Until you opt in, no analytics script loads and no such
          cookie is set. Analytics also stay off entirely outside of the production site. You can
          switch analytics back off here at any time.
        </p>
        <p>
          When analytics are on, the events we record are limited to counts, coarse size buckets,
          feature names, and timings. We never send command text, repo names, quiz content, error
          logs, or keys. See the <Link href="/privacy">privacy policy</Link> for the full picture.
        </p>

        <h2>Third-party cookies</h2>
        <p>
          We don&rsquo;t embed advertising or social widgets, so there are no third-party tracking
          cookies beyond the optional analytics above. Links out to GitHub or other sites are
          governed by those sites&rsquo; own policies.
        </p>
      </article>
    </div>
  );
}
