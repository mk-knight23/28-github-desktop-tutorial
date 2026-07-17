import Link from "next/link";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        Merge and rebase both answer the same question: &ldquo;how do I bring the work from
        one branch into another?&rdquo; They produce different histories, and the difference
        matters most when other people are reading or building on that history. This guide
        explains what each one actually does to the commit graph, when to reach for which,
        and the one rule that keeps rebase from ruining anyone&rsquo;s day.
      </p>

      <h2>What merge does</h2>
      <p>
        A merge takes the tip of your branch and the tip of the branch you&rsquo;re merging in,
        and records a new commit with two parents. That new commit is the merge commit. Your
        original commits keep their identity and their place in time. Nothing is rewritten.
      </p>
      <TerminalPanel>
        <CommandLine command="git checkout main" risk="safe" feature="guide:rebase-vs-merge" />
        <CommandLine command="git merge feature/login" risk="safe" feature="guide:rebase-vs-merge" />
      </TerminalPanel>
      <p>
        If <code>main</code> hasn&rsquo;t moved since you branched off, Git skips the merge commit
        and just moves the branch pointer forward. That&rsquo;s a fast-forward. If both branches
        have new commits, you get a real merge commit with two parents, and the graph forks
        and rejoins. You can see both shapes in the{" "}
        <Link href="/tool">branch simulator</Link> by running a merge with and without new
        commits on the target branch.
      </p>

      <h2>What rebase does</h2>
      <p>
        A rebase replays your commits on top of a different base. Git takes each commit on
        your branch, sets it aside, moves your branch to the new base, and then reapplies
        each change one at a time. Because the parent of each commit changes, every replayed
        commit gets a brand-new SHA. The old commits still exist for a while in the reflog,
        but they&rsquo;re no longer on your branch.
      </p>
      <TerminalPanel>
        <CommandLine command="git checkout feature/login" risk="safe" feature="guide:rebase-vs-merge" />
        <CommandLine command="git rebase main" risk="caution" feature="guide:rebase-vs-merge" />
      </TerminalPanel>
      <p>
        The result is a straight line: your feature commits sit on top of the latest{" "}
        <code>main</code>, as if you&rsquo;d started your work today. No merge commit, no fork in
        the graph. This is what people mean by &ldquo;a clean, linear history.&rdquo;
      </p>

      <Callout tone="caution" title="Rebasing rewrites commits">
        Because rebase gives every replayed commit a new SHA, it is rewriting history. That
        is completely fine on commits only you have. It is a problem the moment those commits
        are shared, because everyone else still has the old SHAs.
      </Callout>

      <h2>The one rule</h2>
      <p>
        <strong>Never rebase commits that other people have already pulled.</strong> If you
        rebase a branch that a teammate has based work on, their history and yours no longer
        agree on which commits are which. They&rsquo;ll pull, get duplicated commits and
        confusing conflicts, and someone will spend an afternoon untangling it. Rebase your
        own local, un-pushed work freely. Leave shared branches alone.
      </p>
      <p>
        The classic safe use is: you&rsquo;ve been working on a feature branch for two days,{" "}
        <code>main</code> has moved on, and you want your branch to sit on top of the current{" "}
        <code>main</code> before you open a pull request. Those feature commits are yours and
        haven&rsquo;t been shared, so rebasing them is safe and gives reviewers a tidy diff.
      </p>

      <h2>How to choose</h2>
      <ul>
        <li>
          <strong>Use merge</strong> when you&rsquo;re integrating a finished branch into a shared
          branch, when the branch is public, or when you value an honest record of when things
          actually happened. Merge commits are also easy to revert as a unit.
        </li>
        <li>
          <strong>Use rebase</strong> to update your own feature branch onto the latest base,
          or to tidy up your local commits before sharing them. Keep it to work nobody else
          has.
        </li>
        <li>
          <strong>A common hybrid:</strong> rebase your feature branch onto <code>main</code>{" "}
          locally so the diff is clean, then open a PR and let the merge into <code>main</code>{" "}
          happen as a normal merge (or a squash, if your team prefers). You get a readable
          feature branch and a truthful main history.
        </li>
      </ul>

      <h2>What about squash?</h2>
      <p>
        Squashing collapses several commits into one. Many teams squash a feature branch when
        merging it so that <code>main</code> gets one commit per feature instead of twenty
        &ldquo;wip&rdquo; commits. Squash is a merge option, not a third camp: you&rsquo;re still merging,
        you&rsquo;re just flattening the branch first. It&rsquo;s a reasonable default for teams that
        care more about a clean <code>main</code> than about preserving every step.
      </p>

      <h2>If a rebase goes sideways</h2>
      <p>
        Rebases can hit conflicts on each replayed commit, which surprises people expecting a
        single conflict like a merge. Resolve the conflict, <code>git add</code> the files,
        and run <code>git rebase --continue</code>. If you get lost, <code>git rebase --abort</code>{" "}
        puts everything back exactly as it was before you started — it&rsquo;s a safe escape
        hatch. And if you rebased something you shouldn&rsquo;t have, the{" "}
        <Link href="/undo">undo helper</Link> has a recipe for recovering the old commits from
        the reflog.
      </p>

      <Callout tone="tip" title="Try it before you trust it">
        Open the <Link href="/tool">simulator</Link>, build a branch that diverges from{" "}
        <code>main</code>, and run both <code>merge</code> and <code>rebase</code> on separate
        attempts. Watching the graph reshape makes the difference stick far better than reading
        about it.
      </Callout>
    </>
  );
}

export const guide: Guide = {
  slug: "rebase-vs-merge",
  title: "Rebase vs merge: which one, and when",
  description:
    "What rebase and merge actually do to the commit graph, when to use each, and the one rule that keeps rebase from breaking your team's history.",
  category: "Branching",
  readingMinutes: 7,
  datePublished: "2026-07-17",
  related: [
    { href: "/tool", label: "Try merge and rebase in the simulator" },
    { href: "/reference/git-rebase", label: "git rebase in the reference" },
    { href: "/reference/git-merge", label: "git merge in the reference" },
  ],
  Body,
};
