"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";
import { grammar } from "@/lib/course/grammar";
import { vocabulary, roadmap } from "@/lib/course/vocabulary";
import type { VocabularyItem } from "@/lib/course/types";
export default function CourseLibrary({
  onAdd,
  onPractice,
}: {
  onAdd: (item: VocabularyItem, source: string) => void;
  onPractice: () => void;
}) {
  const [section, setSection] = useState<"grammar" | "vocabulary">("grammar"),
    [selected, setSelected] = useState<string | null>(null),
    [search, setSearch] = useState("");
  const [choices, setChoices] = useState<Record<string, string>>({}),
    [checked, setChecked] = useState<Record<string, boolean>>({});
  const lesson = grammar.find((g) => g.id === selected),
    block = vocabulary.find((v) => v.id === selected);
  function switchSection(next: "grammar" | "vocabulary") {
    setSection(next);
    setSelected(null);
    setSearch("");
  }
  const query = search.trim().toLocaleLowerCase();
  return (
    <div className="course">
      <div className="page-title">
        <span className="eyebrow">БАЗА ДЛЯ ЭКЗАМЕНА · B2</span>
        <h1>Разобраться. И применить.</h1>
        <p className="lede">
          Грамматика и выражения, к которым удобно возвращаться.
        </p>
      </div>
      <div className="course-tabs" aria-label="Содержание справочника">
        <button
          aria-pressed={section === "grammar"}
          className={section === "grammar" ? "selected" : ""}
          onClick={() => switchSection("grammar")}
        >
          Правила <span>{grammar.length}</span>
        </button>
        <button
          aria-pressed={section === "vocabulary"}
          className={section === "vocabulary" ? "selected" : ""}
          onClick={() => switchSection("vocabulary")}
        >
          Лексика <span>{vocabulary.length} тем</span>
        </button>
      </div>
      {selected ? (
        <>
          <button className="text-button" onClick={() => setSelected(null)}>
            <ArrowLeft size={16} />К списку тем
          </button>
          {lesson && section === "grammar" && (
            <article className="lesson">
              <span className="eyebrow">ГРАММАТИКА В КОНТЕКСТЕ</span>
              <h2>{lesson.title}</h2>
              <p className="lede">{lesson.summary}</p>
              {lesson.rules.map((rule, i) => (
                <section className="rule" key={rule.label}>
                  <span className="rule-number">0{i + 1}</span>
                  <div>
                    <h3>{rule.label}</h3>
                    <code>{rule.form}</code>
                    <p>{rule.explanation}</p>
                    <blockquote lang="en">{rule.example}</blockquote>
                  </div>
                </section>
              ))}
              <aside className="mistake">
                <strong>Частая ошибка</strong>
                <p>{lesson.mistake}</p>
              </aside>
              <section className="quick-check">
                <span className="eyebrow">ПРОВЕРЬТЕ СЕБЯ</span>
                <h3 lang="en">{lesson.check.question}</h3>
                <fieldset disabled={!!checked[lesson.id]}>
                  <legend className="sr-only">Выберите ответ</legend>
                  {lesson.check.options.map((option) => (
                    <label className="answer-option" key={option}>
                      <input
                        type="radio"
                        name={lesson.id}
                        checked={choices[lesson.id] === option}
                        onChange={() =>
                          setChoices({ ...choices, [lesson.id]: option })
                        }
                      />
                      <span lang="en">{option}</span>
                    </label>
                  ))}
                </fieldset>
                {checked[lesson.id] ? (
                  <div role="status" className="check-feedback">
                    <strong>
                      {choices[lesson.id] === lesson.check.answer
                        ? "Верно"
                        : "Правильный ответ: " + lesson.check.answer}
                    </strong>
                    <p>{lesson.check.explanation}</p>
                    <button
                      onClick={() => {
                        setChecked({ ...checked, [lesson.id]: false });
                        setChoices({ ...choices, [lesson.id]: "" });
                      }}
                    >
                      Ещё раз
                    </button>
                  </div>
                ) : (
                  <button
                    className="primary"
                    disabled={!choices[lesson.id]}
                    onClick={() =>
                      setChecked({ ...checked, [lesson.id]: true })
                    }
                  >
                    Проверить <Check size={16} />
                  </button>
                )}
              </section>
              <button className="text-button" onClick={onPractice}>
                Перейти к Reading и Listening <ArrowRight size={16} />
              </button>
            </article>
          )}
          {block && section === "vocabulary" && (
            <article className="lesson">
              <span className="eyebrow">8 ВЫРАЖЕНИЙ В КОНТЕКСТЕ</span>
              <h2>{block.title}</h2>
              <p className="lede">{block.description}</p>
              <p className="muted">
                Добавьте нужное выражение в личный словарь, чтобы повторять его
                по расписанию.
              </p>
              <div className="vocab-list">
                {block.items.map((item) => (
                  <section key={item.phrase}>
                    <div>
                      <h3 lang="en">{item.phrase}</h3>
                      <p>{item.meaning}</p>
                      <blockquote lang="en">{item.example}</blockquote>
                    </div>
                    <button
                      aria-label={`В словарь: ${item.phrase}`}
                      onClick={() => onAdd(item, "Fieldnotes · " + block.title)}
                    >
                      <Plus size={17} />
                      <span>В словарь</span>
                    </button>
                  </section>
                ))}
              </div>
            </article>
          )}
        </>
      ) : (
        <>
          <label className="search">
            <Search size={19} />
            <input
              aria-label="Поиск по учебным темам"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                section === "grammar"
                  ? "Найти правило: времена, passive, артикли…"
                  : "Найти тему или выражение…"
              }
            />
          </label>
          <div className="course-grid">
            {section === "grammar"
              ? grammar
                  .filter((g) =>
                    (
                      g.title +
                      " " +
                      g.summary +
                      " " +
                      g.rules.map((r) => r.label + " " + r.form).join(" ")
                    )
                      .toLowerCase()
                      .includes(query),
                  )
                  .map((g, i) => (
                    <button
                      className="topic-card"
                      key={g.id}
                      onClick={() => setSelected(g.id)}
                    >
                      <span className="eyebrow">
                        ПРАВИЛО {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2>{g.title}</h2>
                      <p>{g.summary}</p>
                      <span className="topic-bottom">
                        Объяснение + мини-проверка <ArrowUpRight size={18} />
                      </span>
                    </button>
                  ))
              : vocabulary
                  .filter((v) =>
                    (
                      v.title +
                      " " +
                      v.description +
                      " " +
                      v.items.map((i) => i.phrase + " " + i.meaning).join(" ")
                    )
                      .toLowerCase()
                      .includes(query),
                  )
                  .map((v) => (
                    <button
                      className="topic-card"
                      key={v.id}
                      onClick={() => setSelected(v.id)}
                    >
                      <BookOpen size={22} />
                      <h2>{v.title}</h2>
                      <p>{v.description}</p>
                      <span className="topic-bottom">
                        {v.items.length} выражений <ArrowUpRight size={18} />
                      </span>
                    </button>
                  ))}
          </div>
          {(section === "grammar"
            ? grammar.filter((g) =>
                (
                  g.title +
                  " " +
                  g.summary +
                  " " +
                  g.rules.map((r) => r.label + " " + r.form).join(" ")
                )
                  .toLowerCase()
                  .includes(query),
              )
            : vocabulary.filter((v) =>
                (
                  v.title +
                  " " +
                  v.description +
                  " " +
                  v.items.map((i) => i.phrase + " " + i.meaning).join(" ")
                )
                  .toLowerCase()
                  .includes(query),
              )
          ).length === 0 && (
            <p className="empty">Ничего не найдено. Попробуйте другое слово.</p>
          )}
          {!query && (
            <section className="study-roadmap">
              <span className="eyebrow">ОРИЕНТИР НА ДВА МЕСЯЦА</span>
              <h2>От понимания к уверенной практике</h2>
              <div>
                {roadmap.map((step) => (
                  <article key={step.week}>
                    <span>Недели {step.week}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                ))}
              </div>
              <button className="primary" onClick={onPractice}>
                Открыть тесты <ArrowRight size={17} />
              </button>
            </section>
          )}
          <p className="muted course-footnote">
            Базовый справочник B2, а не исчерпывающая грамматика английского.
            Объяснения и примеры подготовлены для Fieldnotes. Дополнительные
            упражнения:{" "}
            <a
              href="https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2"
              target="_blank"
              rel="noopener noreferrer"
            >
              British Council B1–B2 <ArrowUpRight size={12} />
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
