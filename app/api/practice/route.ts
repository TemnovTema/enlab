import { createClient } from "@supabase/supabase-js";
import { practiceTests } from "@/lib/course/tests";
import { grade, publicTest, validateAnswers } from "@/lib/course/grading";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function GET() {
  return json(practiceTests.map(publicTest));
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.id,
      )
    )
      return json({ error: "Некорректный идентификатор попытки." }, 400);
    const test = practiceTests.find((t) => t.id === body.testId);
    if (!test || test.version !== body.version)
      return json({ error: "Этот тест обновился. Откройте его заново." }, 409);
    const answers = validateAnswers(test, body.answers),
      result = grade(test, answers);
    const authorization = req.headers.get("authorization");
    if (!authorization) return json({ result, saved: false, guest: true });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key)
      return json({
        result,
        saved: false,
        saveError: "Облачное сохранение не настроено.",
      });
    const db = createClient(url, key, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser();
    if (authError || !user)
      return json(
        {
          error:
            "Сессия закончилась. Войдите в аккаунт и повторите сохранение.",
        },
        401,
      );
    const { error } = await db
      .from("practice_attempts")
      .upsert(
        {
          id: body.id,
          test_id: test.id,
          test_version: test.version,
          answers,
          result,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error)
      return json({
        result,
        saved: false,
        saveError:
          error.code === "42P01" || error.code === "PGRST205"
            ? "Для истории тестов примените миграцию 002_practice.sql в Supabase."
            : "Не удалось сохранить результат в облаке. Повторите сохранение.",
      });
    const { data: stored, error: readError } = await db
      .from("practice_attempts")
      .select("answers,result,test_id,test_version")
      .eq("id", body.id)
      .single();
    if (readError)
      return json({
        result,
        saved: false,
        saveError: "Не удалось подтвердить сохранение. Повторите запрос.",
      });
    if (
      stored.test_id !== test.id ||
      stored.test_version !== test.version ||
      JSON.stringify(validateAnswers(test, stored.answers)) !==
        JSON.stringify(answers)
    )
      return json(
        {
          error:
            "Эта попытка уже содержит другие ответы. Начните новую попытку.",
        },
        409,
      );
    return json({ result: stored.result, saved: true });
  } catch (e) {
    return json(
      {
        error: e instanceof Error ? e.message : "Не удалось проверить ответы.",
      },
      400,
    );
  }
}
