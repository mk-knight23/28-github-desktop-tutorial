import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { UseCase } from "./types";

function Body() {
  return (
    <>
      <p>
        Teaching Git to a room of beginners is hard for one specific reason: it&rsquo;s invisible.
        You can show a merge on a whiteboard, but the students can&rsquo;t poke at it, and the moment
        they&rsquo;re on their own laptops the diagram in their head evaporates. A visual, in-browser
        simulator that everyone can run in parallel closes that gap.
      </p>

      <h2>Why the simulator fits a classroom</h2>
      <ul>
        <li>
          <strong>Nothing breaks.</strong> The <Link href="/tool">simulator</Link> never touches
          a real repository, so a student can run <code>reset --hard</code> or a messy rebase and
          the only consequence is a graph they can reset. That safety changes how willing people
          are to experiment.
        </li>
        <li>
          <strong>Everyone sees the same thing.</strong> You demonstrate an operation on the
          projector; they reproduce it at their desk and compare graphs. No &ldquo;it looks different
          on mine.&rdquo;
        </li>
        <li>
          <strong>It works offline and needs no setup.</strong> No installs, no accounts, no
          accidental pushes to a shared repo during class.
        </li>
      </ul>

      <h2>A session outline</h2>
      <ol>
        <li>
          <strong>Commits and branches (simulator).</strong> Build a few commits, create a
          branch, commit on it, switch back. Pair with the{" "}
          <Link href="/guides/reading-the-dag">DAG guide</Link> for the vocabulary.
        </li>
        <li>
          <strong>Merge vs rebase (simulator).</strong> Run both on the same starting graph so
          students see the fork-and-join of a merge next to the straight line of a rebase. The{" "}
          <Link href="/guides/rebase-vs-merge">rebase vs merge guide</Link> is the reading.
        </li>
        <li>
          <strong>Undoing (undo helper).</strong> Give them a mistake to make on purpose, then
          fix it with the <Link href="/undo">undo helper</Link>. Recovering from a scary state on
          purpose is the lesson that sticks.
        </li>
        <li>
          <strong>Check-in.</strong> The <Link href="/quiz">quizzes</Link> give each student
          immediate, private feedback with per-question explanations — useful as an exit ticket.
        </li>
      </ol>

      <Callout tone="note" title="On the name">
        Worth clearing up in class: this site&rsquo;s name is brand, not the &ldquo;GitFlow&rdquo; branching
        model. It teaches Git mechanics, so it fits any curriculum regardless of which workflow
        your program teaches. The <Link href="/faq">FAQ</Link> spells this out.
      </Callout>

      <h2>Homework that isn&rsquo;t busywork</h2>
      <p>
        Because progress and quiz scores persist locally, students can keep working after class
        and pick up where they left off. Assign a tutorial track and a quiz; they self-check
        without you grading. Point them at the <Link href="/reference">command reference</Link>{" "}
        as their lookup so they build the habit of checking risk levels before running something.
      </p>

      <h2>Honest limits</h2>
      <p>
        A simulator can&rsquo;t teach the messy realities of remotes, credentials, and pull requests
        against a real host — students still need hands-on time with an actual repo. Use this to
        build the mental model and the confidence, then move them onto real Git for the parts
        that only real Git can teach.
      </p>
    </>
  );
}

export const useCase: UseCase = {
  slug: "teaching-git-in-a-bootcamp",
  title: "Teaching Git in a bootcamp or classroom",
  description:
    "Make Git visible for a room of beginners: a safe in-browser simulator everyone runs in parallel, paired with guides, an undo helper, and self-check quizzes.",
  audience: "Instructors and curriculum designers",
  summary:
    "A safe, no-setup simulator plus guides and quizzes that let a whole class experiment with Git without breaking anything.",
  tools: [
    { href: "/tool", label: "Branch simulator" },
    { href: "/tutorials", label: "Guided tutorials" },
    { href: "/quiz", label: "Quizzes" },
    { href: "/reference", label: "Command reference" },
  ],
  datePublished: "2026-07-17",
  Body,
};
