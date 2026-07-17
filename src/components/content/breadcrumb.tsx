import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  name: string;
  /** Omit href on the current (last) page. */
  href?: string;
}

/** Visible breadcrumb trail. Pair with breadcrumbLd() for the machine version. */
export function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-(--motion-fast) hover:text-fg"
                >
                  {item.name}
                </Link>
              ) : (
                <span className={isLast ? "text-fg" : undefined} aria-current={isLast ? "page" : undefined}>
                  {item.name}
                </span>
              )}
              {!isLast && <ChevronRight size={14} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
