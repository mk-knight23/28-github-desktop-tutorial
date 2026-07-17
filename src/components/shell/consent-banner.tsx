"use client";

/**
 * Cookie consent banner (STANDARDS §6 / DESIGN_SYSTEM.md §10).
 *
 * Shows only while consent is unset. Two equal-weight buttons, no dark patterns,
 * default declined. GTM never loads until Accept is chosen. Preference is
 * changeable later at /cookies and /settings.
 */

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import {
  getConsent,
  getServerConsent,
  setConsent,
  subscribeConsent,
} from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function ConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    getServerConsent,
  );

  if (consent !== "unset") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-surface-raised p-4 shadow-3 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-fg-secondary">
            We use analytics cookies only if you accept. Your simulator sessions,
            quiz scores and settings stay in your browser either way. See the{" "}
            <Link href="/cookies" className="text-accent underline underline-offset-2">
              cookie policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => setConsent("denied")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
