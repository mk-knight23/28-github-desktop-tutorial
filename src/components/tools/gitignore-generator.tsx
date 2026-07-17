"use client";

/**
 * .gitignore generator (PRODUCT_SPEC §3.5): multi-select bundled templates,
 * deduplicated merged output with section headers, copy + download. Fully
 * offline — templates ship with the app.
 */

import { useMemo, useState } from "react";
import { Download, FileCode2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { GITIGNORE_TEMPLATES, mergeTemplates } from "@/lib/data/gitignore-templates";
import { track } from "@/lib/analytics";

export function GitignoreGenerator() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["node", "macos"]));

  const orderedIds = useMemo(
    () => GITIGNORE_TEMPLATES.filter((t) => selected.has(t.id)).map((t) => t.id),
    [selected],
  );
  const output = useMemo(() => (orderedIds.length ? mergeTemplates(orderedIds) : ""), [orderedIds]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
    track("result_exported", { feature: "gitignore" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
      <fieldset>
        <legend className="schematic-label text-fg-muted">TEMPLATES ({selected.size} selected)</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {GITIGNORE_TEMPLATES.map((t) => {
            const isOn = selected.has(t.id);
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors duration-(--motion-fast) ${
                  isOn ? "border-accent bg-surface-raised text-fg" : "border-border text-fg-secondary hover:bg-surface-raised"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(t.id)}
                  className="accent-[var(--accent)]"
                />
                {t.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="min-w-0">
        <div className="flex items-center justify-between">
          <span className="schematic-label text-fg-muted">OUTPUT · .gitignore</span>
          {output && (
            <div className="flex gap-2">
              <CopyButton text={output} feature="gitignore" />
              <Button size="sm" variant="secondary" onClick={onDownload}>
                <Download size={15} aria-hidden="true" /> Download
              </Button>
            </div>
          )}
        </div>
        <div className="mt-3 overflow-hidden rounded-md border border-border bg-terminal">
          {output ? (
            <pre className="max-h-[32rem] overflow-auto p-4 font-mono text-sm leading-relaxed text-term-text">
              {output}
            </pre>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <FileCode2 size={22} className="text-term-comment" aria-hidden="true" />
              <p className="font-mono text-sm text-term-comment">
                Select one or more templates to build your .gitignore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
