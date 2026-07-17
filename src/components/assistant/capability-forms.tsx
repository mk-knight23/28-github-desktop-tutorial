"use client";

/**
 * Input forms for each AI capability (PRODUCT_SPEC §3.8).
 *
 * A small field-spec registry drives a single generic form renderer, so every
 * capability shares the same labels, focus rings, and disabled behavior. The
 * workspace builds the typed request object from these field names and validates
 * it with the shared zod schema before sending.
 */

import type { CapabilitySlug } from "@/lib/ai/types";

export interface FieldSpec {
  name: string;
  label: string;
  control: "input" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  hint?: string;
}

export const CAPABILITY_FIELDS: Record<CapabilitySlug, FieldSpec[]> = {
  "nl-to-command": [
    {
      name: "text",
      label: "What do you want to do?",
      control: "textarea",
      rows: 3,
      placeholder: "e.g. undo my last commit but keep the changes staged",
      required: true,
    },
    {
      name: "surface",
      label: "Where do you work? (optional)",
      control: "select",
      required: false,
      options: [
        { value: "", label: "No preference" },
        { value: "cli", label: "Command line" },
        { value: "desktop", label: "GitHub Desktop" },
      ],
    },
  ],
  "explain-error": [
    {
      name: "errorText",
      label: "Paste the git error",
      control: "textarea",
      rows: 6,
      placeholder: "fatal: refusing to merge unrelated histories",
      required: true,
    },
  ],
  "explain-conflict": [
    {
      name: "conflictText",
      label: "Paste the conflicted file content",
      control: "textarea",
      rows: 10,
      placeholder: "<<<<<<< HEAD\n...\n=======\n...\n>>>>>>> feature",
      required: true,
      hint: "Include the conflict markers (<<<<<<<, =======, >>>>>>>).",
    },
  ],
  "rebase-plan": [
    {
      name: "goal",
      label: "What are you trying to achieve?",
      control: "textarea",
      rows: 3,
      placeholder: "e.g. move my 3 feature commits on top of the latest main",
      required: true,
    },
    {
      name: "branches",
      label: "Branch notes (optional)",
      control: "textarea",
      rows: 2,
      placeholder: "feature/login is 3 commits behind main",
      required: false,
    },
  ],
  "branch-strategy": [
    {
      name: "context",
      label: "Describe your team and release cadence",
      control: "textarea",
      rows: 4,
      placeholder: "3 devs, deploy to prod a few times a week, no formal QA yet",
      required: true,
    },
  ],
  "commit-from-diff": [
    {
      name: "diff",
      label: "Paste your diff",
      control: "textarea",
      rows: 10,
      placeholder: "git diff  →  paste the output here",
      required: true,
      hint: "Paste the output of `git diff` (staged or unstaged).",
    },
  ],
  "pr-description": [
    {
      name: "commits",
      label: "Paste your commits or a summary",
      control: "textarea",
      rows: 8,
      placeholder: "feat: add login\nfix: handle empty state\n...",
      required: true,
    },
  ],
  "release-notes": [
    {
      name: "commits",
      label: "Paste your commit list",
      control: "textarea",
      rows: 8,
      placeholder: "feat(ui): add dark mode\nfix: correct pagination\n...",
      required: true,
    },
    {
      name: "version",
      label: "Version / tag (optional)",
      control: "input",
      placeholder: "v1.2.0",
      required: false,
    },
  ],
  "explain-ci-error": [
    {
      name: "logText",
      label: "Paste the CI log excerpt",
      control: "textarea",
      rows: 10,
      placeholder: "Paste the failing step's output",
      required: true,
    },
  ],
};

const CONTROL_CLASS =
  "w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60";

interface CapabilityFormProps {
  slug: CapabilitySlug;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  disabled: boolean;
}

export function CapabilityForm({ slug, values, onChange, disabled }: CapabilityFormProps) {
  const fields = CAPABILITY_FIELDS[slug];
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const id = `ai-${slug}-${field.name}`;
        const value = values[field.name] ?? "";
        return (
          <div key={field.name}>
            <label htmlFor={id} className="schematic-label text-fg-muted">
              {field.label}
            </label>
            <div className="mt-2">
              {field.control === "textarea" && (
                <textarea
                  id={id}
                  value={value}
                  rows={field.rows ?? 4}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className={`${CONTROL_CLASS} py-2 font-mono leading-relaxed`}
                />
              )}
              {field.control === "input" && (
                <input
                  id={id}
                  value={value}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className={`${CONTROL_CLASS} min-h-11`}
                />
              )}
              {field.control === "select" && (
                <select
                  id={id}
                  value={value}
                  disabled={disabled}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className={`${CONTROL_CLASS} min-h-11`}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {field.hint && <p className="mt-1.5 text-xs text-fg-muted">{field.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
