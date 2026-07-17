import Link from "next/link";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        A commit message is a note to the next person who reads the history — usually a future
        version of you, at 4pm on a Friday, trying to work out why a line changed. Conventional
        Commits is a small, widely used format that makes those notes consistent and
        machine-readable, which is what lets tools generate changelogs and pick version numbers
        automatically. This guide covers the format, what each part is for, and where it pays
        off.
      </p>

      <h2>The shape of a message</h2>
      <TerminalPanel title="commit message format">
        <div className="space-y-1">
          <p className="text-term-text">{"<type>(<optional scope>): <description>"}</p>
          <p className="text-term-comment">{""}</p>
          <p className="text-term-comment">{"<optional body>"}</p>
          <p className="text-term-comment">{""}</p>
          <p className="text-term-comment">{"<optional footer>"}</p>
        </div>
      </TerminalPanel>
      <p>
        A minimal message is just <code>type: description</code>. Everything else is optional.
        The description is a short summary of the change written in the imperative mood —{" "}
        &ldquo;add&rdquo;, not &ldquo;added&rdquo; or &ldquo;adds&rdquo;. The reason for imperative mood is that it
        matches the messages Git itself writes (&ldquo;Merge branch&hellip;&rdquo;) and reads as an
        instruction: &ldquo;if applied, this commit will <em>add login validation</em>.&rdquo;
      </p>

      <h2>The types</h2>
      <ul>
        <li><code>feat</code> — a new feature for users.</li>
        <li><code>fix</code> — a bug fix.</li>
        <li><code>docs</code> — documentation only.</li>
        <li><code>refactor</code> — a code change that neither fixes a bug nor adds a feature.</li>
        <li><code>test</code> — adding or fixing tests.</li>
        <li><code>chore</code> — build, tooling, dependencies, housekeeping.</li>
        <li><code>perf</code> — a performance improvement.</li>
        <li><code>ci</code> — continuous-integration configuration.</li>
      </ul>
      <p>
        You don&rsquo;t need more types than these. If you find yourself inventing many, it&rsquo;s
        usually a sign a commit is doing too much and should be split.
      </p>

      <h2>Scope: optional, but useful</h2>
      <p>
        The scope in parentheses names the part of the codebase you touched:{" "}
        <code>feat(auth): add password reset</code>. In a monorepo or a large app, scopes make
        the history skimmable — you can see at a glance that a run of commits all touched{" "}
        <code>billing</code>. Keep scopes short and consistent; a wandering set of one-off
        scopes is worse than none.
      </p>

      <h2>Breaking changes</h2>
      <p>
        When a change breaks backward compatibility, flag it. Either add a <code>!</code> after
        the type/scope, or add a <code>BREAKING CHANGE:</code> footer explaining what broke and
        how to migrate. This is the part tools care about most: a breaking change bumps the
        major version.
      </p>
      <TerminalPanel>
        <CommandLine command='git commit -m "feat(api)!: require auth token on all endpoints"' risk="safe" feature="guide:conventional-commits" />
      </TerminalPanel>

      <Callout tone="note" title="Why the format earns its keep">
        Once your history is consistent, a tool can read it and produce release notes grouped
        by type, and choose the next version number: a <code>fix</code> is a patch, a{" "}
        <code>feat</code> is a minor, a breaking change is a major. You get that for free, but
        only if the messages are disciplined.
      </Callout>

      <h2>Writing good descriptions</h2>
      <ul>
        <li>
          Keep the summary line under about 72 characters so it isn&rsquo;t truncated in logs and
          UIs. The <Link href="/commits">commit builder</Link> shows a live length hint.
        </li>
        <li>Describe the change, not the process. &ldquo;fix rounding in tax calc&rdquo;, not &ldquo;fix bug&rdquo;.</li>
        <li>
          Use the body to explain <em>why</em>, if it isn&rsquo;t obvious. The diff already shows
          what changed; the valuable part is the reasoning a diff can&rsquo;t capture.
        </li>
        <li>One logical change per commit. If the summary needs an &ldquo;and&rdquo;, consider splitting.</li>
      </ul>

      <h2>A worked example</h2>
      <TerminalPanel title="a complete message">
        <div className="space-y-1 text-term-text">
          <p>fix(cart): stop discount stacking past 100%</p>
          <p className="text-term-comment">{""}</p>
          <p>Two coupon codes could combine to exceed the item price,</p>
          <p>producing negative totals. Clamp the combined discount at</p>
          <p>the subtotal before tax.</p>
          <p className="text-term-comment">{""}</p>
          <p>Closes #482</p>
        </div>
      </TerminalPanel>

      <h2>Do you have to do this?</h2>
      <p>
        No. Conventional Commits is a convention, not a Git feature, and a solo project can get
        by with plain messages. It pays off when a team shares a history, when you publish
        releases, or when you want automated changelogs. Even solo, the discipline of naming a
        <code>type</code> nudges you toward smaller, single-purpose commits, which is worth
        something on its own.
      </p>

      <p>
        The <Link href="/commits">commit builder</Link> composes valid messages for you with
        live validation and a copy button — no need to memorize the grammar. It&rsquo;s fully
        deterministic and works offline.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "conventional-commits",
  title: "Writing Conventional Commits that actually help",
  description:
    "The Conventional Commits format explained plainly: the types, scopes, breaking-change flags, and how disciplined messages unlock automatic changelogs and versioning.",
  category: "Commits",
  readingMinutes: 7,
  datePublished: "2026-07-17",
  related: [
    { href: "/commits", label: "Compose a message in the commit builder" },
    { href: "/reference/git-commit", label: "git commit in the reference" },
  ],
  Body,
};
