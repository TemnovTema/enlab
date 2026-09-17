export function extractText(data: ArrayBuffer): string[] {
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(data); }
  catch { throw Error('Не удалось прочитать TXT. Сохраните файл в кодировке UTF-8.'); }
  if (text.includes('\0')) throw Error('Ожидается текстовый файл UTF-8, а не бинарный файл.');
  const pages = text.match(/[\s\S]{1,3500}(?:\s|$)|[\s\S]{1,3500}/g) || [];
  if (pages.length > 600) throw Error('Слишком длинный текст: максимум около 2 млн символов.');
  return pages;
}
