import { test } from "node:test";
import assert from "node:assert/strict";
import { cloze, schedule, dayKey, csv } from "../lib/domain";
test("cloze respects word boundaries, case and special characters", () => {
  assert.equal(cloze("art", "The article is interesting."), null);
  assert.equal(
    cloze("make the most of", "Make the most of today."),
    "［ … ］ today.",
  );
  assert.equal(cloze("C++", "I use C++ daily."), "I use ［ … ］ daily.");
  assert.equal(cloze("", "Text"), null);
});
test("FSRS ratings produce distinct valid schedules; serialized state survives reload", () => {
  const now = new Date("2026-09-17T12:00:00Z");
  const again = schedule(null, 1, now),
    easy = schedule(null, 4, now);
  assert.ok(easy.due > again.due);
  assert.equal(again.reps, 1);
  const next = schedule(JSON.parse(JSON.stringify(easy)), 3, easy.due);
  assert.equal(next.reps, 2);
  assert.ok(next.due > easy.due);
  assert.ok(next.stability > 0);
  assert.throws(() => schedule(null, 5, now));
});
test("activity respects local midnight", () => {
  assert.equal(dayKey("2026-09-17T22:00:00Z", "Europe/Moscow"), "2026-09-18");
  assert.equal(
    dayKey("2026-09-17T22:00:00Z", "America/New_York"),
    "2026-09-17",
  );
});
test("CSV escapes quotes, multiline and spreadsheet formulas", () => {
  const data = csv([{ phrase: "=SUM(1)", meaning: 'a,"b"\nc' }]);
  assert.ok(data.includes("'=SUM(1)"));
  assert.ok(data.includes('"a,""b""\nc"'));
});

import { extractText } from '../lib/text';
test('TXT UTF-8 is split without losing text, invalid encoding is rejected',()=>{
 const text='Make the most of every day.\n'.repeat(450);
 const pages=extractText(new TextEncoder().encode(text).buffer);
 assert.ok(pages.length>1);assert.equal(pages.join(''),text);assert.ok(pages.every(p=>p.length<=3501));
 assert.throws(()=>extractText(new Uint8Array([0xff,0xfe]).buffer),/UTF-8/);
 assert.throws(()=>extractText(new Uint8Array([65,0,66]).buffer),/бинарный/);
 assert.deepEqual(extractText(new ArrayBuffer(0)),[]);
});
