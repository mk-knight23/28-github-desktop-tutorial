import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { TutorialRunner } from "@/components/tutorials/tutorial-runner";
import {
  LEVEL_LABEL,
  PATH_LABEL,
  TUTORIALS,
  getTutorial,
  type TutorialLevel,
  type TutorialPath,
} from "@/lib/data/tutorials";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ path: string; slug: string }>;
}

export function generateStaticParams() {
  return TUTORIALS.map((t) => ({ path: t.path, slug: t.level }));
}

function resolve(path: string, slug: string) {
  const validPaths: TutorialPath[] = ["desktop", "cli"];
  const validLevels: TutorialLevel[] = ["beginner", "intermediate", "advanced"];
  if (!validPaths.includes(path as TutorialPath) || !validLevels.includes(slug as TutorialLevel)) {
    return undefined;
  }
  return getTutorial(`${path}-${slug}`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path, slug } = await params;
  const tutorial = resolve(path, slug);
  if (!tutorial) {
    return buildMetadata({ title: "Tutorial not found", description: "Unknown tutorial.", path: `/tutorials/${path}/${slug}` });
  }
  return buildMetadata({
    title: tutorial.title,
    description: `${tutorial.summary} A ${LEVEL_LABEL[tutorial.level].toLowerCase()} ${PATH_LABEL[tutorial.path]} tutorial with ${tutorial.steps.length} steps.`,
    path: `/tutorials/${tutorial.path}/${tutorial.level}`,
  });
}

export default async function TutorialPage({ params }: PageProps) {
  const { path, slug } = await params;
  const tutorial = resolve(path, slug);
  if (!tutorial) notFound();

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tutorial.title,
    description: tutorial.summary,
    totalTime: `PT${tutorial.minutes}M`,
    step: tutorial.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.body,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/tutorials" className="hover:text-fg">
          Tutorials
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>{PATH_LABEL[tutorial.path]}</span>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-fg">{LEVEL_LABEL[tutorial.level]}</span>
      </nav>

      <div className="mt-5">
        <span className="schematic-label text-accent">
          {PATH_LABEL[tutorial.path]} · {LEVEL_LABEL[tutorial.level]}
        </span>
        <h1 className="mt-2 text-3xl font-bold text-fg">{tutorial.title}</h1>
        <p className="mt-3 text-lg text-fg-secondary">{tutorial.summary}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-fg-muted">
          <Clock size={14} aria-hidden="true" /> About {tutorial.minutes} minutes · {tutorial.steps.length} steps
        </p>
      </div>

      <div className="mt-8">
        <TutorialRunner tutorial={tutorial} />
      </div>

      <p className="mt-10 text-sm text-fg-secondary">
        Want to practice the graph operations?{" "}
        <Link href="/tool" className="text-accent underline underline-offset-2">
          Open the simulator
        </Link>
        .
      </p>
    </div>
  );
}
