import Link from "next/link";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        Under the friendly words — branch, merge, HEAD — Git is one data structure: a directed
        acyclic graph of commits, usually shortened to DAG. Once you can picture that graph,
        commands stop feeling like magic incantations and start looking like small,
        predictable moves on a diagram. This guide builds that mental model from the ground up.
      </p>

      <h2>A commit points backward</h2>
      <p>
        Each commit records a snapshot of your files plus a pointer to its parent — the commit
        that came before it. Follow those pointers and you walk back through history. That&rsquo;s
        the &ldquo;directed&rdquo; part: the arrows go one way, from a commit to its parent.
        &ldquo;Acyclic&rdquo; means you can never loop back to where you started; history only goes
        backward. A commit can have two parents (that&rsquo;s a merge), but it can never be its own
        ancestor.
      </p>

      <Callout tone="note" title="Commits are immutable">
        A commit&rsquo;s identity — its SHA — is computed from its contents, including its parent and
        message. Change any of that and you get a <em>different</em> commit with a different
        SHA. This is why rebase and amend create new commits rather than editing old ones:
        commits can&rsquo;t be edited, only replaced.
      </Callout>

      <h2>Branches are just labels</h2>
      <p>
        A branch is not a copy of anything. It&rsquo;s a lightweight, movable label pointing at one
        commit — the tip. When you commit on a branch, Git creates the new commit and slides the
        label forward to it. That&rsquo;s the entire mechanism. It&rsquo;s why creating a branch is
        instant and free: you&rsquo;re just writing down a commit&rsquo;s SHA under a name.
      </p>
      <p>
        Deleting a branch removes the label, not the commits. The commits stay in the graph,
        reachable through the reflog, which is exactly why you can{" "}
        <Link href="/undo">recover a deleted branch</Link>.
      </p>

      <h2>HEAD is &ldquo;you are here&rdquo;</h2>
      <p>
        <code>HEAD</code> is a pointer to whatever you currently have checked out — normally a
        branch. When you <code>git checkout main</code>, HEAD points at <code>main</code>, and
        your next commit moves <code>main</code>. If you check out a specific commit instead of
        a branch, HEAD points straight at that commit — the &ldquo;detached HEAD&rdquo; state. It sounds
        alarming but just means &ldquo;you&rsquo;re looking at a commit with no branch label here,&rdquo; so a
        commit you make won&rsquo;t belong to any branch until you create one.
      </p>

      <h2>Reading references</h2>
      <p>You&rsquo;ll see shorthand for walking the graph:</p>
      <ul>
        <li><code>HEAD~1</code> — the commit one step back (the parent).</li>
        <li><code>HEAD~3</code> — three steps back along the first-parent line.</li>
        <li><code>HEAD^</code> — also the parent; <code>HEAD^2</code> is the <em>second</em> parent of a merge.</li>
        <li><code>main..feature</code> — commits on <code>feature</code> that aren&rsquo;t on <code>main</code>.</li>
      </ul>
      <p>These aren&rsquo;t separate features to memorize — they&rsquo;re all just ways to name a node by walking the arrows.</p>

      <h2>Seeing the graph in the terminal</h2>
      <p>Git can draw an ASCII version of the DAG. This one line is worth putting in an alias:</p>
      <TerminalPanel>
        <CommandLine command="git log --oneline --graph --all" risk="safe" feature="guide:reading-the-dag" />
      </TerminalPanel>
      <p>
        You&rsquo;ll see commits as nodes, branch and tag labels attached to their tips, and merges
        as points where two lines join. Every fork is a branch that diverged; every join is a
        merge. That&rsquo;s the whole vocabulary.
      </p>

      <h2>How operations move the graph</h2>
      <ul>
        <li><strong>commit</strong> — add a node, slide the current branch label onto it.</li>
        <li><strong>branch</strong> — add a new label on the current commit.</li>
        <li><strong>checkout</strong> — move HEAD to a different label or commit.</li>
        <li><strong>merge</strong> — add a node with two parents joining two lines (or fast-forward the label if no divergence).</li>
        <li><strong>rebase</strong> — copy a run of commits onto a new parent, giving each a new SHA; the old copies become unreferenced.</li>
        <li><strong>reset</strong> — slide the current branch label to a different commit.</li>
      </ul>

      <Callout tone="tip" title="This is what the simulator shows">
        The <Link href="/tool">branch simulator</Link> is a live picture of exactly this graph.
        Run each operation and watch nodes appear, labels slide, and lines fork and join.
        A few minutes there makes every command above concrete.
      </Callout>

      <p>
        Once the DAG is in your head, the scary commands lose their teeth: reset just moves a
        label, rebase just re-parents nodes, a detached HEAD is just a node without a label. The{" "}
        <Link href="/reference/git-log">git log reference</Link> covers more ways to inspect it.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "reading-the-dag",
  title: "Reading the commit graph (the DAG)",
  description:
    "Build the mental model behind Git: commits as nodes, branches as movable labels, HEAD as 'you are here', and how each command moves the directed acyclic graph.",
  category: "Concepts",
  readingMinutes: 8,
  datePublished: "2026-07-17",
  related: [
    { href: "/tool", label: "Watch the graph move in the simulator" },
    { href: "/reference/git-log", label: "git log in the reference" },
  ],
  Body,
};
