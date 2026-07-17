import Link from "next/link";
import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { Callout } from "@/components/content/callout";
import type { Guide } from "./types";

function Body() {
  return (
    <>
      <p>
        A red CI check is a message, not a verdict. Most failures fall into a handful of
        categories, and knowing which one you&rsquo;re looking at tells you what to do next. This
        guide is a triage order: the questions to ask, from cheapest to most involved, so you
        spend your time on the real problem instead of guessing.
      </p>

      <h2>Step 1: Read the actual error, not the summary</h2>
      <p>
        The dashboard says &ldquo;build failed.&rdquo; That&rsquo;s not the error. Open the failing job and
        scroll to the first red line — CI logs often print a cascade of follow-on failures, and
        only the first one matters. Search the log for <code>error</code>, <code>failed</code>,
        or <code>exit code</code>. The genuine cause is usually one specific line, and the rest
        is noise reacting to it.
      </p>

      <Callout tone="tip" title="Paste the log, get an explanation">
        If a CI log is dense or unfamiliar, the{" "}
        <Link href="/assistant">assistant</Link> has an &ldquo;explain CI error&rdquo; capability: paste
        the relevant excerpt and it explains the likely cause and fixes. It never runs anything —
        it reads the text you give it. When AI is unavailable, this triage list is your manual
        fallback.
      </Callout>

      <h2>Step 2: Ask &ldquo;does it fail on my machine?&rdquo;</h2>
      <p>
        Run the same command CI runs — the exact one from the workflow file — locally. Two
        outcomes, both useful:
      </p>
      <ul>
        <li><strong>It fails locally too.</strong> Good — it&rsquo;s a real bug in your change, and you can iterate quickly without pushing.</li>
        <li><strong>It passes locally.</strong> Now you have an environment difference to chase (step 4).</li>
      </ul>

      <h2>Step 3: Is it your change, or was it already broken?</h2>
      <p>
        Check whether <code>main</code> is green. If <code>main</code> is already red, you may
        have inherited someone else&rsquo;s failure and your change is fine. If <code>main</code> is
        green and your branch is red, the cause is in your diff or in how your branch combines
        with <code>main</code>.
      </p>
      <p>
        If a test passes on your branch alone but fails after merging, the problem is the
        combination — someone changed something your code depends on. Rebase or merge{" "}
        <code>main</code> into your branch and run again to reproduce it locally.
      </p>

      <h2>Step 4: Environment differences</h2>
      <p>When it passes locally but fails in CI, the difference is usually one of these:</p>
      <ul>
        <li><strong>Dependencies.</strong> CI installs from the lockfile fresh; you might have stale or extra packages locally. Delete <code>node_modules</code> and reinstall from the lockfile to match.</li>
        <li><strong>Environment variables.</strong> A secret or config value present on your machine may be missing in CI. Check what the job has access to.</li>
        <li><strong>Versions.</strong> Node, Python, or the OS image in CI may differ from yours. Match the version the workflow pins.</li>
        <li><strong>Uncommitted files.</strong> The classic: it works because of a file you never committed. CI only has what&rsquo;s in the repo. Check <code>git status</code>.</li>
        <li><strong>Time and order.</strong> Tests that depend on the clock, timezone, or run order can pass locally and fail on CI&rsquo;s faster or parallel runner.</li>
      </ul>

      <h2>Step 5: Flaky, not broken</h2>
      <p>
        If the same commit passes on a re-run with no changes, the test is flaky — usually a
        race condition, a real network call, or shared state between tests. Re-running is a
        workaround, not a fix; note the flaky test so it gets stabilized, because a test that
        cries wolf trains everyone to ignore red.
      </p>

      <h2>Step 6: Bisect when the cause is hidden</h2>
      <p>
        If something broke and you can&rsquo;t see where, let Git find the commit that introduced it.
        <code>git bisect</code> does a binary search through history: you mark a known-good and a
        known-bad commit, and it checks out the midpoints for you to test.
      </p>
      <TerminalPanel>
        <CommandLine command="git bisect start" risk="safe" feature="guide:ci-triage" />
        <CommandLine command="git bisect bad" risk="safe" feature="guide:ci-triage" />
        <CommandLine command="git bisect good <last-known-good-sha>" risk="safe" feature="guide:ci-triage" />
      </TerminalPanel>
      <p>
        Test each commit Git gives you, mark it <code>good</code> or <code>bad</code>, and it
        narrows down to the exact commit that broke things. Run <code>git bisect reset</code>{" "}
        when you&rsquo;re done to return to where you were.
      </p>

      <h2>A calm order to work in</h2>
      <ol>
        <li>Read the first real error line.</li>
        <li>Reproduce it locally with the same command.</li>
        <li>Check whether <code>main</code> is green to isolate blame.</li>
        <li>If it&rsquo;s environment-only, compare deps, env vars, and versions.</li>
        <li>If it&rsquo;s intermittent, treat it as flaky and note it.</li>
        <li>If the cause is buried, bisect to the commit.</li>
      </ol>

      <p>
        Most CI failures are boring once you name them. The{" "}
        <Link href="/reference/git-bisect">git bisect reference</Link> covers the search in
        detail, and the <Link href="/assistant">assistant</Link> can explain an unfamiliar log
        excerpt when you&rsquo;re stuck on step one.
      </p>
    </>
  );
}

export const guide: Guide = {
  slug: "ci-failure-triage",
  title: "Triaging a failing CI run",
  description:
    "A calm, cheapest-first triage order for red CI checks: read the real error, reproduce locally, isolate blame, check the environment, spot flakes, and bisect.",
  category: "CI",
  readingMinutes: 8,
  datePublished: "2026-07-17",
  related: [
    { href: "/assistant", label: "Explain a CI log with the assistant" },
    { href: "/reference/git-bisect", label: "git bisect in the reference" },
  ],
  Body,
};
