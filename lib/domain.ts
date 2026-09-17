import { createEmptyCard, fsrs, type Card, type Grade } from "ts-fsrs";
export function cloze(phrase: string, example: string): string | null {
  const escaped = phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return null;
  const re = new RegExp(
    `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,
    "giu",
  );
  return re.test(example) ? example.replace(re, "［ … ］") : null;
}
export function schedule(
  previous: Card | null,
  rating: number,
  now = new Date(),
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 4)
    throw new Error("Invalid rating");
  const card = previous
    ? {
        ...previous,
        due: new Date(previous.due),
        last_review: previous.last_review
          ? new Date(previous.last_review)
          : undefined,
      }
    : createEmptyCard(now);
  return fsrs({ enable_fuzz: false }).next(card, now, rating as Grade).card;
}
export function dayKey(date: string | Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
export function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "\uFEFFphrase,meaning,example\r\n";
  const keys = Object.keys(rows[0]);
  const quote = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return (
    "\uFEFF" +
    [keys, ...rows.map((r) => keys.map((k) => r[k]))]
      .map((r) => r.map(quote).join(","))
      .join("\r\n")
  );
}
