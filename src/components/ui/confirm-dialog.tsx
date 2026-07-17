"use client";

/**
 * Confirm dialog (DESIGN_SYSTEM.md §9.5 / §10): focus trap, Esc closes, cancel is
 * the default focus, danger button on the right. Used for destructive simulator
 * operations (reset --hard) before the graph is mutated.
 */

import { useEffect, useRef } from "react";
import { OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  consequence?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  consequence,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Cancel is the first button in DOM order — make it the default focus.
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--scrim)" }}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border-l-[3px] border-risk-danger border-y border-r border-y-border border-r-border bg-surface p-6 shadow-3"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-risk-danger">
            <OctagonAlert size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="confirm-title" className="text-lg font-bold text-fg">
              {title}
            </h2>
            <p id="confirm-desc" className="mt-1.5 text-sm text-fg-secondary">
              {description}
            </p>
            {consequence && (
              <p className="mt-3 rounded-sm bg-risk-danger-bg px-3 py-2 text-sm text-risk-danger">
                {consequence}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
