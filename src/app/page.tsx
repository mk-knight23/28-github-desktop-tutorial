import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="display-heading text-5xl text-fg">
        Mastering the distributed pipeline
      </h1>
      <p className="mt-6 max-w-prose text-lg text-fg-secondary">
        Learn Git by watching what every command does to the commit graph —
        before you run it for real.
      </p>
      <Link
        href="/tool"
        className="mt-8 inline-flex min-h-11 items-center rounded-sm bg-accent px-5 font-medium text-accent-contrast transition-colors duration-(--motion-fast) hover:bg-accent-hover"
      >
        Open the simulator
      </Link>
    </div>
  );
}
