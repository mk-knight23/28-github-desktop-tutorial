import Link from "next/link";
import { Callout } from "@/components/content/callout";
import type { UseCase } from "./types";

function Body() {
  return (
    <>
      <p>
        &ldquo;Is this repo in good shape?&rdquo; is a question maintainers ask constantly — about their own
        projects, about a dependency they&rsquo;re considering, about a repo they just inherited. The
        honest answer usually comes down to documentation and community files: can a newcomer
        understand what this is, how to run it, how to contribute, and how to report a security
        issue? The <Link href="/analyzer">repo analyzer</Link> turns that into a concrete score
        and a checklist.
      </p>

      <h2>What it checks</h2>
      <p>
        Give it an <code>owner/repo</code> or a GitHub URL and it reads public data over GitHub&rsquo;s
        unauthenticated API: repository metadata, languages, license, whether a README exists and
        some quality heuristics for it (length, sections, badges), and the presence of community
        files — <code>CONTRIBUTING</code>, <code>CODE_OF_CONDUCT</code>, issue and PR templates,
        and a <code>SECURITY</code> policy — plus workflows and releases.
      </p>

      <Callout tone="note" title="Read-only, public, no tokens">
        The analyzer only reads public information and never asks for a token. It can&rsquo;t see
        private repos, and it never writes anything. It&rsquo;s an outside-in view — the same view a
        stranger evaluating your project gets.
      </Callout>

      <h2>From score to action</h2>
      <p>
        A number on its own doesn&rsquo;t help. The analyzer pairs the docs-health score with an
        actionable checklist: not just &ldquo;no CONTRIBUTING.md&rdquo; but a prompt to add one, with a
        starter. The point is to give a maintainer an afternoon&rsquo;s worth of concrete, high-value
        chores rather than a vague sense that the docs could be better.
      </p>

      <h2>Where it fits for a maintainer</h2>
      <ul>
        <li>
          <strong>Onboarding a project you inherited.</strong> Run it first to see what&rsquo;s missing
          before you promise anyone a timeline.
        </li>
        <li>
          <strong>Before promoting a project.</strong> A repo you&rsquo;re about to share widely should
          clear the basics — a README that explains itself, a license, a way to contribute.
        </li>
        <li>
          <strong>Evaluating a dependency.</strong> A well-documented project with a security
          policy and active releases is a different risk than an undocumented one.
        </li>
        <li>
          <strong>As a recurring check.</strong> Re-run periodically; recent analyses are saved in
          your <Link href="/history">history</Link> so you can see whether the score moved.
        </li>
      </ul>

      <h2>Rate limits, handled honestly</h2>
      <p>
        Unauthenticated GitHub requests are rate-limited. If you hit the limit, the analyzer tells
        you plainly and shows the retry-after window rather than failing silently or pretending it
        finished. Results are cached locally so re-opening a recent analysis doesn&rsquo;t spend another
        request.
      </p>

      <h2>What a score can and can&rsquo;t tell you</h2>
      <p>
        Docs health is a real signal, but it&rsquo;s not code quality. A beautifully documented repo can
        still have shaky code, and a terse one can be excellent. Treat the score as &ldquo;how
        approachable is this project?&rdquo; — an important question, but not the only one. Use it to
        find the cheap, high-impact documentation wins, not as a verdict on the engineering.
      </p>
    </>
  );
}

export const useCase: UseCase = {
  slug: "auditing-repo-health",
  title: "Auditing the health of a GitHub repo",
  description:
    "Score any public repo's documentation and community files against an actionable checklist — for projects you own, inherited, or are evaluating as a dependency.",
  audience: "Maintainers and evaluators",
  summary:
    "Turn 'is this repo in good shape?' into a concrete docs-health score and a checklist of high-value chores.",
  tools: [
    { href: "/analyzer", label: "Public repo analyzer" },
    { href: "/history", label: "Saved analyses in history" },
  ],
  datePublished: "2026-07-17",
  Body,
};
