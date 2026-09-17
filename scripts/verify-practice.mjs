import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000");
  await page
    .getByRole("button", { name: "Правила и лексика", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Условные предложения: 0, 1, 2, 3/ })
    .click();
  await page
    .getByRole("radio", { name: "would not have missed", exact: true })
    .check();
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await page.getByText("Верно", { exact: true }).waitFor();
  await page.getByRole("button", { name: "К списку тем", exact: true }).click();
  await page.getByRole("button", { name: /Лексика 8 тем/ }).click();
  await page
    .getByRole("textbox", { name: "Поиск по учебным темам" })
    .fill("deadline");
  await page.getByRole("button", { name: /Образование и университет/ }).click();
  await page
    .getByRole("heading", { name: "meet a deadline", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "В словарь: meet a deadline", exact: true })
    .click();
  await page
    .getByText("Подключите Supabase по инструкции", { exact: false })
    .waitFor();
  await page.getByRole("button", { name: "Тесты", exact: true }).click();
  await page
    .getByRole("button", { name: "Начать тест", exact: true })
    .first()
    .click();
  const responses = [
    "False",
    "Not Given",
    "True",
    "It would have been too expensive to maintain.",
  ];
  for (let i = 0; i < 4; i++)
    await page
      .locator(".exam-questions fieldset")
      .nth(i)
      .getByRole("radio", { name: responses[i], exact: true })
      .check();
  await page.locator("#r5").fill("roof");
  await page.locator("#r6").fill("sunset");
  await page
    .locator(".exam-questions fieldset")
    .nth(6)
    .getByRole("radio", {
      name: "Responding to access and safety issues",
      exact: true,
    })
    .check();
  await page
    .locator(".exam-questions fieldset")
    .nth(7)
    .getByRole("radio", {
      name: "Small trials can expose practical difficulties.",
      exact: true,
    })
    .check();
  await page
    .getByRole("button", { name: "Проверить ответы", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Разбор попытки", exact: true })
    .waitFor();
  assert.equal(await page.locator(".result-items .correct").count(), 8);
  await page
    .getByText("Гостевая попытка: результат не сохранён в облаке.", {
      exact: true,
    })
    .waitFor();
  mkdirSync("test-results", { recursive: true });
  await page.screenshot({
    path: "test-results/practice-result.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "К тестам", exact: true }).click();
  await page.getByRole("button", { name: "Аудирование", exact: true }).click();
  await page
    .getByRole("button", { name: "Начать тест", exact: true })
    .first()
    .click();
  assert.equal(
    await page.getByText("Полный транскрипт записи", { exact: true }).count(),
    0,
  );
  await page.locator("audio").evaluate(async (audio) => {
    if (audio.readyState < 1)
      await new Promise((resolve, reject) => {
        audio.addEventListener("loadedmetadata", resolve, { once: true });
        audio.addEventListener("error", reject, { once: true });
      });
    if (audio.duration < 60) throw Error("Audio unexpectedly short");
    await audio.play();
  });
  await page.waitForFunction(
    () => document.querySelector("audio").currentTime > 0.2,
  );
  await page.locator("audio").evaluate((a) => a.pause());
  await page.locator("#l1").fill("8:30");
  await page.context().setOffline(true);
  await page
    .getByRole("button", { name: "Проверить ответы", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Завершить с пропусками", exact: true })
    .click();
  await page
    .locator(".practice-section .alert")
    .filter({ hasText: /fetch|соединени/i })
    .waitFor();
  assert.equal(await page.locator("#l1").inputValue(), "8:30");
  assert.equal(await page.locator(".result-summary").count(), 0);
  await page.context().setOffline(false);
  await page
    .getByRole("button", { name: "Проверить ответы", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Завершить с пропусками", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Разбор попытки", exact: true })
    .waitFor();
  await page.getByText("Полный транскрипт записи", { exact: true }).click();
  await page
    .getByText(/Good morning, and welcome to the university learning centre/)
    .waitFor();
  assert.equal(await page.locator(".result-items .correct").count(), 1);
  const publicTests = await page.evaluate(
    async () => await (await fetch("/api/practice")).json(),
  );
  for (const t of publicTests) {
    assert.ok(!t.transcript);
    for (const q of t.questions)
      assert.ok(!q.answer && !q.explanation && !q.evidence);
  }
  for (const test of publicTests.filter((t) => t.audio))
    await page.evaluate(async (url) => {
      const bytes = await (await fetch(url)).arrayBuffer();
      const ctx = new AudioContext();
      const data = await ctx.decodeAudioData(bytes);
      if (data.duration < 60) throw Error("Invalid recording");
      await ctx.close();
    }, test.audio);
  for (const width of [390, 320]) {
    const mobile = await browser.newPage({ viewport: { width, height: 844 } });
    mobile.on("pageerror", (e) => errors.push(e.message));
    await mobile.goto("http://localhost:3000");
    await mobile.getByRole("button", { name: "Тесты", exact: true }).click();
    await mobile
      .getByRole("button", { name: "Начать тест", exact: true })
      .first()
      .click();
    assert.equal(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await mobile.screenshot({
      path: `test-results/practice-mobile-${width}.png`,
      fullPage: true,
    });
    // Navigation must warn before discarding answers.
    mobile.once("dialog", (d) => d.accept());
    await mobile
      .getByRole("button", { name: "Правила и лексика", exact: true })
      .click();
    await mobile
      .getByRole("heading", { name: "Разобраться. И применить.", exact: true })
      .waitFor();
    assert.equal(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await mobile.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: grammar, vocabulary, reading 8/8, listening, real audio playback/decode, hidden answer keys, failed submit retry, 390/320px layout, navigation guard.",
  );
} finally {
  await browser.close();
}
