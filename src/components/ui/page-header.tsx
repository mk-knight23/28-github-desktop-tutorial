/** Page header: schematic eyebrow + display h1 + description. */

import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Mono schematic eyebrow, e.g. "NODE_01 · SIMULATOR". */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="schematic-label mb-3 text-accent">{eyebrow}</p>
      )}
      <h1 className="display-heading text-4xl text-fg sm:text-5xl">{title}</h1>
      {description && (
        <div className="mt-4 max-w-prose text-lg text-fg-secondary">
          {description}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
