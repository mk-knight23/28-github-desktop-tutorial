import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { QUIZZES } from "@/lib/data/quizzes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Git quizzes",
  description:
    "Test your Git knowledge across five topics — basics, branching, merging vs rebasing, undoing changes, and collaboration. Deterministic scoring with an explanation after every question. Results stay local.",
  path: "/quiz",
});

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="NODE_04 · QUIZ"
        title="Check what you know"
        description="Five topics, eight questions each. Every question reveals an explanation after you answer. Scores are saved only in this browser."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {QUIZZES.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quiz/${quiz.id}`}
            className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-5 transition-colors duration-(--motion-fast) hover:bg-surface-raised"
          >
            <span className="mt-0.5 shrink-0 text-accent">
              <CircleHelp size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-fg">{quiz.title}</span>
              <span className="mt-1 block text-sm text-fg-secondary">{quiz.description}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-sm text-accent">
                {quiz.questions.length} questions
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
