"use client";

/**
 * Quiz runner (PRODUCT_SPEC §3.3): one question at a time, per-question
 * explanation revealed after answering, deterministic scoring, attempt recorded
 * locally, retake supported. Feedback is color + icon + word — never color alone.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Quiz } from "@/lib/data/quizzes";
import { scoreQuiz } from "@/lib/data/quizzes";
import { recordQuizAttempt } from "@/lib/storage";
import { track } from "@/lib/analytics";

type Phase = "answering" | "done";

interface QuizRunnerProps {
  quiz: Quiz;
}

export function QuizRunner({ quiz }: QuizRunnerProps) {
  const [phase, setPhase] = useState<Phase>("answering");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [recorded, setRecorded] = useState(false);

  const total = quiz.questions.length;
  const question = quiz.questions[index];
  const answeredCurrent = question.id in answers;
  const isLast = index === total - 1;
  const score = useMemo(() => scoreQuiz(quiz, answers), [quiz, answers]);

  const choose = (optionIndex: number) => {
    if (answeredCurrent) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const next = () => {
    if (isLast) {
      setPhase("done");
      if (!recorded) {
        void recordQuizAttempt({
          topicId: quiz.id,
          topicTitle: quiz.title,
          score: scoreQuiz(quiz, answers),
          total,
          answers,
        });
        track("tool_completed", { feature: "quiz", topic: quiz.id });
        setRecorded(true);
      }
    } else {
      setIndex((i) => i + 1);
    }
  };

  const retake = () => {
    setPhase("answering");
    setIndex(0);
    setAnswers({});
    setRecorded(false);
  };

  if (phase === "done") {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="schematic-label text-fg-muted">YOUR SCORE</p>
          <p className="mt-3 font-mono text-5xl font-bold tabular-nums text-fg">
            {score}
            <span className="text-fg-muted">/{total}</span>
          </p>
          <p className="mt-2 font-mono text-lg text-fg-secondary">{pct}%</p>
          <p className="mt-4 text-sm text-fg-secondary">
            Saved to your local history. No one else can see this.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={retake}>
              <RotateCcw size={16} aria-hidden="true" /> Retake quiz
            </Button>
            <Link
              href="/quiz"
              className="inline-flex min-h-11 items-center rounded-sm border border-border-strong bg-surface px-5 font-medium text-fg hover:bg-surface-raised"
            >
              Other quizzes
            </Link>
          </div>
        </div>

        <section>
          <h2 className="schematic-label text-fg-muted">REVIEW</h2>
          <ol className="mt-3 space-y-4">
            {quiz.questions.map((q, i) => {
              const chosen = answers[q.id];
              const correct = chosen === q.correctIndex;
              return (
                <li key={q.id} className="rounded-lg border border-border bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-fg">
                      {i + 1}. {q.question}
                    </p>
                    <span
                      className={`schematic-label inline-flex shrink-0 items-center gap-1.5 rounded-xs border px-2 py-1 ${
                        correct
                          ? "border-risk-safe-border bg-risk-safe-bg text-risk-safe"
                          : "border-risk-danger-border bg-risk-danger-bg text-risk-danger"
                      }`}
                    >
                      {correct ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />}
                      {correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fg-secondary">
                    Your answer: <span className="text-fg">{q.options[chosen] ?? "—"}</span>
                    {!correct && (
                      <>
                        {" · "}Correct: <span className="text-risk-safe">{q.options[q.correctIndex]}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-fg-secondary">{q.explanation}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="schematic-label text-fg-muted">
          QUESTION {index + 1} / {total}
        </span>
        <span className="schematic-label text-fg-muted">{quiz.title}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-(--motion-base)"
          style={{ width: `${((index + (answeredCurrent ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-xl font-bold text-fg">{question.question}</legend>
        <div className="mt-5 space-y-3">
          {question.options.map((option, optionIndex) => {
            const isChosen = answers[question.id] === optionIndex;
            const isCorrect = optionIndex === question.correctIndex;
            let cls = "border-border hover:bg-surface-raised";
            let mark = null;
            if (answeredCurrent) {
              if (isCorrect) {
                cls = "border-risk-safe-border bg-risk-safe-bg";
                mark = <Check size={16} className="text-risk-safe" aria-hidden="true" />;
              } else if (isChosen) {
                cls = "border-risk-danger-border bg-risk-danger-bg";
                mark = <X size={16} className="text-risk-danger" aria-hidden="true" />;
              } else {
                cls = "border-border opacity-70";
              }
            }
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => choose(optionIndex)}
                disabled={answeredCurrent}
                aria-pressed={isChosen}
                className={`flex w-full items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left text-sm text-fg transition-colors duration-(--motion-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default ${cls} ${
                  !answeredCurrent ? "cursor-pointer" : ""
                }`}
              >
                <span>{option}</span>
                {mark}
              </button>
            );
          })}
        </div>
      </fieldset>

      {answeredCurrent && (
        <div className="mt-5 rounded-sm border border-border bg-surface p-4">
          <p className="schematic-label text-fg-muted">EXPLANATION</p>
          <p className="mt-2 text-sm leading-relaxed text-fg">{question.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={next} disabled={!answeredCurrent}>
          {isLast ? "See results" : "Next question"}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
