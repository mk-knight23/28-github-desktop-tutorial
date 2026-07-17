import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of use",
  description:
    "The terms for using MK GitFlow: a free, open-source, educational tool provided as-is, with no warranty. Plain language, no surprises.",
  path: "/terms",
});

const UPDATED = "July 17, 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Terms of use", path: "/terms" }])} />
      <Breadcrumb items={[{ name: "Terms of use" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="POLICY · TERMS"
        title="Terms of use"
        description="A free educational tool, offered in good faith and provided as-is. Here's the fine print, kept short."
      />
      <p className="mt-4 text-sm text-fg-muted">Last updated {UPDATED}</p>

      <article className="prose-doc mt-8">
        <h2>What this is</h2>
        <p>
          MK GitFlow is a free, open-source tool for learning and working with Git. By using it,
          you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use the site.
        </p>

        <h2>Educational use, provided as-is</h2>
        <p>
          The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind,
          express or implied. The content — guides, references, tutorials, quiz answers, generated
          suggestions — is for education and may contain errors or omissions. Git is powerful and
          some commands are destructive. You are responsible for what you run on your own
          repositories.{" "}
          <strong>
            Always understand a command, and back up your work, before running it for real.
          </strong>
        </p>

        <h2>The site never runs commands for you</h2>
        <p>
          By design, MK GitFlow never executes shell or Git commands. The simulator runs entirely
          in your browser&rsquo;s memory, and commands shown elsewhere are for you to copy and run
          yourself. Any command you choose to run on your machine is your own action, and its
          consequences are yours.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, the author is not liable for any damages arising
          from your use of the site — including, but not limited to, lost work, corrupted
          repositories, or data loss resulting from commands you run. Use the tools as an aid to
          your own judgment, not a replacement for it.
        </p>

        <h2>Your data</h2>
        <p>
          Your data stays in your browser; see the <Link href="/privacy">privacy policy</Link> for
          details. You&rsquo;re responsible for backing up anything you care about — clearing your
          browser storage will remove your local progress and sessions.
        </p>

        <h2>Third-party services</h2>
        <p>
          Optional features rely on third parties: the AI assistant routes through an AI gateway,
          and the repo analyzer uses GitHub&rsquo;s public API. Their availability and behavior are
          outside our control, and your use of them is also subject to their terms.
        </p>

        <h2>The code and its license</h2>
        <p>
          The source code is licensed separately under the MIT license, which governs your rights
          to use, modify, and redistribute the code itself. See the{" "}
          <Link href="/open-source">open-source page</Link>. These terms cover your use of the
          hosted site.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Don&rsquo;t use the site to break the law, to attack or overload the service, or to abuse the
          AI or analyzer endpoints (which are rate-limited). Otherwise, use it freely.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may change; the &ldquo;last updated&rdquo; date will reflect it. Continued use after a
          change means you accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? <Link href="/contact">Reach out</Link>.
        </p>
      </article>
    </div>
  );
}
