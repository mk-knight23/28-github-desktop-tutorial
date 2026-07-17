import { describe, expect, test } from "vitest";
import { QUIZZES, getQuiz, scoreQuiz } from "./quizzes";

describe("quiz data", () => {
  test("ships at least 5 quizzes (PRODUCT_SPEC §3.3)", () => {
    expect(QUIZZES.length).toBeGreaterThanOrEqual(5);
  });

  test("every quiz has at least 8 questions", () => {
    for (const quiz of QUIZZES) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(8);
    }
  });

  test("every question has a valid correctIndex within its options", () => {
    for (const quiz of QUIZZES) {
      for (const q of quiz.questions) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(0);
      }
    }
  });

  test("question ids are unique within a quiz", () => {
    for (const quiz of QUIZZES) {
      const ids = quiz.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("scoreQuiz", () => {
  test("scores only correct answers", () => {
    const quiz = getQuiz("basics")!;
    const answers: Record<string, number> = {};
    quiz.questions.forEach((q, i) => {
      answers[q.id] = i < 3 ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
    });
    expect(scoreQuiz(quiz, answers)).toBe(3);
  });

  test("a perfect answer set scores the full total", () => {
    const quiz = getQuiz("branching")!;
    const answers = Object.fromEntries(quiz.questions.map((q) => [q.id, q.correctIndex]));
    expect(scoreQuiz(quiz, answers)).toBe(quiz.questions.length);
  });

  test("no answers scores zero", () => {
    const quiz = getQuiz("collaboration")!;
    expect(scoreQuiz(quiz, {})).toBe(0);
  });
});
