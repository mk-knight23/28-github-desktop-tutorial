import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { UseCase } from "./types";

function Body() {
  return (
    <>
      <p>
        A new developer joins the team and Git is the first wall they hit. They can commit, but
        the moment a merge conflict or a wrong-branch commit appears, work stops and they wait
        for someone senior to rescue them. That interruption is expensive on both sides. The
        goal here is to give a junior enough real understanding that they can get themselves
        unstuck for the common cases.
      </p>

      <h2>The problem with &ldquo;just run these commands&rdquo;</h2>
      <p>
        Handing someone a cheat sheet of commands produces cargo-cult Git: they type things that
        usually work and panic when they don&rsquo;t, because they never had a model of what the
        commands do. The fix is to let them <em>see</em> the effect before it&rsquo;s attached to
        their real, scary work.
      </p>

      <h2>A first week that builds a model</h2>
      <ol>
        <li>
          Start in the <Link href="/tool">simulator</Link>. Have them run commit, branch, and
          merge and watch the graph change. Ten minutes here does more than an hour of reading,
          because branches stop being abstract.
        </li>
        <li>
          Send them the <Link href="/guides/reading-the-dag">reading the DAG guide</Link> so the
          picture in the simulator has words attached: commits are nodes, branches are labels,
          HEAD is &ldquo;you are here.&rdquo;
        </li>
        <li>
          Walk the daily loop with the{" "}
          <Link href="/tutorials/desktop/beginner">GitHub Desktop beginner tutorial</Link> or its
          CLI equivalent, depending on what your team uses. Checkpoints let them mark progress.
        </li>
        <li>
          Bookmark the <Link href="/undo">undo helper</Link>. This is the one that saves your
          afternoon: instead of pinging you when they commit to the wrong branch, they pick the
          situation and get the exact recovery steps.
        </li>
      </ol>

      <Callout tone="tip" title="Set the norm early">
        Tell new folks explicitly: &ldquo;When something looks scary, make a backup branch first,
        then check the undo helper.&rdquo; Making the safe reflex the default removes most of the fear
        that leads to worse mistakes.
      </Callout>

      <h2>Reduce the interruptions to you</h2>
      <p>
        The recurring questions — &ldquo;I committed to main, help&rdquo;, &ldquo;I lost my commits&rdquo;, &ldquo;what&rsquo;s
        a rebase&rdquo; — all have a page here you can link instead of context-switching. Over a few
        weeks that turns a stream of one-off rescues into a junior who reaches for the reference
        or the undo helper on their own.
      </p>

      <h2>Check understanding without a test</h2>
      <p>
        The <Link href="/quiz">quizzes</Link> cover basics, branching, merging vs rebasing, and
        undoing changes, with an explanation after every question. They&rsquo;re self-serve and
        low-stakes — a junior can use them to find their own gaps rather than being quizzed by
        you. Scores stay in their browser; there&rsquo;s no leaderboard and no &ldquo;average&rdquo; to measure
        against.
      </p>

      <h2>What this doesn&rsquo;t replace</h2>
      <p>
        This won&rsquo;t teach your specific repo conventions, your CI, or your review culture — that&rsquo;s
        still on you. What it does is take the generic Git anxiety off the table so your
        onboarding time goes to the things only you can teach.
      </p>
    </>
  );
}

export const useCase: UseCase = {
  slug: "onboarding-junior-developers",
  title: "Onboarding junior developers to Git",
  description:
    "Give new developers a real model of Git — simulator, tutorials, and a bookmarked undo helper — so they get themselves unstuck instead of interrupting seniors.",
  audience: "Team leads and mentors",
  summary:
    "Turn a stream of one-off Git rescues into a junior who reaches for the reference and undo helper on their own.",
  tools: [
    { href: "/tool", label: "Branch simulator" },
    { href: "/tutorials", label: "Guided tutorials" },
    { href: "/undo", label: "Undo helper" },
    { href: "/quiz", label: "Quizzes" },
  ],
  datePublished: "2026-07-17",
  Body,
};
