"use client";

/**
 * Copy button (DESIGN_SYSTEM.md §10 + §9.4).
 *
 * Non-destructive: single click copies, shows a "Copied" confirmation for 2s.
 * Destructive: the copy is GATED — the first click arms it ("Copy anyway?"),
 * the second click actually copies. This is the binding two-step treatment for
 * destructive commands (reset --hard, push --force, etc.).
 */

import { useEffect, useRef, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { track } from "@/lib/analytics";

type CopyState = "idle" | "armed" | "copied";

interface CopyButtonProps {
  text: string;
  /** When true, require the two-step armed confirmation before copying. */
  destructive?: boolean;
  /** Analytics feature label (never the copied text itself). */
  feature?: string;
  label?: string;
  className?: string;
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  destructive = false,
  feature = "command",
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const doCopy = async () => {
    const ok = await writeClipboard(text);
    if (ok) {
      setState("copied");
      track("result_copied", { feature });
      timer.current = setTimeout(() => setState("idle"), 2000);
    }
  };

  const onClick = async () => {
    if (destructive && state === "idle") {
      setState("armed");
      timer.current = setTimeout(() => setState("idle"), 4000);
      return;
    }
    await doCopy();
  };

  const base =
    "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 text-sm font-medium transition-colors duration-(--motion-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  if (state === "copied") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} border-risk-safe-border bg-risk-safe-bg text-risk-safe ${className}`}
      >
        <Check size={15} aria-hidden="true" />
        Copied
      </button>
    );
  }

  if (state === "armed") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Copy this destructive command anyway"
        className={`${base} border-risk-danger-border bg-risk-danger-bg text-risk-danger ${className}`}
      >
        <TriangleAlert size={15} aria-hidden="true" />
        Copy anyway?
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={destructive ? `${label} (destructive command)` : label}
      className={`${base} border-border-strong text-fg-secondary hover:bg-surface-raised hover:text-fg ${className}`}
    >
      <Copy size={15} aria-hidden="true" />
      {label}
    </button>
  );
}
