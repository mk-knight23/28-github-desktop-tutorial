import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/shell/site-nav";
import { SiteFooter } from "@/components/shell/site-footer";
import { ConsentBanner } from "@/components/shell/consent-banner";
import { CREATOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Interactive Git Simulator & Learning Platform`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: CREATOR.name, url: CREATOR.portfolio }],
  creator: CREATOR.name,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Interactive Git Simulator & Learning Platform`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Interactive Git Simulator & Learning Platform`,
    description: SITE_DESCRIPTION,
  },
};

/**
 * Pre-paint theme + motion script (DESIGN_SYSTEM.md §12): reads stored prefs,
 * defaults to dark. Runs before first paint so there is no theme flash.
 */
const PRE_PAINT_SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("mk-gitflow:theme");if(t==="light"||t==="dark"){d.dataset.theme=t}else if(t==="system"){d.dataset.theme=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}else{d.dataset.theme="dark"}var m=localStorage.getItem("mk-gitflow:motion");if(m==="allow"||m==="reduce"){d.dataset.motion=m}}catch(e){d.dataset.theme="dark"}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col blueprint-bg">
        <a
          href="#main-content"
          className="schematic-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-3 focus:text-accent-contrast"
        >
          Skip to main content
        </a>
        <SiteNav />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
