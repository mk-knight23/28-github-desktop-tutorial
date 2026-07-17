/** Branch-graph logo lockup (DESIGN_SYSTEM.md §8.3): lane line + node dots. */
export function BranchLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6 3v18"
        className="stroke-lane-1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 8c0 4 12 2 12 7"
        className="stroke-lane-2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="5" r="2.5" className="fill-lane-1" />
      <circle cx="6" cy="19" r="2.5" className="fill-lane-1" />
      <circle cx="18" cy="17" r="2.5" className="fill-lane-2" />
    </svg>
  );
}
