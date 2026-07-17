import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { UseCase } from "./types";

function Body() {
  return (
    <>
      <p>
        The scariest Git moments share a shape: something disappeared, or went somewhere it
        shouldn&rsquo;t, and you don&rsquo;t know if it&rsquo;s recoverable. The good news is that Git is far more
        forgiving than it feels in that moment — most &ldquo;lost&rdquo; work is still there, findable in
        the reflog. What you need under pressure isn&rsquo;t deep theory; it&rsquo;s the right next command
        for your exact situation.
      </p>

      <h2>Match the situation, don&rsquo;t guess</h2>
      <p>
        Panic leads people to run <code>reset --hard</code> or force-push in the hope it fixes
        things, which often makes recovery harder. The <Link href="/undo">undo helper</Link> is
        built for this: pick what happened — committed to the wrong branch, undid too much,
        deleted a branch, committed a secret — and it gives you a recipe with the commands in
        order, each labeled with a risk level and a safer alternative where one exists.
      </p>

      <Callout tone="tip" title="The universal first step">
        Whatever went wrong, make a backup branch before you try to fix it:{" "}
        <code>git branch backup-before-fix</code>. It freezes the current state under a name, so
        the worst outcome is &ldquo;check out the backup and try again.&rdquo;
      </Callout>

      <h2>The situations that come up most</h2>
      <ul>
        <li><strong>Committed to the wrong branch.</strong> The commits move to the right branch and off the wrong one — no work lost.</li>
        <li><strong>Reset and lost commits.</strong> The reflog remembers where you were; you point a branch back at it.</li>
        <li><strong>Deleted a branch by mistake.</strong> The commits still exist; you re-attach a branch label from the reflog.</li>
        <li><strong>Committed a secret.</strong> This one&rsquo;s different — see below.</li>
        <li><strong>A messy merge.</strong> You can abort a merge in progress, or revert a merge that already landed.</li>
      </ul>
      <p>
        The <Link href="/guides/undo-anything-in-git">undo-anything guide</Link> walks through
        each of these with the reasoning, if you want to understand rather than just copy.
      </p>

      <h2>Understand the fix before you run it</h2>
      <p>
        Recovery commands include some of the sharpest tools in Git. Before you run a{" "}
        <code>reset --hard</code> from a recipe, it helps to have watched what it does to a graph.
        The <Link href="/tool">simulator</Link> lets you rehearse the recovery on a throwaway
        graph first, so the real command isn&rsquo;t the first time you&rsquo;ve seen its effect.
      </p>

      <h2>The one genuinely unrecoverable case</h2>
      <p>
        Git can bring back almost anything you <em>committed</em>. What it can&rsquo;t recover is work
        you never committed and then destroyed — uncommitted edits wiped by <code>reset --hard</code>{" "}
        or <code>git restore</code>, or files removed by <code>git clean</code>. That&rsquo;s the real
        argument for committing often: a commit is a save point the reflog can find later.
      </p>

      <Callout tone="danger" title="A committed secret is a special case">
        Removing a leaked secret from the latest commit doesn&rsquo;t remove it from history — anyone
        with the repo can read the old commit. Treat the secret as compromised and rotate it
        immediately, then purge it from history. The undo helper has the full recipe; rotation
        comes first, always.
      </Callout>

      <h2>Build the reflex</h2>
      <p>
        The lasting win isn&rsquo;t memorizing recovery commands — it&rsquo;s replacing panic with a routine:
        stop, back up the branch, match the situation in the undo helper, run the recipe. Once
        that&rsquo;s the reflex, Git mistakes go from afternoon-enders to five-minute detours.
      </p>
    </>
  );
}

export const useCase: UseCase = {
  slug: "recovering-from-git-mistakes",
  title: "Recovering from Git mistakes without panic",
  description:
    "Most 'lost' Git work is still there. Match your exact situation to a recovery recipe, back up first, and replace panic with a calm routine.",
  audience: "Anyone who's ever broken a repo",
  summary:
    "Replace panic with a routine: stop, back up the branch, match the situation, run the recipe.",
  tools: [
    { href: "/undo", label: "Undo & recovery helper" },
    { href: "/tool", label: "Rehearse recovery in the simulator" },
    { href: "/reference/git-reflog", label: "git reflog reference" },
  ],
  datePublished: "2026-07-17",
  Body,
};
