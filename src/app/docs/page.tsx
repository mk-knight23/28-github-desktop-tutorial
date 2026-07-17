import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumb } from "@/components/content/breadcrumb";
import { AdSlot } from "@/components/content/ad-slot";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Documentation",
  description:
    "How MK GitFlow works: the simulator, tutorials, command reference, deterministic tools, quizzes, the AI assistant, the repo analyzer, and how your data is handled.",
  path: "/docs",
});

interface DocSection {
  id: string;
  title: string;
}

const SECTIONS: DocSection[] = [
  { id: "overview", title: "Overview" },
  { id: "simulator", title: "The simulator" },
  { id: "learning", title: "Tutorials, quizzes & reference" },
  { id: "tools", title: "Deterministic tools" },
  { id: "assistant", title: "AI assistant" },
  { id: "analyzer", title: "Repo analyzer" },
  { id: "your-data", title: "Your data" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbLd([{ name: "Documentation", path: "/docs" }])} />
      <Breadcrumb items={[{ name: "Documentation" }]} />

      <PageHeader
        className="mt-5"
        eyebrow="DOCS · HOW IT WORKS"
        title="Documentation"
        description="A tour of what's here and how the pieces fit. Every section links out to the tool or guide that goes deeper."
      />

      <div className="mt-10 gap-10 lg:grid lg:grid-cols-[1fr_16rem]">
        <article className="prose-doc min-w-0">
          <section id="overview">
            <h2>Overview</h2>
            <p>
              MK GitFlow is a local-first Git learning platform. It has one firm rule: it never
              executes shell or Git commands. The simulator runs a Git graph in your browser&rsquo;s
              memory, and every command shown elsewhere is display-and-copy only. Nothing you do
              here can touch a real repository, which is what makes it safe to experiment.
            </p>
            <p>
              There are no accounts. Your progress and results are stored in your browser. Most of
              the tools work offline after the first load.
            </p>
          </section>

          <section id="simulator">
            <h2>The simulator</h2>
            <p>
              The <Link href="/tool">branch simulator</Link> is the heart of the product. Run{" "}
              <code>commit</code>, <code>branch</code>, <code>checkout</code>, <code>merge</code>,{" "}
              <code>rebase</code>, and <code>reset</code> using buttons or a text input, and watch
              an SVG graph update. Every step is undoable, the whole session resets in one click,
              and you can export or import a session as JSON. Destructive operations like{" "}
              <code>reset --hard</code> carry an explicit warning and confirmation.
            </p>
            <p>
              New to the graph itself? Read{" "}
              <Link href="/guides/reading-the-dag">reading the commit graph</Link> alongside it.
            </p>
          </section>

          <section id="learning">
            <h2>Tutorials, quizzes & reference</h2>
            <p>
              The <Link href="/tutorials">guided tutorials</Link> cover the GitHub Desktop and
              command-line paths across three levels, with checkpoints you mark as you go. The{" "}
              <Link href="/quiz">quizzes</Link> check your understanding of basics, branching,
              merging vs rebasing, undoing, and collaboration, with an explanation after each
              question. The <Link href="/reference">command reference</Link> documents each
              command with a risk level — safe, caution, or destructive — plus examples and undo
              guidance, and gives every command its own page.
            </p>
          </section>

          <section id="tools">
            <h2>Deterministic tools</h2>
            <p>These run entirely in your browser, with no AI and no network:</p>
            <ul>
              <li>
                The <Link href="/gitignore">.gitignore generator</Link> combines bundled templates
                into one deduplicated file. See{" "}
                <Link href="/guides/gitignore-patterns">the .gitignore guide</Link> for the gotchas.
              </li>
              <li>
                The <Link href="/commits">commit builder</Link> composes Conventional Commit
                messages with live validation. The{" "}
                <Link href="/guides/conventional-commits">Conventional Commits guide</Link> explains
                the format.
              </li>
              <li>
                The <Link href="/undo">undo helper</Link> matches your mistake to a recovery recipe
                with risk-graded, copy-ready commands.
              </li>
            </ul>
          </section>

          <section id="assistant">
            <h2>AI assistant</h2>
            <p>
              The <Link href="/assistant">assistant</Link> offers AI capabilities like turning
              plain language into a git command, explaining an error or a merge conflict, and
              drafting PR descriptions or release notes. It&rsquo;s honest about availability: when no
              AI credentials are configured, capabilities that have a deterministic fallback still
              work (clearly labeled as non-AI), and the rest show an &ldquo;AI unavailable&rdquo; state. You
              can optionally bring your own API key, kept only in your browser. Nothing you type is
              logged or stored on the server.
            </p>
          </section>

          <section id="analyzer">
            <h2>Repo analyzer</h2>
            <p>
              The <Link href="/analyzer">repo analyzer</Link> scores a public GitHub repository&rsquo;s
              documentation health against a documented rubric and gives you an actionable
              checklist. It reads only public data, never asks for a token, and handles GitHub&rsquo;s
              rate limits honestly. The{" "}
              <Link href="/use-cases/auditing-repo-health">repo-health use case</Link> shows how to
              put it to work.
            </p>
          </section>

          <section id="your-data">
            <h2>Your data</h2>
            <p>
              Everything you generate stays on your device. The{" "}
              <Link href="/dashboard">dashboard</Link> and <Link href="/history">history</Link>{" "}
              show your real local data with honest empty states, and{" "}
              <Link href="/settings">settings</Link> lets you export, import, or clear it and manage
              analytics consent. For the full detail, see the{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>
          </section>
        </article>

        <aside className="mt-10 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <nav aria-label="On this page" className="rounded-lg border border-border bg-surface p-4">
              <p className="schematic-label text-fg-muted">On this page</p>
              <ul className="mt-3 space-y-2">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-fg-secondary transition-colors duration-(--motion-fast) hover:text-accent"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <AdSlot className="mt-4" height={250} />
          </div>
        </aside>
      </div>
    </div>
  );
}
