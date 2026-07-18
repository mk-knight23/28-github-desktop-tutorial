"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDown, Menu, Settings, X } from "lucide-react";
import { GithubIcon } from "@/components/shell/icons";
import { BranchLogo } from "@/components/shell/logo";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { CREATOR } from "@/lib/site";

interface NavLink {
  href: string;
  label: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { href: "/", label: "Simulator" },
  { href: "/assistant", label: "Assistant" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/quiz", label: "Quiz" },
  { href: "/reference", label: "Reference" },
];

const TOOL_LINKS: NavLink[] = [
  { href: "/gitignore", label: ".gitignore" },
  { href: "/commits", label: "Commit Builder" },
  { href: "/undo", label: "Undo Helper" },
  { href: "/analyzer", label: "Repo Analyzer" },
];

const SECONDARY_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ link, pathname, onNavigate }: { link: NavLink; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, link.href);
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`schematic-label flex min-h-11 items-center border-b-2 px-3 transition-colors duration-(--motion-fast) ${
        active
          ? "border-accent text-fg"
          : "border-transparent text-fg-secondary hover:text-fg"
      }`}
    >
      {link.label}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const toolsActive = TOOL_LINKS.some((l) => isActive(pathname, l.href));

  const closeDropdown = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <header className="nav-glass sticky top-0 z-40">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5"
          aria-label="MK GitFlow home"
        >
          <BranchLogo size={26} />
          <span className="schematic-label text-fg">
            MK GitFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-stretch lg:flex">
          {PRIMARY_LINKS.map((link) => (
            <NavItem key={link.href} link={link} pathname={pathname} />
          ))}
          <details ref={detailsRef} className="group relative">
            <summary
              className={`schematic-label flex min-h-11 cursor-pointer list-none items-center gap-1 border-b-2 px-3 transition-colors duration-(--motion-fast) [&::-webkit-details-marker]:hidden ${
                toolsActive
                  ? "border-accent text-fg"
                  : "border-transparent text-fg-secondary hover:text-fg"
              }`}
            >
              Tools
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="transition-transform duration-(--motion-fast) group-open:rotate-180"
              />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border border-border bg-surface-raised p-1.5 shadow-2">
              {[...TOOL_LINKS, ...SECONDARY_LINKS.slice(0, 1)].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeDropdown}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={`schematic-label flex min-h-11 items-center rounded-xs px-3 transition-colors duration-(--motion-fast) ${
                    isActive(pathname, link.href)
                      ? "bg-surface text-accent"
                      : "text-fg-secondary hover:bg-surface hover:text-fg"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={CREATOR.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Project repository on GitHub (opens in a new tab)"
            className="hidden h-11 w-11 items-center justify-center rounded-sm border border-border text-fg-secondary transition-colors duration-(--motion-fast) hover:bg-surface-raised hover:text-fg sm:flex"
          >
            <GithubIcon size={20} />
          </a>
          <Link
            href="/settings"
            aria-label="Settings"
            aria-current={isActive(pathname, "/settings") ? "page" : undefined}
            className={`hidden h-11 w-11 items-center justify-center rounded-sm border transition-colors duration-(--motion-fast) sm:flex ${
              isActive(pathname, "/settings")
                ? "border-accent text-accent"
                : "border-border text-fg-secondary hover:bg-surface-raised hover:text-fg"
            }`}
          >
            <Settings size={20} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm border border-border text-fg-secondary transition-colors duration-(--motion-fast) hover:bg-surface-raised hover:text-fg lg:hidden"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-border bg-surface px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col">
            {[...PRIMARY_LINKS, ...TOOL_LINKS, ...SECONDARY_LINKS].map((link) => (
              <li key={link.href}>
                <NavItem
                  link={link}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
