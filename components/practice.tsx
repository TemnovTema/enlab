"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Headphones,
  Clock,
  Check,
  RotateCcw,
} from "lucide-react";
import { supabase as db } from "@/lib/supabase";
import type { PublicTest, TestResult } from "@/lib/course/types";
type Attempt = {
  id: string;
  test_id: string;
  result: TestResult;
  completed_at: string;
};
export default function Practice({
  userId,
  onLogin,
  onDirtyChange,
}: {
  userId: string | null;
  onLogin: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [tests, setTests] = useState<PublicTest[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [skill, setSkill] = useState<"reading" | "listening">("reading");
  const [active, setActive] = useState<PublicTest | null>(null),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [result, setResult] = useState<TestResult | null>(null),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false),
    [saveError, setSaveError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false),
    [confirmLeave, setConfirmLeave] = useState(false),
    [history, setHistory] = useState<Attempt[]>([]),
    [historyError, setHistoryError] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null),
    [seconds, setSeconds] = useState(0),
    [audioError, setAudioError] = useState(false),
    [audioKey, setAudioKey] = useState(0);
  const attemptId = useRef(""),
    locked = useRef(false),
    audio = useRef<HTMLAudioElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const identity = useRef(userId);
  identity.current = userId;
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/practice", { cache: "no-store" });
      if (!res.ok) throw Error("Не удалось загрузить тесты.");
      setTests(await res.json());
    } catch {
      setError("Не удалось загрузить тесты. Проверьте соединение и повторите.");
    } finally {
      setLoading(false);
    }
  }, []);
  const loadHistory = useCallback(async () => {
    if (!db || !userId) {
      setHistory([]);
      return;
    }
    const { data, error } = await db
      .from("practice_attempts")
      .select("id,test_id,result,completed_at")
      .order("completed_at", { ascending: false })
      .limit(20);
    if (identity.current !== userId) return;
    if (error)
      setHistoryError(
        "История недоступна. Проверьте соединение и применение миграции 002_practice.sql.",
      );
    else {
      setHistory(data || []);
      setHistoryError("");
    }
  }, [userId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    onDirtyChange(!!active && !saved);
    return () => onDirtyChange(false);
  }, [active, saved, onDirtyChange]);
  useEffect(() => {
    void loadHistory();
    const refresh = () => {
      if (document.visibilityState === "visible") void loadHistory();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadHistory]);
  useEffect(() => {
    setActive(null);
    setResult(null);
    setAnswers({});
    setHistory([]);
    setStartedAt(null);
  }, [userId]);
  useEffect(() => {
    if (!startedAt || result) return;
    const tick = () =>
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt, result]);
  useEffect(() => {
    if (!active || saved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active, saved]);
  useEffect(() => {
    heading.current?.focus();
  }, [active, result]);
  function begin(test: PublicTest) {
    setActive(test);
    setAnswers({});
    setResult(null);
    setSaved(false);
    setError("");
    setSaveError("");
    setConfirmSubmit(false);
    setConfirmLeave(false);
    setAudioError(false);
    setStartedAt(Date.now());
    setSeconds(0);
    attemptId.current = crypto.randomUUID();
  }
  function leave() {
    audio.current?.pause();
    setActive(null);
    setResult(null);
    setStartedAt(null);
    setConfirmLeave(false);
    setError("");
    setSaveError("");
  }
  async function submit() {
    if (!active || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setSaveError("");
    setConfirmSubmit(false);
    audio.current?.pause();
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (userId && db) {
        const { data, error } = await db.auth.getSession();
        if (error || !data.session)
          throw Error("Войдите в аккаунт повторно, затем сохраните результат.");
        headers.Authorization = `Bearer ${data.session.access_token}`;
      }
      const response = await fetch("/api/practice", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: attemptId.current,
          testId: active.id,
          version: active.version,
          answers,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw Error(body.error || "Не удалось проверить ответы.");
      if (identity.current !== userId) return;
      setResult(body.result);
      setSaved(body.saved);
      setSaveError(body.saveError || "");
      if (body.saved) await loadHistory();
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Нет соединения. Ответы остаются в этой вкладке; повторите проверку."
          : e instanceof Error
            ? e.message
            : "Не удалось проверить ответы. Повторите попытку.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  const completed =
    active?.questions.filter((q) => answers[q.id]?.trim()).length || 0;
  return (
    <section className="practice-section">
      <div className="page-title">
        <span className="eyebrow">ПОДГОТОВКА К ЭКЗАМЕНУ · B2</span>
        <h1 ref={heading} tabIndex={-1}>
          {result
            ? "Разбор попытки"
            : active
              ? active.title
              : "Практика, которая проясняет."}
        </h1>
        <p className="lede">
          {active
            ? active.subtitle
            : "Чтение и аудирование. Задания в формате IELTS, в вашем темпе."}
        </p>
      </div>
      {error && (
        <div className="alert" role="alert">
          {error}
          {!active && (
            <button onClick={() => void load()}>Повторить загрузку</button>
          )}
        </div>
      )}
      {!active && !result ? (
        <>
          <div className="course-tabs" aria-label="Раздел экзамена">
            <button
              className={skill === "reading" ? "selected" : ""}
              aria-pressed={skill === "reading"}
              onClick={() => setSkill("reading")}
            >
              <BookOpen size={18} />
              Чтение
            </button>
            <button
              className={skill === "listening" ? "selected" : ""}
              aria-pressed={skill === "listening"}
              onClick={() => setSkill("listening")}
            >
              <Headphones size={18} />
              Аудирование
            </button>
          </div>
          <div className="test-intro">
            <div>
              <span className="eyebrow">
                {skill === "reading" ? "READING" : "LISTENING"} / MINI PRACTICE
              </span>
              <h2>
                {skill === "reading"
                  ? "Читайте между строк. Но отвечайте по тексту."
                  : "Услышать главное. Не упустить детали."}
              </h2>
              <p>
                {skill === "reading"
                  ? "Выбор ответа, заголовки, True / False / Not Given и заполнение пропусков."
                  : "Объявление и мини-лекция: выбор ответа и заполнение заметок. Готовые аудиозаписи с британским синтезированным голосом."}
              </p>
            </div>
            <span className="test-count">
              02<small>мини-теста</small>
            </span>
          </div>
          {loading ? (
            <p role="status">Загружаем задания…</p>
          ) : (
            <div className="course-grid">
              {tests
                .filter((t) => t.skill === skill)
                .map((t, i) => (
                  <article className="test-card" key={t.id}>
                    <div className="card-top">
                      <span className="eyebrow">
                        {String(i + 1).padStart(2, "0")} / {t.topic}
                      </span>
                      {skill === "reading" ? (
                        <BookOpen size={20} />
                      ) : (
                        <Headphones size={20} />
                      )}
                    </div>
                    <h2 lang="en">{t.title}</h2>
                    <p>{t.subtitle}</p>
                    <div className="test-meta">
                      <span>
                        <Clock size={14} />
                        {t.minutes} мин
                      </span>
                      <span>{t.questions.length} вопросов</span>
                      <span>B2</span>
                    </div>
                    <button className="primary" onClick={() => begin(t)}>
                      Начать тест <ArrowRight size={17} />
                    </button>
                  </article>
                ))}
            </div>
          )}
          <p className="muted">
            Оригинальные учебные мини-тесты Fieldnotes. Это не официальные
            варианты IELTS и не полный пробный экзамен. Таймер ориентировочный:
            тест не закрывается автоматически.
          </p>
          {!userId && (
            <div className="guest-note">
              <p>
                Можно пройти тест без аккаунта. Результат останется только в
                открытой вкладке; история между устройствами появится после
                входа и подключения Supabase.
              </p>
              <button onClick={onLogin}>
                Войти для сохранения <ArrowRight size={16} />
              </button>
            </div>
          )}
          {userId && (
            <section className="attempt-history">
              <h2>Последние попытки</h2>
              {historyError ? (
                <div className="alert">
                  {historyError}
                  <button onClick={() => void loadHistory()}>
                    Обновить историю
                  </button>
                </div>
              ) : history.length === 0 ? (
                <p className="muted">Сохранённых попыток пока нет.</p>
              ) : (
                history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setResult(h.result);
                      setSaved(true);
                      setError("");
                      setSaveError("");
                    }}
                  >
                    <span>
                      {h.result.title}
                      <small>
                        {new Date(h.completed_at).toLocaleString("ru")}
                      </small>
                    </span>
                    <strong>
                      {h.result.score} / {h.result.total}
                    </strong>
                    <ArrowRight size={16} />
                  </button>
                ))
              )}
            </section>
          )}
        </>
      ) : result ? (
        <>
          <div className="result-summary">
            <div>
              <span className="eyebrow">ВЕРНЫХ ОТВЕТОВ</span>
              <strong>
                {result.score}
                <span> / {result.total}</span>
              </strong>
              <p>
                {result.score === result.total
                  ? "Все ответы верны. Попробуйте следующий текст."
                  : "Разберите несовпадения, затем попробуйте другой текст."}
              </p>
            </div>
            <div className="result-status">
              <p>
                {saved
                  ? "Результат сохранён в облаке."
                  : userId
                    ? "Результат ещё не сохранён в облаке."
                    : "Гостевая попытка: результат не сохранён в облаке."}
              </p>
              <small>
                Баллы этого мини-теста не переводятся в оценку IELTS.
              </small>
              {saveError && (
                <p role="alert" className="form-error">
                  {saveError}
                </p>
              )}
              {userId && !saved && active && (
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void submit()}
                >
                  {busy ? "Сохраняем…" : "Повторить сохранение"}
                </button>
              )}
            </div>
          </div>
          <div className="result-items">
            {result.items.map((item, i) => (
              <article
                key={item.id}
                className={item.correct ? "correct" : "incorrect"}
              >
                <div className="result-question">
                  <span>{item.correct ? <Check size={18} /> : i + 1}</span>
                  <h3 lang="en">{item.prompt}</h3>
                  <b>{item.correct ? "Верно" : "Ошибка"}</b>
                </div>
                <p>
                  Ваш ответ:{" "}
                  <strong lang="en">{item.submitted || "Нет ответа"}</strong>
                </p>
                {!item.correct && (
                  <p>
                    Принимается:{" "}
                    <strong lang="en">{item.accepted.join(" / ")}</strong>
                  </p>
                )}
                <p>{item.explanation}</p>
                <blockquote lang="en">“{item.evidence}”</blockquote>
              </article>
            ))}
          </div>
          {result.transcript && (
            <details className="transcript">
              <summary>Полный транскрипт записи</summary>
              <div lang="en">{result.transcript}</div>
            </details>
          )}
          {active?.audio && (
            <audio
              controls
              preload="metadata"
              src={active.audio}
              aria-label="Прослушать запись после проверки"
            />
          )}
          <div className="result-actions">
            <button onClick={leave}>
              <ArrowLeft size={16} />К тестам
            </button>
            {active && (
              <button
                className="primary"
                disabled={busy}
                onClick={() => {
                  if (
                    !userId ||
                    saved ||
                    confirm(
                      "Результат не сохранён в облаке. Начать новую попытку?",
                    )
                  )
                    begin(active);
                }}
              >
                <RotateCcw size={16} />
                Пройти ещё раз
              </button>
            )}
          </div>
        </>
      ) : (
        active && (
          <>
            <div className="test-toolbar">
              <button
                className="text-button"
                onClick={() => setConfirmLeave(true)}
              >
                <ArrowLeft size={16} />К тестам
              </button>
              <span>
                <Clock size={15} />
                {Math.floor(seconds / 60)}:
                {String(seconds % 60).padStart(2, "0")} / ~{active.minutes} мин
              </span>
              <span>
                {completed} / {active.questions.length} ответов
              </span>
            </div>
            {confirmLeave && (
              <div className="alert">
                Ответы незавершённого теста будут потеряны.
                <div className="inline-actions">
                  <button onClick={leave}>Выйти из теста</button>
                  <button onClick={() => setConfirmLeave(false)}>
                    Продолжить
                  </button>
                </div>
              </div>
            )}
            <p className="test-instructions">{active.instructions}</p>
            {seconds >= active.minutes * 60 && (
              <p className="notice">
                Ориентировочное время истекло. Вы можете спокойно закончить
                ответы.
              </p>
            )}
            {active.audio && (
              <div className="audio-panel">
                <div>
                  <Headphones size={22} />
                  <div>
                    <h3>Слушайте и заполняйте ответы</h3>
                    <p>
                      Учебная синтезированная озвучка · британский английский ·
                      повторы разрешены
                    </p>
                  </div>
                </div>
                <audio
                  ref={audio}
                  key={audioKey}
                  controls
                  preload="metadata"
                  src={active.audio}
                  onError={() => setAudioError(true)}
                  onCanPlay={() => setAudioError(false)}
                  aria-label="Аудиозапись задания"
                />
                {audioError && (
                  <div role="alert">
                    Не удалось загрузить аудио. Проверьте соединение.
                    <button onClick={() => setAudioKey((k) => k + 1)}>
                      Повторить загрузку аудио
                    </button>
                  </div>
                )}
                <label className="audio-speed">
                  Скорость{" "}
                  <select
                    defaultValue="1"
                    onChange={(e) => {
                      if (audio.current)
                        audio.current.playbackRate = Number(e.target.value);
                    }}
                  >
                    <option value="0.85">0,85×</option>
                    <option value="1">1×</option>
                    <option value="1.15">1,15×</option>
                  </select>
                </label>
              </div>
            )}
            {active.skill === "reading" && (
              <div className="mobile-jumps">
                <a href="#exam-text">К тексту ↑</a>
                <a href="#exam-questions">К вопросам ↓</a>
              </div>
            )}
            <div
              className={
                active.skill === "reading"
                  ? "exam-layout"
                  : "exam-layout listening"
              }
            >
              {active.passage.length > 0 && (
                <article className="exam-passage" id="exam-text">
                  <span className="eyebrow">READING PASSAGE</span>
                  <h2 lang="en">{active.title}</h2>
                  {active.passage.map((p, i) => (
                    <p lang="en" key={i}>
                      {p}
                    </p>
                  ))}
                </article>
              )}
              <div className="exam-questions" id="exam-questions">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (completed < active.questions.length)
                      setConfirmSubmit(true);
                    else void submit();
                  }}
                >
                  {active.questions.map((q, i) => (
                    <fieldset key={q.id} disabled={busy}>
                      <legend>
                        <span>{i + 1}</span>
                        <span lang="en">{q.prompt}</span>
                      </legend>
                      {q.type === "gap" ? (
                        <>
                          <label className="sr-only" htmlFor={q.id}>
                            Ответ на вопрос {i + 1}
                          </label>
                          <input
                            id={q.id}
                            autoComplete="off"
                            maxLength={200}
                            value={answers[q.id] || ""}
                            onChange={(e) =>
                              setAnswers({ ...answers, [q.id]: e.target.value })
                            }
                            placeholder="Ваш ответ на английском"
                          />
                          <small>
                            Не более {q.maxWords}{" "}
                            {q.maxWords === 1 ? "слова" : "слов"}
                            {active.skill === "listening"
                              ? " и/или число"
                              : " из текста"}
                          </small>
                        </>
                      ) : (
                        q.options?.map((option) => (
                          <label key={option} className="answer-option">
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={answers[q.id] === option}
                              onChange={() =>
                                setAnswers({ ...answers, [q.id]: option })
                              }
                            />
                            <span lang="en">{option}</span>
                          </label>
                        ))
                      )}
                    </fieldset>
                  ))}
                  {confirmSubmit && (
                    <div className="notice" role="status">
                      Без ответа: {active.questions.length - completed}. Они
                      будут засчитаны как ошибки.
                      <div className="inline-actions">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void submit()}
                        >
                          Завершить с пропусками
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmSubmit(false)}
                        >
                          Вернуться к ответам
                        </button>
                      </div>
                    </div>
                  )}
                  <button type="submit" className="primary" disabled={busy}>
                    {busy ? "Проверяем…" : "Проверить ответы"}
                    <Check size={17} />
                  </button>
                  <p className="muted">
                    Проверка завершит попытку и откроет объяснения.{" "}
                    {userId
                      ? "Результат будет отправлен в облако."
                      : "Без входа история не сохраняется."}
                  </p>
                </form>
              </div>
            </div>
          </>
        )
      )}
    </section>
  );
}
