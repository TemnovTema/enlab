import { extractText } from "./text";
import { supabase } from "./supabase";
export const MAX_SIZE = 10 * 1024 * 1024;
export const MAX_PAGES = 200;
function check(error: { message: string } | null) {
  if (error) throw Error(error.message);
}
export async function processMaterial(
  id: string,
  onProgress: (s: string) => void,
) {
  const db = supabase!;
  const { data: m, error } = await db
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();
  check(error);
  if (!m) throw Error("Материал недоступен");
  const update = async (values: object) => {
    const { error } = await db
      .from("materials")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id);
    check(error);
  };
  try {
    await update({ status: "processing", error: null });
    const { data: file, error: downloadError } = await db.storage
      .from("originals")
      .download(m.path);
    check(downloadError);
    if (!file) throw Error("Оригинал не найден. Загрузите файл заново.");
    let pages: string[] = [];
    const save = async (page: number, text: string) => {
      const { error } = await db
        .from("fragments")
        .upsert(
          { material_id: id, page, text },
          { onConflict: "material_id,page" },
        );
      check(error);
      await update({ processed_pages: page });
      onProgress(`Обработано фрагментов: ${page}`);
    };
    if (m.kind === "pdf") {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const task = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
      });
      const pdf = await task.promise;
      try {
        if (pdf.numPages > MAX_PAGES)
          throw Error("Лимит PDF: 200 страниц. Разделите документ.");
        await update({ total_pages: pdf.numPages });
        for (let i = m.processed_pages + 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i),
            content = await page.getTextContent();
          const text = content.items
            .map((item) =>
              "str" in item
                ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
                : "",
            )
            .join("")
            .trim();
          await save(i, text);
          page.cleanup();
        }
      } finally {
        await task.destroy();
      }
    } else {
      pages = extractText(await file.arrayBuffer());
      await update({ total_pages: pages.length });
      for (let i = m.processed_pages; i < pages.length; i++)
        await save(i + 1, pages[i]);
    }
    const { data: fragments, error: readError } = await db
      .from("fragments")
      .select("text")
      .eq("material_id", id);
    check(readError);
    if (!fragments?.some((f) => f.text.trim().length > 10))
      throw Error(
        m.kind === "pdf"
          ? "Текстовый слой не найден. PDF-сканы и OCR пока не поддерживаются."
          : "В файле нет текста для чтения.",
      );
    await update({ status: "ready", error: null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка обработки";
    await update({ status: "error", error: message }).catch(() => {});
    throw Error(message);
  }
}
