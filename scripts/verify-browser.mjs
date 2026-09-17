import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:3000");
    await page.getByRole("heading", { name: /Маленькие шаги/ }).waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    mkdirSync("test-results", { recursive: true });
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Мой словарь", exact: true })
      .click();
    await page.getByRole("button", { name: "Добавить", exact: true }).click();
    await page
      .getByText("Подключите Supabase по инструкции", { exact: false })
      .waitFor();
    await page.getByRole("button", { name: "Материалы", exact: true }).click();
    await page.getByText("Добавьте что-нибудь интересное").waitFor();
    await page.getByRole("button", { name: "Прогресс", exact: true }).click();
    await page
      .getByRole("heading", { name: "Последние 14 дней", exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.context().setOffline(true);
    await page.getByText(/Нет интернета. Изменения/).waitFor();
    await page.context().setOffline(false);
    await page.close();
  }
  // Actual PDF.js worker in Chromium, without a mocked extractor.
  function pdf(text) {
    const stream = text ? `BT /F1 12 Tf 40 200 Td (${text}) Tj ET` : "";
    const objs = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    ];
    let s = "%PDF-1.4\n",
      offsets = [0];
    objs.forEach((o, i) => {
      offsets.push(s.length);
      s += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const start = s.length;
    s +=
      "xref\n0 6\n0000000000 65535 f \n" +
      offsets
        .slice(1)
        .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
        .join("");
    s += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
    return s;
  }

  const page = await browser.newPage();
  await page.route("**/pdf-test.mjs", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: readFileSync("node_modules/pdfjs-dist/build/pdf.mjs"),
    }),
  );
  await page.route("**/text-test.pdf", (route) =>
    route.fulfill({
      contentType: "application/pdf",
      body: pdf("Make the most of every day."),
    }),
  );
  await page.route("**/scan-test.pdf", (route) =>
    route.fulfill({ contentType: "application/pdf", body: pdf("") }),
  );
  await page.goto("http://localhost:3000");
  const texts = await page.evaluate(async () => {
    const pdfjs = await import("/pdf-test.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const out = [];
    for (const name of ["text", "scan"]) {
      const task = pdfjs.getDocument({ url: `/${name}-test.pdf` }),
        doc = await task.promise;
      const content = await (await doc.getPage(1)).getTextContent();
      out.push(content.items.map((i) => i.str || "").join(""));
      await task.destroy();
    }
    return out;
  });
  assert.match(texts[0], /Make the most/);
  assert.equal(texts[1], "");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop/mobile, navigation, unconfigured state, offline indicator, PDF text extraction and empty scan detection.",
  );
} finally {
  await browser.close();
}
