import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        A branching strategy is just an agreement about where work happens and how it gets to
        production. Teams tie themselves in knots debating this, but for most small teams the
        honest answer is: pick the simplest thing that fits how often you release, and change it
        only when it actually hurts. This guide compares the common strategies and gives a plain
        recommendation.
      </p>

      <Callout tone="note" title="A note on the name">
        &ldquo;GitFlow&rdquo; is also the name of a specific, fairly heavy branching model (the nvie
        model). This site&rsquo;s name is brand, not an endorsement of that model — we teach the
        mechanics so you can choose. The model is one option below, not the default.
      </Callout>

      <h2>Trunk-based development</h2>
      <p>
        Everyone works off one main branch (&ldquo;trunk&rdquo;). You cut short-lived branches for a
        feature or fix, keep them alive for hours or a day or two, and merge back frequently.
        Releases come straight off <code>main</code>, often behind feature flags for work
        that&rsquo;s not ready to show.
      </p>
      <ul>
        <li><strong>Good for:</strong> teams that deploy continuously or several times a week.</li>
        <li><strong>Strength:</strong> few long-lived branches means few big, scary merges.</li>
        <li><strong>Cost:</strong> needs discipline — small commits, good tests, and feature flags for half-done work.</li>
      </ul>

      <h2>GitHub Flow</h2>
      <p>
        A lightly structured version of trunk-based: <code>main</code> is always deployable, all
        work happens on branches, and every change goes through a pull request before merging.
        Merge to <code>main</code> triggers a deploy. That&rsquo;s essentially the whole model.
      </p>
      <ul>
        <li><strong>Good for:</strong> most web apps and small teams. This is a sensible default.</li>
        <li><strong>Strength:</strong> simple to explain, pairs naturally with PR review and CI.</li>
        <li><strong>Cost:</strong> assumes you can deploy <code>main</code> at any time; awkward if you ship on a fixed calendar.</li>
      </ul>

      <h2>Release branches</h2>
      <p>
        You develop on <code>main</code>, and when you&rsquo;re preparing a release you cut a{" "}
        <code>release/1.4</code> branch to stabilize it — only bug fixes go in, while new
        features keep landing on <code>main</code>. Fixes made on the release branch get merged
        back so <code>main</code> has them too.
      </p>
      <ul>
        <li><strong>Good for:</strong> versioned or installed software, mobile apps, anything with a real release cadence.</li>
        <li><strong>Strength:</strong> lets you harden a release without freezing all other work.</li>
        <li><strong>Cost:</strong> you have to remember to merge fixes back, or they get lost.</li>
      </ul>

      <h2>The full GitFlow model</h2>
      <p>
        The nvie model adds long-lived <code>develop</code> and <code>main</code> branches, plus
        <code>feature/</code>, <code>release/</code>, and <code>hotfix/</code> branches with
        rules about how they flow into each other. It&rsquo;s thorough and it works, but it&rsquo;s a lot
        of ceremony for a team that deploys often.
      </p>
      <ul>
        <li><strong>Good for:</strong> larger teams shipping versioned software on a schedule, with parallel releases to support.</li>
        <li><strong>Strength:</strong> a clear place for every kind of work.</li>
        <li><strong>Cost:</strong> heavy. Most small, continuously-deployed teams find it slows them down for no gain.</li>
      </ul>

      <h2>A plain recommendation</h2>
      <p>
        If you&rsquo;re a small team building a web app, start with <strong>GitHub Flow</strong>:
        deployable <code>main</code>, short branches, PR review, merge to deploy. It&rsquo;s enough
        structure to be safe and little enough to stay out of your way. Add release branches
        only when you genuinely need to stabilize a version while other work continues. Reach
        for full GitFlow only when the team and the release complexity actually demand it — not
        because it looks official.
      </p>

      <h2>Naming branches</h2>
      <p>
        Whatever the model, consistent branch names help. A common shape is{" "}
        <code>type/short-description</code>: <code>feat/user-export</code>,{" "}
        <code>fix/login-redirect</code>, <code>chore/bump-deps</code>. Keep them short,
        lowercase, and hyphenated. Some teams prefix with a ticket number
        (<code>fix/PROJ-482-login</code>) so branches link back to the tracker. Pick one shape
        and stick to it.
      </p>

      <p>
        You can rehearse any of these flows on a graph in the{" "}
        <Link href="/tool">simulator</Link> — create branches, merge them back, and watch how
        each strategy shapes the history. The{" "}
        <Link href="/reference/git-branch">git branch reference</Link> covers the commands for
        creating and cleaning up branches.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "branch-strategies",
  title: "Branching strategies for small teams",
  description:
    "Trunk-based, GitHub Flow, release branches, and full GitFlow compared plainly — with a straight recommendation for small teams and a branch-naming convention.",
  category: "Branching",
  readingMinutes: 8,
  datePublished: "2026-07-17",
  related: [
    { href: "/tool", label: "Rehearse a branching flow in the simulator" },
    { href: "/reference/git-branch", label: "git branch in the reference" },
  ],
  Body,
};
