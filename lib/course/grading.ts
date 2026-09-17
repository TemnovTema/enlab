import type { PracticeTest, PublicTest, TestResult } from "./types";
export function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}
export function publicTest(test: PracticeTest): PublicTest {
  const { transcript: _transcript, questions, ...rest } = test;
  return {
    ...rest,
    questions: questions.map(
      ({ answer: _a, explanation: _e, evidence: _v, ...q }) => q,
    ),
  };
}
export function grade(
  test: PracticeTest,
  answers: Record<string, string>,
  now = new Date(),
): TestResult {
  const items = test.questions.map((q) => {
    const submitted = answers[q.id] || "",
      normalized = normalizeAnswer(submitted),
      withinLimit =
        !q.maxWords ||
        normalized.split(/\s+/).filter(Boolean).length <= q.maxWords;
    return {
      id: q.id,
      prompt: q.prompt,
      submitted,
      accepted: q.answer,
      correct:
        withinLimit && q.answer.some((a) => normalizeAnswer(a) === normalized),
      explanation: q.explanation,
      evidence: q.evidence,
    };
  });
  return {
    testId: test.id,
    version: test.version,
    title: test.title,
    skill: test.skill,
    score: items.filter((i) => i.correct).length,
    total: items.length,
    completedAt: now.toISOString(),
    transcript: test.transcript,
    items,
  };
}
export function validateAnswers(
  test: PracticeTest,
  value: unknown,
): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Некорректные ответы.");
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).some((k) => !test.questions.some((q) => q.id === k)))
    throw Error("Неизвестный номер вопроса.");
  return Object.fromEntries(
    test.questions.map((q) => {
      const a = raw[q.id] ?? "";
      if (typeof a !== "string" || a.length > 200)
        throw Error("Ответ должен содержать не более 200 символов.");
      return [q.id, a];
    }),
  );
}
