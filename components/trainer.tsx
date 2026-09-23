"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Library,
  Plus,
  Repeat2,
  ChartNoAxesColumn,
  Sun,
  LogOut,
  Upload,
  X,
  Check,
  Leaf,
  Download,
  Search,
  GraduationCap,
  ClipboardCheck,
  Milestone,
} from "lucide-react";
import { supabase as db } from "@/lib/supabase";
import { cloze, csv, dayKey } from "@/lib/domain";
import { MAX_SIZE, processMaterial } from "@/lib/materials";
import type {
  Material,
  Expression,
  StudyCard,
  Review,
  Fragment,
} from "@/lib/types";
import CourseLibrary from "./course-library";
import Practice from "./practice";
import type { VocabularyItem } from "@/lib/course/types";
import { Today, Timeline } from "./learning-space";
const tabs = [
  ["english", "Обзор", Sun],
  ["course", "Правила и лексика", GraduationCap],
  ["tests", "Тесты", ClipboardCheck],
  ["materials", "Материалы", Library],
  ["dictionary", "Мой словарь", BookOpen],
  ["review", "Повторение", Repeat2],
  ["progress", "Прогресс", ChartNoAxesColumn],
] as const;
const blank = {
  phrase: "",
  meaning: "",
  example: "",
  own_example: "",
  source: "",
  context: "",
  material_id: null as string | null,
};
function assert(error: { message: string } | null) {
  if (error) throw Error(error.message);
}
async function allRows(table: string) {
  const result = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db!
      .from(table)
      .select("*")
      .order("id")
      .range(offset, offset + 499);
    assert(error);
    result.push(...(data || []));
    if (!data || data.length < 500) return result;
  }
}
export default function Trainer() {
  const [practiceDirty, setPracticeDirty] = useState(false);
  const [user, setUser] = useState<User | null>(null),
    [authReady, setAuthReady] = useState(!db),
    [tab, setTab] = useState("today");
  const [materials, setMaterials] = useState<Material[]>([]),
    [expressions, setExpressions] = useState<Expression[]>([]),
    [cards, setCards] = useState<StudyCard[]>([]),
    [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [online, setOnline] = useState(true),
    [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false),
    [signup, setSignup] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [editor, setEditor] = useState(false),
    [draft, setDraft] = useState(blank),
    [editId, setEditId] = useState<string | null>(null),
    [query, setQuery] = useState("");
  const [reader, setReader] = useState<Material | null>(null),
    [fragments, setFragments] = useState<Fragment[]>([]),
    [position, setPosition] = useState(0),
    [selection, setSelection] = useState("");
  const [queue, setQueue] = useState<StudyCard[] | null>(null),
    [index, setIndex] = useState(0),
    [revealed, setRevealed] = useState(false),
    [saved, setSaved] = useState(0);
  const pending = useRef<{
      id: string;
      rating: number;
      cardId: string;
      version: number;
    } | null>(null),
    lock = useRef(false);
  const identity = useRef<string | null>(null);
  identity.current = user?.id || null;
  const readerId = useRef<string | null>(null);
  readerId.current = reader?.id || null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const refresh = useCallback(async () => {
    if (!db) return;
    const owner = identity.current;
    setLoading(true);
    try {
      const [m, e, c, r] = await Promise.all(
        ["materials", "expressions", "cards", "reviews"].map(allRows),
      );
      if (identity.current !== owner) return;
      const current = m.find((item) => item.id === readerId.current);
      if (current) setPosition(current.position);
      setMaterials(m.sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
      setExpressions(
        e.sort((a, b) => b.created_at.localeCompare(a.created_at)),
      );
      setCards(c);
      setReviews(r);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAuthReady(true);
    });
    const { data } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (user) void refresh();
    else {
      setMaterials([]);
      setExpressions([]);
      setCards([]);
      setReviews([]);
      setReader(null);
      setQueue(null);
      setEditor(false);
    }
  }, [user, refresh]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const focus = () => {
      update();
      if (user && document.visibilityState === "visible") void refresh();
    };
    update();
    window.addEventListener("online", focus);
    window.addEventListener("offline", update);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => {
      window.removeEventListener("online", focus);
      window.removeEventListener("offline", update);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
    };
  }, [user, refresh]);
  useEffect(() => {
    if (!editor && !authOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>("[role=dialog]");
    const items = () =>
      Array.from(
        modal?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input,textarea,[tabindex="0"]',
        ) || [],
      );
    items()[0]?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !lock.current) {
        setEditor(false);
        setAuthOpen(false);
      }
      if (event.key === "Tab") {
        const list = items(),
          first = list[0],
          last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [editor, authOpen]);
  function message(e: unknown) {
    return e instanceof Error
      ? e.message
      : "Не удалось сохранить. Проверьте соединение и повторите попытку.";
  }
  async function run(fn: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(message(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function requireAuth() {
    if (!db) {
      setError(
        "Подключите Supabase по инструкции в README приложения. Облачное хранилище ещё не настроено.",
      );
      return false;
    }
    if (!user) {
      setAuthOpen(true);
      return false;
    }
    return true;
  }
  function newExpression(
    phrase = "",
    context = "",
    material: Material | null = null,
  ) {
    if (!requireAuth()) return;
    setDraft({
      ...blank,
      phrase,
      example: context,
      context,
      material_id: material?.id || null,
      source: material?.title || "",
    });
    setEditId(null);
    setEditor(true);
  }
  function addCourseExpression(item: VocabularyItem, source: string) {
    if (!requireAuth()) return;
    setDraft({ ...blank, ...item, context: item.example, source });
    setEditId(null);
    setEditor(true);
  }
  const due = cards.filter((c) => new Date(c.due) <= new Date());
  async function start() {
    if (!requireAuth()) return;
    await run(async () => {
      const fresh = await allRows("cards");
      const list = fresh
        .filter((c) => new Date(c.due) <= new Date())
        .sort((a, b) => a.due.localeCompare(b.due))
        .slice(0, 20);
      setQueue(list);
      setIndex(0);
      setSaved(0);
      setRevealed(false);
      pending.current = null;
      setTab("review");
    });
  }
  async function openMaterial(m: Material) {
    await run(async () => {
      const { data, error } = await db!
        .from("fragments")
        .select("*")
        .eq("material_id", m.id)
        .order("page");
      assert(error);
      setFragments(data || []);
      setReader(m);
      setPosition(Math.min(m.position, Math.max(0, (data?.length || 1) - 1)));
      setSelection("");
      setTab("materials");
    });
  }
  async function move(next: number) {
    await run(async () => {
      const { error } = await db!
        .from("materials")
        .update({ position: next, updated_at: new Date().toISOString() })
        .eq("id", reader!.id);
      assert(error);
      setPosition(next);
      setSelection("");
      await refresh();
    });
  }
  async function upload(file: File) {
    if (!requireAuth()) return;
    await run(async () => {
      if (file.size > MAX_SIZE)
        throw Error("Максимальный размер файла: 10 МБ.");
      const kind = file.name.toLowerCase().endsWith(".pdf")
        ? "pdf"
        : file.name.toLowerCase().endsWith(".txt")
          ? "txt"
          : null;
      if (!kind) throw Error("Выберите PDF или TXT.");
      const id = crypto.randomUUID(),
        path = `${user!.id}/${id}.${kind}`;
      const { error: createError } = await db!
        .from("materials")
        .insert({ id, title: file.name, path, kind });
      assert(createError);
      const { error: uploadError } = await db!.storage
        .from("originals")
        .upload(path, file, {
          contentType: kind === "pdf" ? "application/pdf" : "text/plain",
        });
      if (uploadError) {
        await db!
          .from("materials")
          .update({
            status: "error",
            error: "Оригинал не загружен. Загрузите файл заново.",
          })
          .eq("id", id);
        await refresh();
        throw Error(uploadError.message);
      }
      await refresh();
      try {
        await processMaterial(id, setNotice);
      } finally {
        setNotice("");
        await refresh();
      }
    });
  }
  async function answer(rating: number) {
    await run(async () => {
      const card = queue![index];
      if (!pending.current)
        pending.current = {
          id: crypto.randomUUID(),
          cardId: card.id,
          version: card.version,
          rating,
        };
      const { data } = await db!.auth.getSession();
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session?.access_token}`,
        },
        body: JSON.stringify(pending.current),
      });
      const body = await res.json();
      if (!res.ok)
        throw Error(body.error || "Ответ не сохранён. Повторите попытку.");
      pending.current = null;
      setIndex((i) => i + 1);
      setSaved((s) => s + 1);
      setRevealed(false);
      await refresh();
    });
  }
  function download(name: string, text: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const activeCard = queue?.[index],
    activeExpression = expressions.find(
      (e) => e.id === activeCard?.expression_id,
    );
  const duplicate = expressions.some(
    (e) =>
      e.id !== editId &&
      e.phrase.toLowerCase().trim() === draft.phrase.toLowerCase().trim(),
  );
  const isEnglish = tab !== "today" && tab !== "timeline";
  function navigate(id: string) {
    if (id === tab) return;
    if (
      practiceDirty &&
      !confirm(
        "Ответы или результат текущего теста не сохранены в облаке. Покинуть раздел?",
      )
    )
      return;
    setTab(id);
    setReader(null);
    setNotice("");
    setError("");
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-icon">f.</span>fieldnotes
          <span className="brand-dot">●</span>
        </a>
        <div className="workspace-label">ЛИЧНОЕ ПРОСТРАНСТВО</div>
        <nav className="space-nav" aria-label="Личное пространство">
          {(
            [
              ["today", "Сегодня", Sun],
              ["timeline", "Timeline", Milestone],
              ["english", "Английский", BookOpen],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              className={
                (id === "english" ? isEnglish : tab === id)
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigate(id)}
              aria-current={
                (id === "english" ? isEnglish : tab === id) ? "page" : undefined
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        {isEnglish && (
          <nav className="english-nav" aria-label="Разделы английского">
            <div className="english-nav-label">АНГЛИЙСКИЙ · B2</div>
            {tabs.map(([id, label, Icon]) => (
              <button
                key={id}
                className={tab === id ? "nav-item active" : "nav-item"}
                onClick={() => navigate(id)}
                aria-current={tab === id ? "page" : undefined}
              >
                <Icon size={17} />
                <span>{label}</span>
                {id === "review" && due.length > 0 && <b>{due.length}</b>}
              </button>
            ))}
          </nav>
        )}
        <div className="sidebar-note">
          <Leaf size={23} />
          <p>
            Понемногу.
            <br />
            Каждый день.
            <br />
            <strong>В своём темпе.</strong>
          </p>
        </div>
        <button
          className="account"
          onClick={() =>
            user
              ? void run(async () => {
                  assert((await db!.auth.signOut()).error);
                })
              : setAuthOpen(true)
          }
        >
          <span className="avatar">
            {user?.email?.[0]?.toUpperCase() || "Г"}
          </span>
          <span>
            {user ? "Мой аккаунт" : "Гостевой просмотр"}
            <small>{user?.email || "Войдите для сохранения"}</small>
          </span>
          {user ? <LogOut size={17} /> : <ArrowUpRight size={17} />}
        </button>
      </aside>
      <div className="main-wrap">
        <header>
          <span>
            {isEnglish
              ? "АНГЛИЙСКИЙ В КОНТЕКСТЕ"
              : "ВАШЕ ПРОСТРАНСТВО ДЛЯ УЧЁБЫ"}
          </span>
          <div className="connection">
            <i className={user && online ? "connected" : ""} />
            {!online
              ? "Нет соединения"
              : user
                ? "Облачное сохранение"
                : db
                  ? "Вход не выполнен"
                  : "Гостевой режим"}
          </div>
          <button
            className="mobile-account"
            aria-label={user ? "Выйти из аккаунта" : "Войти в аккаунт"}
            onClick={() =>
              user
                ? void run(async () => {
                    assert((await db!.auth.signOut()).error);
                  })
                : setAuthOpen(true)
            }
          >
            {user ? <LogOut size={16} /> : <ArrowUpRight size={16} />}
          </button>
        </header>
        <main>
          {(!online || error) && (
            <div className="alert" role="alert">
              {!online
                ? "Нет интернета. Изменения пока не сохраняются. Подключитесь и повторите действие."
                : error}
              <button
                onClick={() => {
                  setError("");
                  if (user) void refresh();
                }}
              >
                Повторить обновление
              </button>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
          {!authReady || loading ? (
            <div className="sync" role="status">
              Обновление данных…
            </div>
          ) : null}
          {tab === "course" && (
            <CourseLibrary
              onAdd={addCourseExpression}
              onPractice={() => setTab("tests")}
            />
          )}
          {tab === "tests" && (
            <Practice
              userId={user?.id || null}
              onLogin={() => setAuthOpen(true)}
              onDirtyChange={setPracticeDirty}
            />
          )}
          {tab === "today" && (
            <Today
              onTimeline={() => navigate("timeline")}
              onEnglish={() => navigate("english")}
            />
          )}
          {tab === "timeline" && <Timeline />}
          {tab === "english" && (
            <>
              <div className="eyebrow">ВАША ЕЖЕДНЕВНАЯ ПРАКТИКА</div>
              <div className="heading-row">
                <div>
                  <h1>
                    Маленькие шаги.
                    <br />
                    <em>Живой английский.</em>
                  </h1>
                  <p className="lede">
                    Читайте то, что интересно. Запоминайте то, что пригодится.
                  </p>
                </div>
                <span className="edition">
                  READ. SAVE.
                  <br />
                  REMEMBER.<span>↙</span>
                </span>
              </div>
              <div className="today-grid">
                <section className="practice-card">
                  <div className="card-top">
                    <span className="pill">ПОВТОРЕНИЕ</span>
                    <Repeat2 size={23} />
                  </div>
                  <div className="big-number">
                    {user ? due.length : "—"}
                    <span>карточек на сегодня</span>
                  </div>
                  <h2>
                    {due.length
                      ? "Вернём слова в память"
                      : "Здесь начинается привычка"}
                  </h2>
                  <p>
                    {due.length
                      ? "Несколько минут, чтобы нужные выражения остались с вами."
                      : "Добавьте первое выражение, и мы подберём время для его повторения."}
                  </p>
                  <button
                    className="light-button"
                    onClick={() =>
                      due.length ? void start() : newExpression()
                    }
                  >
                    {due.length ? "Начать занятие" : "Добавить выражение"}
                    <ArrowRight size={18} />
                  </button>
                  <small>До 20 карточек за занятие · в вашем темпе</small>
                </section>
                <section className="reading-card">
                  <div className="card-top">
                    <span className="eyebrow">ПРОДОЛЖИТЬ ЧТЕНИЕ</span>
                    <BookOpen size={22} />
                  </div>
                  {materials.find((m) => m.status === "ready") ? (
                    <>
                      <div className="book-art">
                        <div className="book-cover">
                          YOUR
                          <br />
                          NEXT
                          <br />
                          <i>chapter.</i>
                        </div>
                      </div>
                      <h2>
                        {materials.find((m) => m.status === "ready")!.title}
                      </h2>
                      <button
                        className="text-button"
                        onClick={() =>
                          void openMaterial(
                            materials.find((m) => m.status === "ready")!,
                          )
                        }
                      >
                        Открыть материал <ArrowUpRight size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="book-art">
                        <div className="book-cover">
                          A LITTLE
                          <br />
                          EVERY
                          <br />
                          <i>day.</i>
                          <span>THE READING COLLECTION</span>
                        </div>
                        <div className="book-line" />
                      </div>
                      <h2>Ваш следующий хороший текст</h2>
                      <p>
                        Статья, рассказ или глава книги.
                        <br />
                        Начните с того, что вам любопытно.
                      </p>
                      <button
                        className="text-button"
                        onClick={() => setTab("materials")}
                      >
                        Добавить материал <ArrowUpRight size={18} />
                      </button>
                    </>
                  )}
                </section>
              </div>
              <section className="stats-strip">
                <div>
                  <span>В вашем словаре</span>
                  <strong>
                    {user ? expressions.length : "—"} <small>выражений</small>
                  </strong>
                </div>
                <div>
                  <span>Повторено сегодня</span>
                  <strong>
                    {user
                      ? reviews.filter(
                          (r) =>
                            dayKey(r.reviewed_at, timezone) ===
                            dayKey(new Date(), timezone),
                        ).length
                      : "—"}{" "}
                    <small>карточек</small>
                  </strong>
                </div>
                <div>
                  <span>Простая цель на день</span>
                  <strong className="text-stat">
                    Одно новое выражение <Leaf size={19} />
                  </strong>
                </div>
              </section>
              <section className="exam-entry">
                <div>
                  <span className="eyebrow">ДВА МЕСЯЦА ДО ЭКЗАМЕНА</span>
                  <h2>Теория становится практикой.</h2>
                  <p>
                    16 тем грамматики, 64 выражения и первые тесты Reading /
                    Listening.
                  </p>
                </div>
                <div>
                  <button onClick={() => setTab("course")}>
                    Правила и лексика
                  </button>
                  <button className="primary" onClick={() => setTab("tests")}>
                    Открыть тесты <ArrowRight size={17} />
                  </button>
                </div>
              </section>
              <section className="how">
                <div>
                  <span className="eyebrow">ОТ ТЕКСТА К ПАМЯТИ</span>
                  <h2>Слова лучше живут в контексте.</h2>
                </div>
                <div className="steps">
                  <p>
                    <b>01</b>
                    <span>
                      Прочитайте<small>Любой текст на английском</small>
                    </span>
                  </p>
                  <ArrowRight size={18} />
                  <p>
                    <b>02</b>
                    <span>
                      Сохраните<small>Выражение вместе с примером</small>
                    </span>
                  </p>
                  <ArrowRight size={18} />
                  <p>
                    <b>03</b>
                    <span>
                      Повторите<small>Когда придёт время</small>
                    </span>
                  </p>
                </div>
              </section>
            </>
          )}
          {tab === "materials" && !reader && (
            <>
              <PageTitle
                label="ВАША БИБЛИОТЕКА"
                title="Материалы"
                text="Хороший текст становится частью вашего английского."
              />
              <label className="upload">
                <Upload size={28} />
                <h2>Добавьте что-нибудь интересное</h2>
                <p>PDF с текстовым слоем или TXT в UTF-8</p>
                <span className="button">
                  Выбрать файл <Plus size={17} />
                </span>
                <small>До 10 МБ · PDF до 200 страниц · без OCR</small>
                <input
                  aria-label="Загрузить материал"
                  type="file"
                  accept=".pdf,.txt"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="muted">
                Обработка идёт, пока открыт сайт. Если вы закроете его, нажмите
                «Продолжить обработку» при возвращении.
              </p>
              <div className="list">
                {materials.map((m) => (
                  <article key={m.id}>
                    <div className="file-icon">
                      <BookOpen />
                    </div>
                    <div className="grow">
                      <h3>{m.title}</h3>
                      <p>
                        {m.status === "ready"
                          ? `${m.total_pages} фрагментов · готов к чтению`
                          : m.error ||
                            `Обработано ${m.processed_pages} из ${m.total_pages ?? "…"}`}
                      </p>
                    </div>
                    {m.status === "ready" ? (
                      <button
                        disabled={busy}
                        onClick={() => void openMaterial(m)}
                      >
                        Читать <ArrowUpRight size={16} />
                      </button>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            try {
                              await processMaterial(m.id, setNotice);
                            } finally {
                              setNotice("");
                              await refresh();
                            }
                          })
                        }
                      >
                        Продолжить обработку
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "materials" && reader && (
            <>
              <button className="text-button" onClick={() => setReader(null)}>
                ← К материалам
              </button>
              <PageTitle
                label={`ФРАГМЕНТ ${position + 1} ИЗ ${fragments.length}`}
                title={reader.title}
                text="Выделите выражение или введите его вручную по кнопке ниже."
              />
              <div
                className="reader"
                lang="en"
                onMouseUp={() =>
                  setSelection(
                    window.getSelection()?.toString().slice(0, 200) || "",
                  )
                }
                onTouchEnd={() =>
                  setSelection(
                    window.getSelection()?.toString().slice(0, 200) || "",
                  )
                }
              >
                {fragments[position]?.text ||
                  "На этой странице нет текстового слоя."}
              </div>
              <div className="reader-tools">
                <button
                  disabled={busy || position === 0}
                  onClick={() => void move(position - 1)}
                >
                  ← Назад
                </button>
                <button
                  className="primary"
                  onClick={() =>
                    newExpression(
                      selection,
                      fragments[position]?.text.slice(0, 4000) || "",
                      reader,
                    )
                  }
                >
                  <Plus size={18} />
                  {selection
                    ? `Сохранить «${selection.slice(0, 25)}»`
                    : "Добавить выражение"}
                </button>
                <button
                  disabled={busy || position >= fragments.length - 1}
                  onClick={() => void move(position + 1)}
                >
                  Далее →
                </button>
              </div>
              <button
                className="text-button"
                onClick={() =>
                  void run(async () => {
                    const { data, error } = await db!.storage
                      .from("originals")
                      .createSignedUrl(reader.path, 60);
                    assert(error);
                    if (data)
                      window.open(
                        data.signedUrl,
                        "_blank",
                        "noopener,noreferrer",
                      );
                  })
                }
              >
                Открыть оригинал <ArrowUpRight size={15} />
              </button>
            </>
          )}
          {tab === "dictionary" && (
            <>
              <div className="section-head">
                <PageTitle
                  label="СЛОВА СО СМЫСЛОМ"
                  title="Мой словарь"
                  text={`${expressions.length} выражений из вашего мира`}
                />
                <button className="primary" onClick={() => newExpression()}>
                  <Plus size={18} />
                  Добавить
                </button>
              </div>
              <label className="search">
                <Search size={20} />
                <input
                  placeholder="Найти выражение или перевод"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {expressions.length === 0 ? (
                <Empty
                  title="Всё начинается с одного выражения"
                  text="Запишите слово или фразу вместе со значением и примером."
                />
              ) : (
                <div className="dictionary">
                  {expressions
                    .filter((e) =>
                      (e.phrase + " " + e.meaning)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((e) => (
                      <article key={e.id}>
                        <div className="section-head">
                          <h2 lang="en">{e.phrase}</h2>
                          <button
                            className="text-button"
                            onClick={() => {
                              setEditId(e.id);
                              setDraft(e);
                              setEditor(true);
                            }}
                          >
                            Изменить
                          </button>
                        </div>
                        <p>{e.meaning}</p>
                        <blockquote lang="en">{e.example}</blockquote>
                        {e.own_example && (
                          <p lang="en">Ваш пример: {e.own_example}</p>
                        )}
                        {e.source &&
                          (e.material_id ? (
                            <button
                              className="source"
                              onClick={() => {
                                const m = materials.find(
                                  (m) => m.id === e.material_id,
                                );
                                if (m) void openMaterial(m);
                              }}
                            >
                              {e.source} ↗
                            </button>
                          ) : /^https?:\/\//i.test(e.source) ? (
                            <a
                              className="source"
                              href={e.source}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {e.source} ↗
                            </a>
                          ) : (
                            <span className="source">{e.source}</span>
                          ))}
                        {e.context && (
                          <details>
                            <summary>Исходный фрагмент</summary>
                            <p>{e.context}</p>
                          </details>
                        )}
                        <small className="muted">
                          Добавлено{" "}
                          {new Date(e.created_at).toLocaleDateString("ru")} ·
                          изменено{" "}
                          {new Date(e.updated_at).toLocaleDateString("ru")}
                        </small>
                      </article>
                    ))}
                </div>
              )}
            </>
          )}
          {tab === "review" && (
            <>
              <PageTitle
                label="ПРАКТИКА ВСПОМИНАНИЯ"
                title="Повторение"
                text="Сначала попробуйте вспомнить. Затем проверьте себя."
              />
              {queue === null ? (
                <section className="empty">
                  <Repeat2 size={30} />
                  <h2>{due.length} карточек ждут вас</h2>
                  <p>Конечное занятие: не больше 20 карточек.</p>
                  <button className="primary" onClick={() => void start()}>
                    Начать занятие <ArrowRight size={18} />
                  </button>
                </section>
              ) : !activeCard ? (
                <section className="empty">
                  <Check size={36} />
                  <h2>
                    {saved
                      ? "На сегодня стало чуть больше знакомого."
                      : "Пока всё повторено"}
                  </h2>
                  <p>
                    Сохранено ответов: {saved}. Расписание обновлено на сервере.
                  </p>
                  <button
                    onClick={() => {
                      setQueue(null);
                      setTab("english");
                    }}
                  >
                    На главную
                  </button>
                </section>
              ) : (
                <section className="review-card">
                  <div className="card-top">
                    <span className="eyebrow">
                      {activeCard.kind === "recall"
                        ? "ВОСПРОИЗВЕДЕНИЕ"
                        : "ПОНИМАНИЕ"}
                    </span>
                    <span>
                      {index + 1} / {queue.length}
                    </span>
                  </div>
                  {activeExpression ? (
                    <>
                      <h2 lang="en">
                        {activeCard.kind === "recall"
                          ? activeCard.prompt
                          : activeExpression.phrase}
                      </h2>
                      {activeCard.kind === "recognition" && (
                        <blockquote lang="en">
                          {activeExpression.example}
                        </blockquote>
                      )}
                      {revealed ? (
                        <>
                          <div className="answer">
                            <h3>
                              {activeCard.kind === "recall"
                                ? activeExpression.phrase
                                : activeExpression.meaning}
                            </h3>
                            <p>
                              {activeCard.kind === "recall"
                                ? activeExpression.meaning
                                : activeExpression.own_example}
                            </p>
                          </div>
                          {pending.current ? (
                            <button
                              className="primary"
                              disabled={busy}
                              onClick={() =>
                                void answer(pending.current!.rating)
                              }
                            >
                              Повторить сохранение ответа
                            </button>
                          ) : (
                            <div className="ratings">
                              {[
                                "Не вспомнил",
                                "Трудно",
                                "Вспомнил",
                                "Легко",
                              ].map((label, i) => (
                                <button
                                  disabled={busy}
                                  key={label}
                                  onClick={() => void answer(i + 1)}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          className="primary"
                          onClick={() => setRevealed(true)}
                        >
                          Показать ответ
                        </button>
                      )}
                    </>
                  ) : (
                    <p>Выражение удалено в другой сессии.</p>
                  )}
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => {
                      setQueue(null);
                      pending.current = null;
                    }}
                  >
                    Завершить занятие
                  </button>
                </section>
              )}
            </>
          )}
          {tab === "progress" && (
            <>
              <PageTitle
                label="ВАШ РИТМ"
                title="Прогресс"
                text="Реальные повторения и новые выражения. Без оценок владения языком."
              />
              <section className="stats-strip">
                <div>
                  <span>Всего ответов</span>
                  <strong>{reviews.length}</strong>
                </div>
                <div>
                  <span>Выражений в словаре</span>
                  <strong>{expressions.length}</strong>
                </div>
                <div>
                  <span>Пора повторить</span>
                  <strong>{due.length}</strong>
                </div>
              </section>
              <section className="progress-panel">
                <h2>Последние 14 дней</h2>
                <p className="muted">Часовой пояс: {timezone}</p>
                <div className="activity">
                  {Array.from({ length: 14 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - 13 + i);
                    const key = dayKey(d, timezone),
                      n = reviews.filter(
                        (r) => dayKey(r.reviewed_at, timezone) === key,
                      ).length;
                    return (
                      <div key={key} title={`${key}: ${n} ответов`}>
                        <span className={n ? "has-activity" : ""}>{n}</span>
                        <small>{d.getDate()}</small>
                      </div>
                    );
                  })}
                </div>
                <h3>Результаты воспоминания</h3>
                <div className="outcomes">
                  {["Не вспомнил", "Трудно", "Вспомнил", "Легко"].map(
                    (label, i) => (
                      <p key={label}>
                        {label}
                        <b>
                          {reviews.filter((r) => r.rating === i + 1).length}
                        </b>
                      </p>
                    ),
                  )}
                </div>
                <p className="muted">
                  Добавлено за последние 14 дней:{" "}
                  {
                    expressions.filter(
                      (e) =>
                        Date.now() - new Date(e.created_at).getTime() <
                        14 * 86400000,
                    ).length
                  }
                  . Просмотр ответа сам по себе не означает освоение выражения.
                </p>
              </section>
              <section className="export">
                <div>
                  <h2>Ваши данные всегда с вами</h2>
                  <p>Словарь в CSV или полный архив учебных данных в JSON.</p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (requireAuth())
                      void run(async () =>
                        download(
                          "fieldnotes.csv",
                          csv(await allRows("expressions")),
                          "text/csv;charset=utf-8",
                        ),
                      );
                  }}
                >
                  <Download size={17} />
                  CSV
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (requireAuth())
                      void run(async () => {
                        const tables = [
                          "materials",
                          "fragments",
                          "expressions",
                          "cards",
                          "reviews",
                          "practice_attempts",
                        ];
                        const values = await Promise.all(tables.map(allRows));
                        download(
                          "fieldnotes.json",
                          JSON.stringify(
                            {
                              version: 1,
                              exportedAt: new Date().toISOString(),
                              timezone,
                              ...Object.fromEntries(
                                tables.map((t, i) => [t, values[i]]),
                              ),
                            },
                            null,
                            2,
                          ),
                          "application/json",
                        );
                      });
                  }}
                >
                  <Download size={17} />
                  JSON
                </button>
              </section>
            </>
          )}
          <footer>
            <span>fieldnotes · Личное пространство для учёбы.</span>
            <span>Замечать. Понимать. Связывать.</span>
          </footer>
        </main>
      </div>
      {authOpen && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Вход"
          >
            <button
              className="close"
              aria-label="Закрыть"
              onClick={() => setAuthOpen(false)}
            >
              <X />
            </button>
            <span className="eyebrow">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</span>
            <h2>{signup ? "Создать аккаунт" : "Рады видеть вас"}</h2>
            {!db ? (
              <>
                <p>
                  Для входа и синхронизации нужно подключить Supabase.
                  Инструкция находится в README приложения.
                </p>
                <p>В гостевом просмотре учебные данные не сохраняются.</p>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const result = signup
                      ? await db!.auth.signUp({ email, password })
                      : await db!.auth.signInWithPassword({ email, password });
                    assert(result.error);
                    if (signup && !result.data.session)
                      setNotice("Подтвердите адрес по письму, затем войдите.");
                    setAuthOpen(false);
                  });
                }}
              >
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  Пароль
                  <input
                    type="password"
                    minLength={8}
                    autoComplete={signup ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
                <button className="primary" disabled={busy}>
                  {busy
                    ? "Подождите…"
                    : signup
                      ? "Зарегистрироваться"
                      : "Войти"}
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setSignup(!signup)}
                >
                  {signup ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
      {editor && (
        <div className="modal-backdrop">
          <section
            className="modal wide"
            role="dialog"
            aria-modal="true"
            aria-label="Выражение"
          >
            <button
              className="close"
              aria-label="Закрыть"
              disabled={busy}
              onClick={() => setEditor(false)}
            >
              <X />
            </button>
            <span className="eyebrow">ДОБАВЬТЕ В СВОЙ АНГЛИЙСКИЙ</span>
            <h2>{editId ? "Изменить выражение" : "Новое выражение"}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const { error } = await db!.rpc("save_expression", {
                    p_id: editId,
                    p_phrase: draft.phrase.trim(),
                    p_meaning: draft.meaning.trim(),
                    p_example: draft.example.trim(),
                    p_own: draft.own_example,
                    p_material: draft.material_id,
                    p_source: draft.source,
                    p_context: draft.context,
                    p_cloze: cloze(draft.phrase, draft.example),
                  });
                  assert(error);
                  setEditor(false);
                  setNotice(
                    "Выражение сохранено. Карточки готовы к повторению.",
                  );
                  await refresh();
                });
              }}
            >
              <label>
                Слово или выражение
                <input
                  required
                  maxLength={200}
                  lang="en"
                  value={draft.phrase}
                  onChange={(e) =>
                    setDraft({ ...draft, phrase: e.target.value })
                  }
                  placeholder="to make the most of"
                />
              </label>
              {duplicate && (
                <p className="notice">
                  Такое выражение уже есть. Можно сохранить ещё одно значение.
                </p>
              )}
              <label>
                Значение на русском
                <textarea
                  required
                  maxLength={2000}
                  value={draft.meaning}
                  onChange={(e) =>
                    setDraft({ ...draft, meaning: e.target.value })
                  }
                />
              </label>
              <label>
                Предложение-пример на английском
                <textarea
                  required
                  maxLength={4000}
                  lang="en"
                  value={draft.example}
                  onChange={(e) =>
                    setDraft({ ...draft, example: e.target.value })
                  }
                />
              </label>
              <p className="muted">
                {cloze(draft.phrase, draft.example)
                  ? "Будут созданы карточки на понимание и воспроизведение."
                  : "Карточка на воспроизведение появится, если выражение встречается в примере целиком."}
              </p>
              <label>
                Источник <span className="muted">· название или ссылка</span>
                <input
                  maxLength={1000}
                  value={draft.source}
                  onChange={(e) =>
                    setDraft({ ...draft, source: e.target.value })
                  }
                />
              </label>
              <label>
                Свой пример <span className="muted">· необязательно</span>
                <textarea
                  maxLength={4000}
                  value={draft.own_example}
                  onChange={(e) =>
                    setDraft({ ...draft, own_example: e.target.value })
                  }
                />
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <div className="section-head">
                <button className="primary" disabled={busy}>
                  {busy ? "Сохранение…" : "Сохранить выражение"}
                  <Check size={18} />
                </button>
                {editId && (
                  <button
                    type="button"
                    className="danger"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "Удалить выражение и его карточки? История ответов останется.",
                        )
                      )
                        void run(async () => {
                          assert(
                            (
                              await db!
                                .from("expressions")
                                .delete()
                                .eq("id", editId)
                            ).error,
                          );
                          setEditor(false);
                          await refresh();
                        });
                    }}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
function PageTitle({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p className="lede">{text}</p>
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
