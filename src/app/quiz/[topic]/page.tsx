import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getQuiz, QUIZZES } from "@/lib/data/quizzes";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ topic: q.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const quiz = getQuiz(topic);
  if (!quiz) return buildMetadata({ title: "Quiz not found", description: "Unknown quiz.", path: `/quiz/${topic}` });
  return buildMetadata({
    title: quiz.title,
    description: `${quiz.description} ${quiz.questions.length} questions with explanations. Scored locally.`,
    path: `/quiz/${quiz.id}`,
  });
}

export default async function QuizTopicPage({ params }: PageProps) {
  const { topic } = await params;
  const quiz = getQuiz(topic);
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/quiz" className="hover:text-fg">
          Quiz
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-fg">{quiz.title}</span>
      </nav>
      <div className="mt-6">
        <QuizRunner quiz={quiz} />
      </div>
    </div>
  );
}
