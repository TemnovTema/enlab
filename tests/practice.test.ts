import { test } from "node:test";
import assert from "node:assert/strict";
import { practiceTests } from "../lib/course/tests";
import {
  grade,
  normalizeAnswer,
  publicTest,
  validateAnswers,
} from "../lib/course/grading";
import { grammar } from "../lib/course/grammar";
import { vocabulary } from "../lib/course/vocabulary";
import { existsSync, statSync } from "node:fs";
test("question bank: unique IDs, matching answer choices, evidence and complete explanations", () => {
  assert.equal(new Set(practiceTests.map((t) => t.id)).size, 4);
  for (const t of practiceTests) {
    assert.equal(
      new Set(t.questions.map((q) => q.id)).size,
      t.questions.length,
    );
    assert.equal(t.questions.length, 8);
    for (const q of t.questions) {
      assert.ok(q.answer.length);
      assert.ok(q.explanation.length > 20);
      assert.ok(
        (t.transcript || t.passage.join(" ")).includes(q.evidence) ||
          q.evidence.includes(" ... "),
      );
      if (q.options) for (const a of q.answer) assert.ok(q.options.includes(a));
      if (q.maxWords)
        for (const a of q.answer)
          assert.ok(normalizeAnswer(a).split(" ").length <= q.maxWords);
    }
    const perfect = Object.fromEntries(
      t.questions.map((q) => [q.id, q.answer[0]]),
    );
    assert.equal(grade(t, perfect).score, t.questions.length);
    assert.equal(grade(t, {}).score, 0);
  }
});
test("grading normalises harmless variants but rejects excess words and unknown fields", () => {
  const test = practiceTests.find((t) => t.id === "listening-library")!;
  assert.equal(
    grade(test, { l3: "  TWO   HOURS.  " }).items.find((i) => i.id === "l3")
      ?.correct,
    true,
  );
  assert.equal(
    grade(test, { l3: "for two hours" }).items.find((i) => i.id === "l3")
      ?.correct,
    false,
  );
  assert.equal(
    grade(test, { l7: "16" }).items.find((i) => i.id === "l7")?.correct,
    true,
  );
  assert.throws(() => validateAnswers(test, { injected: "True" }));
  assert.throws(() => validateAnswers(test, { l1: ["8:30"] }));
  assert.throws(() => validateAnswers(test, { l1: "x".repeat(201) }));
});
test("public tests do not expose answers, explanations, evidence or transcripts", () => {
  for (const t of practiceTests) {
    const p = publicTest(t);
    assert.ok(!("transcript" in p));
    for (const q of p.questions) {
      assert.ok(!("answer" in q));
      assert.ok(!("explanation" in q));
      assert.ok(!("evidence" in q));
    }
  }
});
test("all grammar checks have valid answers; vocabulary examples contain the target phrase", () => {
  assert.equal(grammar.length, 16);
  assert.equal(vocabulary.flatMap((v) => v.items).length, 64);
  for (const g of grammar) {
    assert.ok(g.check.options.includes(g.check.answer));
    assert.ok(g.rules.length >= 3);
  }
  for (const v of vocabulary)
    for (const i of v.items)
      assert.ok(
        i.example.toLowerCase().includes(i.phrase.toLowerCase()),
        i.phrase,
      );
});
test("both listening tests have packaged audio files", () => {
  for (const t of practiceTests.filter((t) => t.skill === "listening")) {
    assert.ok(t.transcript);
    assert.ok(existsSync("public" + t.audio));
    assert.ok(statSync("public" + t.audio).size > 50000);
  }
});
