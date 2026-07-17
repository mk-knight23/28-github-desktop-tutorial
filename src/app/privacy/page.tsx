import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description:
    "MK GitFlow is local-first: your data stays in your browser, analytics are off by default, and AI input is never logged or stored. Here's exactly what that means.",
  path: "/privacy",
});

const UPDATED = "July 17, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Privacy policy", path: "/privacy" }])} />
      <Breadcrumb items={[{ name: "Privacy policy" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="POLICY · PRIVACY"
        title="Privacy policy"
        description="The honest, plain-language version: this site is built so there's very little about you to collect in the first place."
      />
      <p className="mt-4 text-sm text-fg-muted">Last updated {UPDATED}</p>

      <article className="prose-doc mt-8">
        <h2>The short version</h2>
        <ul>
          <li>No accounts. No sign-in. No server-side database of your activity.</li>
          <li>Your progress, scores, sessions, and analyses stay in your browser.</li>
          <li>Analytics are off by default and only run if you opt in.</li>
          <li>Text you send to the AI assistant is not logged or stored on our server.</li>
          <li>The repo analyzer reads only public GitHub data and never asks for a token.</li>
        </ul>

        <h2>Data stored on your device</h2>
        <p>
          MK GitFlow is local-first. Tutorial progress, quiz results, simulator sessions, saved
          repo analyses, and your preferences live in your browser (IndexedDB and local storage),
          not on a server. You control this data directly: the{" "}
          <Link href="/settings">settings page</Link> lets you export it, import it, or clear it
          completely. Clearing your browser storage removes it too.
        </p>

        <h2>Analytics</h2>
        <p>
          We use Google Tag Manager only if you accept it on the cookie banner (the default is
          declined), and only on the production site. When it&rsquo;s on, the events we record are
          strictly limited to non-identifying data: counts, coarse size buckets, feature names,
          and timings. We <strong>never</strong> send command text, repository names, quiz
          content, error logs, file names, or keys. You can change your choice any time on the{" "}
          <Link href="/cookies">cookies page</Link>.
        </p>

        <h2>The AI assistant</h2>
        <p>
          When you run an AI capability, the text you provide is sent to an AI gateway to generate
          a response. It is processed transiently to answer your request and is not logged or
          stored on our server. If you supply your own API key, that key is held only in your
          browser and sent per request as a header — it is never logged, stored, or echoed back by
          the server. Do not paste secrets or sensitive data into any AI tool, here or anywhere.
        </p>

        <h2>The repo analyzer</h2>
        <p>
          The analyzer calls GitHub&rsquo;s public API without authentication and reads only public
          information about the repository you enter. It never sends a token, never accesses
          private repositories, and doesn&rsquo;t store your queries on a server. Recent analyses are
          cached in your browser for convenience.
        </p>

        <h2>What we don&rsquo;t do</h2>
        <ul>
          <li>We don&rsquo;t sell or share your data — there&rsquo;s effectively none to sell.</li>
          <li>We don&rsquo;t embed advertising or social tracking widgets.</li>
          <li>We don&rsquo;t build profiles across sessions or devices.</li>
        </ul>

        <h2>Third-party services</h2>
        <p>
          When enabled, analytics run through Google Tag Manager, and the AI features route through
          an AI gateway; the analyzer talks to GitHub&rsquo;s public API. Each is used only as described
          above and governed by its provider&rsquo;s own terms. The site is hosted on a standard web
          platform whose servers process ordinary request logs (such as IP addresses) as part of
          serving pages.
        </p>

        <h2>Children</h2>
        <p>
          This is a developer education tool and isn&rsquo;t directed at children. It collects no
          personal information that would identify anyone.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes, the &ldquo;last updated&rdquo; date above will change with it, and material
          changes will be noted in the <Link href="/changelog">changelog</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy? <Link href="/contact">Get in touch</Link>. Because the project
          is open source, you can also read exactly how any of this works in the code.
        </p>
      </article>
    </div>
  );
}
