import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        GitHub Desktop hides the command line behind buttons, which makes it a gentle way to
        learn the shape of Git before the syntax. The concepts are identical — commit, branch,
        push, pull — you just click instead of type. This guide is a calm, repeatable daily
        workflow: the same few steps, in the same order, every time. Once the rhythm is muscle
        memory, the commands make more sense too.
      </p>

      <Callout tone="note" title="Same ideas, different surface">
        Every button here maps to a command you can look up in the{" "}
        <Link href="/reference">reference</Link>. &ldquo;Commit&rdquo; is <code>git commit</code>,
        &ldquo;Push origin&rdquo; is <code>git push</code>, &ldquo;Fetch/Pull&rdquo; is{" "}
        <code>git fetch</code>/<code>git pull</code>. Learning the workflow teaches the mental
        model; the commands are the same model with a keyboard.
      </Callout>

      <h2>Step 1: Pull before you start</h2>
      <p>
        Open your repository and click <strong>Fetch origin</strong>. If it turns into{" "}
        <strong>Pull origin</strong>, someone pushed changes since you last looked — pull them
        in before you write a line of code. Starting from the current state avoids most
        conflicts before they happen. This is the single habit that prevents the most pain.
      </p>

      <h2>Step 2: Make a branch for the work</h2>
      <p>
        Use <strong>Current Branch → New Branch</strong> and name it for the task:{" "}
        <code>fix-login-redirect</code>, <code>add-export-button</code>. Working on a branch
        instead of directly on <code>main</code> keeps your in-progress work separate, so{" "}
        <code>main</code> always stays in a known-good state and you can switch tasks without
        losing your place.
      </p>

      <h2>Step 3: Do your work, then read the diff</h2>
      <p>
        Edit files in your editor as usual. GitHub Desktop shows every change in the{" "}
        <strong>Changes</strong> tab, line by line. Actually read this diff before committing.
        It&rsquo;s the cheapest code review there is, and it catches stray debug lines,
        accidental file additions, and secrets far more often than you&rsquo;d expect.
      </p>

      <h2>Step 4: Commit in small, labeled pieces</h2>
      <p>
        You don&rsquo;t have to commit everything at once — tick the checkboxes next to the changes
        that belong together, write a clear summary, and click <strong>Commit</strong>. Small,
        single-purpose commits are easier to understand later and easier to undo if one turns
        out to be wrong. For a summary format that scales, see the{" "}
        <Link href="/guides/conventional-commits">Conventional Commits guide</Link>.
      </p>

      <h2>Step 5: Push to share (or back up)</h2>
      <p>
        Click <strong>Push origin</strong> to send your branch to GitHub. Even if you&rsquo;re not
        ready for review, pushing is a backup: your work now exists somewhere other than your
        laptop. Push often for that reason alone.
      </p>

      <h2>Step 6: Open a pull request</h2>
      <p>
        When the work is ready, click <strong>Create Pull Request</strong>. This opens GitHub
        in your browser with your branch teed up. Describe what changed and why, request a
        reviewer, and let the conversation happen there. When it&rsquo;s approved and merged, your
        change lands on <code>main</code>.
      </p>

      <h2>Step 7: Clean up and repeat</h2>
      <p>
        After the PR merges, switch back to <code>main</code>, pull to get your just-merged
        change, and delete the old branch (Desktop offers to). Then you&rsquo;re back at step one,
        clean, for the next task. That loop — pull, branch, work, commit, push, PR, clean up —
        is the whole job most days.
      </p>

      <Callout tone="tip" title="When something looks scary">
        GitHub Desktop has a <strong>History</strong> tab and can undo the last commit from the
        menu. If a word like &ldquo;rebase&rdquo; or &ldquo;force push&rdquo; appears, slow down and check the{" "}
        <Link href="/reference">reference</Link> or the <Link href="/undo">undo helper</Link>{" "}
        first. Nothing in this daily loop is destructive, and it&rsquo;s good to keep it that way.
      </Callout>

      <h2>What Desktop won&rsquo;t teach you</h2>
      <p>
        The buttons are a great on-ramp, but they smooth over a few things worth knowing
        eventually: what a merge commit is, what rebase does, and how to recover from mistakes.
        When you&rsquo;re ready, the <Link href="/tool">simulator</Link> shows those operations on a
        live graph, and the guided{" "}
        <Link href="/tutorials/desktop/beginner">Desktop beginner tutorial</Link> walks the same
        workflow with checkpoints you can mark off.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "github-desktop-workflow",
  title: "A calm GitHub Desktop workflow for beginners",
  description:
    "A repeatable daily Git workflow in GitHub Desktop — pull, branch, commit, push, PR, clean up — with each button mapped to the command it stands for.",
  category: "Workflow",
  readingMinutes: 7,
  datePublished: "2026-07-17",
  howTo: [
    { name: "Pull before you start", text: "Fetch origin and pull any new changes before writing code." },
    { name: "Make a branch", text: "Create a new branch named for the task instead of working on main." },
    { name: "Read the diff", text: "Review every change in the Changes tab before committing." },
    { name: "Commit in small pieces", text: "Select related changes, write a clear summary, and commit." },
    { name: "Push to share", text: "Push the branch to GitHub as both a backup and a way to share." },
    { name: "Open a pull request", text: "Create a PR describing the change and request a reviewer." },
    { name: "Clean up", text: "Switch to main, pull, and delete the merged branch." },
  ],
  related: [
    { href: "/tutorials/desktop/beginner", label: "Follow the Desktop beginner tutorial" },
    { href: "/tool", label: "See these operations in the simulator" },
  ],
  Body,
};
