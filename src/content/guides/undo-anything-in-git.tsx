import Link from "next/link";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        Almost nothing in Git is truly lost. Commits you make stick around in the reflog for
        weeks even after you &ldquo;delete&rdquo; them, and most mistakes have a calm, specific fix.
        The trick is matching the situation to the right tool instead of reaching for{" "}
        <code>reset --hard</code> and hoping. This guide walks through the common ways people
        want to undo something, from safest to most drastic.
      </p>

      <Callout tone="tip" title="First move, always">
        Before any risky recovery, make a backup branch: <code>git branch backup-before-fix</code>.
        It costs nothing and it means the worst case is &ldquo;check out the backup and start over.&rdquo;
      </Callout>

      <h2>Undo changes you haven&rsquo;t committed yet</h2>
      <p>
        If you edited files and want them back to the last commit, restore them. This throws
        away uncommitted work in those files, so be sure that&rsquo;s what you want.
      </p>
      <TerminalPanel>
        <CommandLine command="git restore src/app.ts" risk="caution" feature="guide:undo-anything" />
        <CommandLine
          command="git restore ."
          risk="destructive"
          consequence="Discards all uncommitted changes in tracked files. There is no undo for this."
          saferAlternative="git stash"
          feature="guide:undo-anything"
        />
      </TerminalPanel>
      <p>
        If you&rsquo;re not sure, <code>git stash</code> instead. It tucks your changes away safely
        and you can bring them back with <code>git stash pop</code>. Stash is the low-stakes
        version of &ldquo;get these changes out of my way for now.&rdquo;
      </p>

      <h2>Undo the last commit but keep the changes</h2>
      <p>
        You committed too early, or bundled two things together. Move the commit&rsquo;s changes
        back into your working area and recommit properly.
      </p>
      <TerminalPanel>
        <CommandLine command="git reset --soft HEAD~1" risk="caution" feature="guide:undo-anything" />
      </TerminalPanel>
      <p>
        <code>--soft</code> keeps everything staged; <code>--mixed</code> (the default) keeps
        the changes but unstages them. Neither touches your files&rsquo; contents, so this is much
        gentler than it sounds. It only rewinds the branch pointer by one commit.
      </p>

      <h2>Fix the last commit message or add a forgotten file</h2>
      <TerminalPanel>
        <CommandLine command='git commit --amend -m "correct message"' risk="caution" feature="guide:undo-anything" />
      </TerminalPanel>
      <p>
        Amend replaces the previous commit with a new one. Great before you push. After you
        push, amending rewrites shared history, so treat it like rebase: fine locally, risky
        once others have the commit.
      </p>

      <h2>Undo a commit that&rsquo;s already pushed</h2>
      <p>
        This is where people get into trouble by force-pushing. Don&rsquo;t. Instead, make a new
        commit that reverses the old one. <code>revert</code> is safe on shared branches
        because it adds history rather than rewriting it.
      </p>
      <TerminalPanel>
        <CommandLine command="git revert <commit-sha>" risk="safe" feature="guide:undo-anything" />
      </TerminalPanel>

      <h2>Undo a merge</h2>
      <p>
        You merged a branch and immediately regretted it. If you haven&rsquo;t pushed, the cleanest
        fix is to move the branch back to where it was before the merge. Git records that spot as{" "}
        <code>ORIG_HEAD</code> right after a merge, so you rarely need to look up the SHA yourself.
      </p>
      <TerminalPanel>
        <CommandLine command="git reset --merge ORIG_HEAD" risk="destructive" consequence="Rewinds the branch to before the merge and discards the merge result. Make a backup branch first." saferAlternative="git branch backup-before-undo" feature="guide:undo-anything" />
      </TerminalPanel>
      <p>
        If the merge is <em>already pushed</em>, don&rsquo;t rewind shared history. Revert it instead,
        but a merge has two parents, so you must tell Git which one to keep with <code>-m 1</code>{" "}
        (the branch you merged into). Reverting a merge is subtle — re-merging that branch later
        won&rsquo;t bring the changes back cleanly — so read the note in the reference before you rely
        on it.
      </p>
      <TerminalPanel>
        <CommandLine command="git revert -m 1 <merge-sha>" risk="caution" feature="guide:undo-anything" />
      </TerminalPanel>

      <h2>Recover commits after a bad reset</h2>
      <p>
        You ran <code>reset --hard</code> and your commits vanished. They&rsquo;re almost certainly
        still in the reflog, which records where <code>HEAD</code> has been.
      </p>
      <TerminalPanel>
        <CommandLine command="git reflog" risk="safe" feature="guide:undo-anything" />
        <CommandLine command="git reset --hard HEAD@{2}" risk="destructive" consequence="Moves your branch to a previous position; make a backup branch first." saferAlternative="git branch recovered HEAD@{2}" feature="guide:undo-anything" />
      </TerminalPanel>
      <p>
        Find the line just before the mistake, note its <code>HEAD@{"{n}"}</code> reference,
        and either reset to it or — safer — create a branch pointing at it so nothing else
        moves.
      </p>

      <h2>Recover a deleted branch</h2>
      <p>
        Deleting a branch only removes the label, not the commits. Find the commit in the
        reflog and re-attach a branch name to it.
      </p>
      <TerminalPanel>
        <CommandLine command="git reflog" risk="safe" feature="guide:undo-anything" />
        <CommandLine command="git branch feature/recovered <commit-sha>" risk="safe" feature="guide:undo-anything" />
      </TerminalPanel>

      <h2>When the reflog can&rsquo;t help</h2>
      <p>
        The reflog is local and time-limited (garbage collection eventually prunes very old,
        unreferenced commits, typically after 90 days). It also doesn&rsquo;t track uncommitted
        changes you never staged. That&rsquo;s the real reason to commit often: a commit is a save
        point the reflog can find later. Uncommitted edits that you <code>reset --hard</code>{" "}
        away are the one thing Git genuinely cannot bring back.
      </p>

      <p>
        For a guided version of all this, the <Link href="/undo">undo helper</Link> lets you
        pick your exact situation and gives you the recipe with copy-ready commands. And if you
        want to see what a reset does to the graph before you run it, try it in the{" "}
        <Link href="/tool">simulator</Link> first.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "undo-anything-in-git",
  title: "How to undo almost anything in Git",
  description:
    "A calm, situation-by-situation guide to undoing changes in Git — from uncommitted edits to bad resets and deleted branches — using the safest tool for each.",
  category: "Recovery",
  readingMinutes: 8,
  datePublished: "2026-07-17",
  related: [
    { href: "/undo", label: "Open the undo & recovery helper" },
    { href: "/reference/git-reflog", label: "git reflog in the reference" },
    { href: "/reference/git-revert", label: "git revert in the reference" },
  ],
  Body,
};
