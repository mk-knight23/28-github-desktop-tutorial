import Link from "next/link";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        A <code>.gitignore</code> file tells Git which files to leave out of version control:
        build output, dependencies, secrets, editor cruft. It looks simple, and for the common
        case it is. But a handful of rules about ordering, precedence, and already-tracked
        files trip up almost everyone at least once. This guide covers the pattern syntax and
        the gotchas that make people say &ldquo;why is this file still showing up?&rdquo;
      </p>

      <h2>The syntax, quickly</h2>
      <ul>
        <li><code>node_modules/</code> — a trailing slash matches directories only.</li>
        <li><code>*.log</code> — <code>*</code> matches anything except a slash.</li>
        <li><code>build/**/*.js</code> — <code>**</code> matches across directory levels.</li>
        <li><code>/config.local</code> — a leading slash anchors to the repo root.</li>
        <li><code>!keep.log</code> — a leading <code>!</code> negates: re-include a file an earlier rule excluded.</li>
        <li><code># comment</code> — lines starting with <code>#</code> are comments.</li>
      </ul>

      <h2>Gotcha 1: ignoring a file that&rsquo;s already tracked</h2>
      <p>
        This is the big one. <code>.gitignore</code> only affects <em>untracked</em> files. If
        you already committed <code>secrets.env</code> and then add it to <code>.gitignore</code>,
        Git keeps tracking it — the ignore rule is silently overridden for files it already
        knows about. You have to stop tracking it explicitly.
      </p>
      <TerminalPanel>
        <CommandLine command="git rm --cached secrets.env" risk="caution" feature="guide:gitignore" />
        <CommandLine command='git commit -m "chore: stop tracking secrets.env"' risk="safe" feature="guide:gitignore" />
      </TerminalPanel>
      <p>
        <code>--cached</code> removes it from Git&rsquo;s tracking but leaves the file on disk. The
        ignore rule then takes over for future changes. To clear out a whole directory that
        slipped in, <code>git rm -r --cached dist/</code> does the same for a folder.
      </p>

      <Callout tone="danger" title="If a secret was committed, ignoring it is not enough">
        Adding a leaked secret to <code>.gitignore</code> does nothing about the copy already in
        your history. Anyone with the repo can check out the old commit and read it. Rotate the
        secret (assume it&rsquo;s compromised), then purge it from history. The{" "}
        <Link href="/undo">undo helper</Link> has the recovery recipe.
      </Callout>

      <h2>Gotcha 2: negation can&rsquo;t re-include inside an ignored directory</h2>
      <p>
        If you ignore a whole directory, you can&rsquo;t un-ignore a file inside it with a{" "}
        <code>!</code> rule, because Git never descends into an excluded directory in the first
        place. This fails to keep <code>logs/keep.log</code>:
      </p>
      <TerminalPanel title=".gitignore (broken)">
        <div className="space-y-1 text-term-text">
          <p>logs/</p>
          <p>!logs/keep.log</p>
        </div>
      </TerminalPanel>
      <p>Ignore the directory&rsquo;s <em>contents</em> instead, then re-include:</p>
      <TerminalPanel title=".gitignore (works)">
        <div className="space-y-1 text-term-text">
          <p>logs/*</p>
          <p>!logs/keep.log</p>
        </div>
      </TerminalPanel>

      <h2>Gotcha 3: order matters for negation</h2>
      <p>
        Rules are applied top to bottom, and the last match wins. A <code>!</code> re-include
        only works if it comes <em>after</em> the rule that excluded the file. Put your broad
        ignores first and your specific exceptions after them.
      </p>

      <h2>Where the file lives</h2>
      <p>
        You can have a <code>.gitignore</code> in any directory; rules apply to that directory
        and below. Most projects keep one at the root. For patterns personal to you (your
        editor&rsquo;s scratch files, say) that shouldn&rsquo;t be imposed on the team, use a global
        ignore file instead so it doesn&rsquo;t clutter the shared config:
      </p>
      <TerminalPanel>
        <CommandLine command="git config --global core.excludesfile ~/.gitignore_global" risk="safe" feature="guide:gitignore" />
      </TerminalPanel>

      <h2>What belongs in it</h2>
      <ul>
        <li>Dependencies you can reinstall: <code>node_modules/</code>, <code>vendor/</code>, virtualenvs.</li>
        <li>Build output: <code>dist/</code>, <code>build/</code>, <code>.next/</code>, compiled binaries.</li>
        <li>Secrets and local config: <code>.env</code>, credentials, local overrides.</li>
        <li>OS and editor files: <code>.DS_Store</code>, <code>Thumbs.db</code>, <code>.idea/</code>, <code>.vscode/</code> (team-dependent).</li>
      </ul>
      <p>
        Don&rsquo;t ignore lockfiles (<code>package-lock.json</code>, <code>pnpm-lock.yaml</code>) —
        those belong in the repo so everyone installs the same versions.
      </p>

      <p>
        You don&rsquo;t have to write these from memory. The{" "}
        <Link href="/gitignore">.gitignore generator</Link> combines vetted templates for
        Node, Python, macOS, JetBrains and more into one deduplicated file with section headers.
        It runs entirely in your browser — no external API.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "gitignore-patterns",
  title: ".gitignore patterns that trip people up",
  description:
    "The .gitignore syntax plus the real gotchas: already-tracked files, negation inside ignored directories, rule ordering, and what actually belongs in the file.",
  category: "Configuration",
  readingMinutes: 6,
  datePublished: "2026-07-17",
  related: [
    { href: "/gitignore", label: "Build a .gitignore from templates" },
    { href: "/reference/git-rm", label: "git rm in the reference" },
  ],
  Body,
};
