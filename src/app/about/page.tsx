import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "What MK GitFlow is, why it exists, and the principles behind it — a visual, local-first Git learning platform that never executes a single command.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "About", path: "/about" }])} />
      <Breadcrumb items={[{ name: "About" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="ABOUT · MK GITFLOW"
        title="About this project"
        description="A visual way to actually understand Git, instead of memorizing commands and hoping."
      />

      <article className="prose-doc mt-10">
        <h2>Why it exists</h2>
        <p>
          Most people learn Git as a set of spells: type these words, and usually the right thing
          happens. That works until it doesn&rsquo;t — a rebase goes sideways, a reset eats some
          commits, and suddenly there&rsquo;s no model to reason from. MK GitFlow exists to replace the
          spellbook with a picture. When you can see what a command does to the commit graph
          before you run it for real, the fear goes away and the commands start to make sense.
        </p>

        <h2>The core principle</h2>
        <p>
          <strong>The site never executes shell commands.</strong> The simulator runs a Git graph
          entirely in memory in your browser, and everywhere else commands are displayed with a
          copy button for you to run yourself. That&rsquo;s both a safety feature and a design
          constraint: there is no code path that can touch a real repository, so you can
          experiment with the scariest operations and the worst that happens is a graph you reset.
        </p>

        <h2>Local-first, by design</h2>
        <p>
          There are no accounts and no server database. Your tutorial progress, quiz scores,
          simulator sessions, and saved analyses live in your browser. You can{" "}
          <Link href="/settings">export, import, or clear</Link> all of it whenever you like. The
          project collects nothing about you by default; analytics are off until you choose to turn
          them on.
        </p>

        <h2>What&rsquo;s in it</h2>
        <ul>
          <li>An <Link href="/tool">interactive simulator</Link> for the operations people get stuck on.</li>
          <li><Link href="/tutorials">Guided tutorials</Link> for GitHub Desktop and the command line.</li>
          <li>A risk-graded <Link href="/reference">command reference</Link> with undo guidance.</li>
          <li>Deterministic tools: a <Link href="/gitignore">.gitignore generator</Link>, a <Link href="/commits">commit builder</Link>, and an <Link href="/undo">undo helper</Link>.</li>
          <li>A public <Link href="/analyzer">repo analyzer</Link> and an optional <Link href="/assistant">AI assistant</Link> with honest fallbacks.</li>
          <li>Original <Link href="/guides">guides</Link> and task-based <Link href="/use-cases">use cases</Link>.</li>
        </ul>

        <h2>About the name</h2>
        <p>
          &ldquo;GitFlow&rdquo; here is a brand for the learning platform, not the specific nvie branching
          model of the same name. This project teaches Git mechanics so you can pick whatever
          workflow suits your team. The <Link href="/faq">FAQ</Link> and the{" "}
          <Link href="/guides/branch-strategies">branch-strategies guide</Link> cover that model
          alongside the alternatives.
        </p>

        <h2>Who made it</h2>
        <p>
          MK GitFlow is built and maintained by{" "}
          <Link href="/creator">Kazi Musharraf</Link>. It&rsquo;s{" "}
          <Link href="/open-source">open source</Link> under the MIT license — read the code, file
          an issue, or contribute.
        </p>
      </article>
    </div>
  );
}
