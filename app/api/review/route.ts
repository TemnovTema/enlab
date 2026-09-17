import { createClient } from "@supabase/supabase-js";
import { schedule } from "@/lib/domain";
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    return Response.json({ error: "Supabase не подключён" }, { status: 503 });
  const authorization = req.headers.get("authorization") || "";
  const db = createClient(url, key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Войдите в аккаунт повторно" },
      { status: 401 },
    );
  try {
    const { id, cardId, version, rating } = await req.json();
    if (
      !/^[0-9a-f-]{36}$/i.test(id) ||
      !Number.isInteger(version) ||
      ![1, 2, 3, 4].includes(rating)
    )
      throw Error("Некорректный ответ");
    const { data: existing } = await db
      .from("reviews")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (existing) {
      if (existing.card_id !== cardId || existing.rating !== rating)
        throw Error("Конфликт запроса");
      return Response.json(existing);
    }
    const { data: card, error } = await db
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .single();
    if (error || !card) throw Error("Карточка недоступна");
    const { data, error: saveError } = await db.rpc("commit_review", {
      p_id: id,
      p_card: cardId,
      p_version: version,
      p_rating: rating,
      p_schedule: schedule(card.schedule, rating),
    });
    if (saveError)
      throw Error(
        saveError.message.includes("STALE_CARD")
          ? "Карточка уже изменена в другой сессии. Завершите занятие и начните новое."
          : saveError.message,
      );
    return Response.json(data);
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Не удалось сохранить ответ. Повторите попытку.",
      },
      { status: 409 },
    );
  }
}
