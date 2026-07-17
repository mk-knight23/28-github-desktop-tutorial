/** Route-level loading state: a commit dot traveling a lane (§8.3). */
export default function RootLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-label="Loading page"
    >
      <svg width="120" height="24" viewBox="0 0 120 24" aria-hidden="true">
        <line
          x1="8"
          y1="12"
          x2="112"
          y2="12"
          className="stroke-border-strong"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle r="5" cy="12" className="fill-lane-1">
          <animate
            attributeName="cx"
            values="8;112;8"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <p className="schematic-label text-fg-muted">Loading…</p>
    </div>
  );
}
