"use client";

/**
 * Typed result renderers for each AI capability (PRODUCT_SPEC §3.8).
 *
 * Whatever produced the data (AI or a deterministic fallback), it satisfies the
 * capability's output type, so these views render both. Commands always go
 * through CommandLine, which enforces the risk treatment — including the
 * two-step gated copy for destructive commands.
 */

import { CommandLine, TerminalPanel } from "@/components/ui/terminal-panel";
import { CopyButton } from "@/components/ui/copy-button";
import { RiskBadge } from "@/components/ui/risk-badge";
import type {
  BranchStrategyOutput,
  CapabilitySlug,
  CommandWithRisk,
  CommitFromDiffOutput,
  ExplainCiErrorOutput,
  ExplainConflictOutput,
  ExplainErrorOutput,
  NlToCommandOutput,
  PrDescriptionOutput,
  RebasePlanOutput,
  ReleaseNotesOutput,
} from "@/lib/ai/types";

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-fg-secondary">{children}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="schematic-label text-fg-muted">{children}</h3>;
}

function OrderedList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm text-fg-secondary marker:text-fg-muted">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-fg-secondary marker:text-fg-muted">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function CommandList({ commands, feature }: { commands: CommandWithRisk[]; feature: string }) {
  if (commands.length === 0) return null;
  return (
    <TerminalPanel title="commands — read-only">
      <div className="space-y-1">
        {commands.map((entry, index) => (
          <div key={index}>
            <CommandLine command={entry.command} risk={entry.riskLevel} feature={feature} />
            {entry.note && <p className="mt-0.5 pl-3 text-xs text-term-comment">{entry.note}</p>}
          </div>
        ))}
      </div>
    </TerminalPanel>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

/* ------------------------------ per capability --------------------------- */

function NlToCommandView({ data }: { data: NlToCommandOutput }) {
  return (
    <div className="space-y-4">
      <TerminalPanel title="suggested command — read-only">
        <CommandLine
          command={data.command}
          risk={data.riskLevel}
          consequence={data.destructiveWarning ?? undefined}
          saferAlternative={data.saferAlternative ?? undefined}
          feature="assistant-nl-to-command"
        />
      </TerminalPanel>
      <Block>
        <SectionHeading>WHAT IT DOES</SectionHeading>
        <Prose>{data.explanation}</Prose>
      </Block>
      <Block>
        <SectionHeading>IF IT GOES WRONG</SectionHeading>
        <Prose>{data.undoGuidance}</Prose>
      </Block>
    </div>
  );
}

function ExplainErrorView({ data }: { data: ExplainErrorOutput }) {
  return (
    <div className="space-y-4">
      <p className="text-base font-bold text-fg">{data.summary}</p>
      <Block>
        <SectionHeading>CAUSE</SectionHeading>
        <Prose>{data.cause}</Prose>
      </Block>
      <Block>
        <SectionHeading>FIX</SectionHeading>
        <OrderedList items={data.fixSteps} />
      </Block>
      <CommandList commands={data.commands} feature="assistant-explain-error" />
      {data.prevention && (
        <Block>
          <SectionHeading>PREVENT IT NEXT TIME</SectionHeading>
          <Prose>{data.prevention}</Prose>
        </Block>
      )}
    </div>
  );
}

function ExplainConflictView({ data }: { data: ExplainConflictOutput }) {
  return (
    <div className="space-y-4">
      <Prose>{data.overview}</Prose>
      {data.hunks.length > 0 && (
        <Block>
          <SectionHeading>CONFLICTS</SectionHeading>
          <div className="space-y-3">
            {data.hunks.map((hunk, index) => (
              <div key={index} className="rounded-sm border border-border p-3">
                <p className="text-sm font-medium text-fg">{hunk.description}</p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="schematic-label shrink-0 text-risk-caution">OURS</dt>
                    <dd className="text-fg-secondary">{hunk.ours}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="schematic-label shrink-0 text-accent">THEIRS</dt>
                    <dd className="text-fg-secondary">{hunk.theirs}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-sm text-fg">→ {hunk.recommendation}</p>
              </div>
            ))}
          </div>
        </Block>
      )}
      {data.resolutionOptions.length > 0 && (
        <Block>
          <SectionHeading>WAYS TO RESOLVE</SectionHeading>
          <div className="space-y-2">
            {data.resolutionOptions.map((option, index) => (
              <div key={index} className="rounded-sm border border-border p-3">
                <p className="text-sm font-medium text-fg">{option.label}</p>
                <p className="mt-1 text-sm text-fg-secondary">{option.approach}</p>
                {option.command && (
                  <div className="mt-2">
                    <TerminalPanel title="command — read-only">
                      <CommandLine command={option.command} feature="assistant-explain-conflict" />
                    </TerminalPanel>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Block>
      )}
      <Block>
        <SectionHeading>NEXT STEPS</SectionHeading>
        <OrderedList items={data.nextSteps} />
      </Block>
    </div>
  );
}

function RebasePlanView({ data }: { data: RebasePlanOutput }) {
  return (
    <div className="space-y-4">
      <Prose>{data.summary}</Prose>
      <Block>
        <SectionHeading>STEPS</SectionHeading>
        <CommandList commands={data.steps} feature="assistant-rebase-plan" />
      </Block>
      {data.risks.length > 0 && (
        <Block>
          <SectionHeading>RISKS</SectionHeading>
          <BulletList items={data.risks} />
        </Block>
      )}
      <Block>
        <SectionHeading>ROLLBACK</SectionHeading>
        <Prose>{data.rollback}</Prose>
      </Block>
    </div>
  );
}

function BranchStrategyView({ data }: { data: BranchStrategyOutput }) {
  return (
    <div className="space-y-4">
      <p className="text-base font-bold text-fg">{data.recommendation}</p>
      <Prose>{data.rationale}</Prose>
      <Block>
        <SectionHeading>HOW IT WORKS</SectionHeading>
        <OrderedList items={data.workflow} />
      </Block>
      {data.branchNames.length > 0 && (
        <Block>
          <SectionHeading>EXAMPLE BRANCH NAMES</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {data.branchNames.map((name, index) => (
              <code
                key={index}
                className="rounded-xs border border-border bg-surface px-2 py-1 font-mono text-xs text-fg"
              >
                {name}
              </code>
            ))}
          </div>
        </Block>
      )}
      {data.tradeoffs.length > 0 && (
        <Block>
          <SectionHeading>TRADEOFFS</SectionHeading>
          <BulletList items={data.tradeoffs} />
        </Block>
      )}
    </div>
  );
}

function CommitFromDiffView({ data }: { data: CommitFromDiffOutput }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-xs border border-border bg-surface px-2 py-1 font-mono text-xs text-fg">
          {data.type}
          {data.scope ? `(${data.scope})` : ""}
        </code>
        {data.isBreaking && <RiskBadge risk="caution" />}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <SectionHeading>COMMIT MESSAGE</SectionHeading>
          <CopyButton text={data.message} feature="assistant-commit-from-diff" label="Copy message" />
        </div>
        <TerminalPanel title="COMMIT_MSG">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-term-text">
            {data.message}
          </pre>
        </TerminalPanel>
      </div>
    </div>
  );
}

function PrDescriptionView({ data }: { data: PrDescriptionOutput }) {
  const markdown = [
    `# ${data.title}`,
    "",
    data.summary,
    "",
    "## Changes",
    ...data.changes.map((change) => `- ${change}`),
    "",
    "## Testing",
    ...data.testing.map((item) => `- ${item}`),
    "",
    "## Checklist",
    ...data.checklist.map((item) => `- [ ] ${item}`),
  ].join("\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold text-fg">{data.title}</p>
        <CopyButton text={markdown} feature="assistant-pr-description" label="Copy as markdown" />
      </div>
      <Prose>{data.summary}</Prose>
      <Block>
        <SectionHeading>CHANGES</SectionHeading>
        <BulletList items={data.changes} />
      </Block>
      <Block>
        <SectionHeading>TESTING</SectionHeading>
        <BulletList items={data.testing} />
      </Block>
      <Block>
        <SectionHeading>CHECKLIST</SectionHeading>
        <ul className="space-y-1.5 text-sm text-fg-secondary">
          {data.checklist.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 text-fg-muted">
                ☐
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Block>
    </div>
  );
}

function ReleaseNotesView({ data }: { data: ReleaseNotesOutput }) {
  return (
    <div className="space-y-4">
      {data.version && <p className="text-base font-bold text-fg">{data.version}</p>}
      {data.highlights.length > 0 && (
        <Block>
          <SectionHeading>HIGHLIGHTS</SectionHeading>
          <BulletList items={data.highlights} />
        </Block>
      )}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <SectionHeading>MARKDOWN</SectionHeading>
          <CopyButton text={data.markdown} feature="assistant-release-notes" label="Copy markdown" />
        </div>
        <TerminalPanel title="RELEASE_NOTES.md">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-term-text">
            {data.markdown}
          </pre>
        </TerminalPanel>
      </div>
    </div>
  );
}

function ExplainCiErrorView({ data }: { data: ExplainCiErrorOutput }) {
  return (
    <div className="space-y-4">
      <p className="text-base font-bold text-fg">{data.summary}</p>
      <Block>
        <SectionHeading>LIKELY CAUSE</SectionHeading>
        <Prose>{data.likelyCause}</Prose>
      </Block>
      <Block>
        <SectionHeading>FIX</SectionHeading>
        <OrderedList items={data.fixSteps} />
      </Block>
      <CommandList commands={data.commands} feature="assistant-explain-ci-error" />
    </div>
  );
}

interface ResultViewProps {
  slug: CapabilitySlug;
  data: unknown;
}

/**
 * Render the result for a slug. The data was validated against the capability's
 * schema (server) or produced by its typed fallback, so the cast is sound.
 */
export function ResultView({ slug, data }: ResultViewProps) {
  switch (slug) {
    case "nl-to-command":
      return <NlToCommandView data={data as NlToCommandOutput} />;
    case "explain-error":
      return <ExplainErrorView data={data as ExplainErrorOutput} />;
    case "explain-conflict":
      return <ExplainConflictView data={data as ExplainConflictOutput} />;
    case "rebase-plan":
      return <RebasePlanView data={data as RebasePlanOutput} />;
    case "branch-strategy":
      return <BranchStrategyView data={data as BranchStrategyOutput} />;
    case "commit-from-diff":
      return <CommitFromDiffView data={data as CommitFromDiffOutput} />;
    case "pr-description":
      return <PrDescriptionView data={data as PrDescriptionOutput} />;
    case "release-notes":
      return <ReleaseNotesView data={data as ReleaseNotesOutput} />;
    case "explain-ci-error":
      return <ExplainCiErrorView data={data as ExplainCiErrorOutput} />;
    default:
      return null;
  }
}
