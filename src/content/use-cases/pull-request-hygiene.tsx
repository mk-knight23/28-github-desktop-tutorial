import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { UseCase } from "./types";

function Body() {
  return (
    <>
      <p>
        A pull request is where your team&rsquo;s work meets review. Sloppy PRs — twenty unrelated
        changes, &ldquo;fix stuff&rdquo; commit messages, a diff nobody can follow — make review slow and
        let bugs through. Tidy PRs get reviewed faster and merged with more confidence. Most of
        the hygiene is upstream of the PR itself: it&rsquo;s in how you commit and how you prepare the
        branch.
      </p>

      <h2>Commit messages that a reviewer can skim</h2>
      <p>
        A reviewer often reads the commit list before the diff to understand the shape of the
        change. Clear, single-purpose commits with real messages turn that list into a summary.
        The <Link href="/commits">commit builder</Link> composes{" "}
        <Link href="/guides/conventional-commits">Conventional Commit</Link> messages with live
        validation, so &ldquo;feat(auth): add password reset&rdquo; is as easy to produce as &ldquo;fix stuff.&rdquo;
      </p>

      <h2>One concern per PR</h2>
      <p>
        The single biggest improvement to review quality is scope: a PR that does one thing.
        Reviewers can hold one idea in their head and check it thoroughly; a PR that refactors,
        adds a feature, and fixes a bug at once gets a rubber-stamp because no one can reason
        about all three. If your branch has grown three concerns, split it.
      </p>

      <h2>Clean up the branch before you open the PR</h2>
      <p>
        If your feature branch is a pile of &ldquo;wip&rdquo; commits, tidy it before review. Because these
        commits are yours and not yet shared, you can safely rebase to reorder, squash, or reword
        them. The <Link href="/guides/rebase-vs-merge">rebase vs merge guide</Link> covers when
        this is safe (your own un-pushed work) and when it isn&rsquo;t (anything others have pulled).
      </p>

      <Callout tone="caution" title="Rebase only your own commits">
        Cleaning up a branch with rebase is great — right up until the commits are shared. Once a
        teammate has based work on your branch, leave its history alone and clean up going
        forward instead.
      </Callout>

      <h2>Write the PR description you&rsquo;d want to receive</h2>
      <p>
        A good description says what changed, why, and how to verify it. If you keep tidy
        commits, most of the raw material is already there. The{" "}
        <Link href="/assistant">assistant</Link> can draft a PR description from your commits or a
        summary (with a deterministic builder as the fallback when AI is unavailable) — a starting
        draft you edit, not a substitute for knowing your own change.
      </p>

      <h2>Rebase onto main so the diff is honest</h2>
      <p>
        If <code>main</code> has moved a lot since you branched, rebase your branch onto the
        current <code>main</code> before review. The diff the reviewer sees is then only your
        changes, not a tangle of unrelated updates. Resolve any conflicts locally so review isn&rsquo;t
        the place they&rsquo;re discovered.
      </p>

      <h2>A short pre-PR checklist</h2>
      <ol>
        <li>Does this PR do exactly one thing?</li>
        <li>Are the commits single-purpose with clear messages?</li>
        <li>Is the branch rebased onto current <code>main</code> with conflicts resolved?</li>
        <li>Does the description explain what, why, and how to verify?</li>
        <li>Did you read your own diff top to bottom?</li>
      </ol>

      <p>
        None of this is about ceremony. It&rsquo;s about respecting the reviewer&rsquo;s time and making it
        easy to say yes.
      </p>
    </>
  );
}

export const useCase: UseCase = {
  slug: "pull-request-hygiene",
  title: "Keeping pull requests clean and reviewable",
  description:
    "Upstream habits that make PRs fast to review: single-purpose commits, one concern per PR, cleaning up the branch, a rebase onto main, and a description worth reading.",
  audience: "Developers and reviewers",
  summary:
    "Most PR hygiene is upstream of the PR — in how you commit and prepare the branch. Here's the checklist.",
  tools: [
    { href: "/commits", label: "Commit builder" },
    { href: "/assistant", label: "PR description assistant" },
    { href: "/reference", label: "Command reference" },
  ],
  datePublished: "2026-07-17",
  Body,
};
