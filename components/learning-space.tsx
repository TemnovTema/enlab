"use client";
import { useRef, useState } from "react";

export function Today() {
  return (
    <section className="quiet-today">
      <h1>Сегодня</h1>
      <p>Ученье — свет.</p>
      <span>Сегодня можно узнать что-то новое.</span>
    </section>
  );
}
const topics = [
  "Мировая история",
  "Философия",
  "Литература",
  "История России",
] as const;
export function Timeline() {
  const [active, setActive] = useState<string[]>([]),
    [expanded, setExpanded] = useState(false);
  const point = useRef<HTMLButtonElement>(null);
  const visible =
    active.length === 0 || active.some((t) => t !== "История России");
  function close() {
    setExpanded(false);
    point.current?.focus();
  }
  return (
    <section
      className="quiet-timeline"
      onKeyDown={(e) => {
        if (e.key === "Escape" && expanded) {
          e.preventDefault();
          close();
        }
      }}
    >
      <h1>Timeline</h1>
      <div className="quiet-tags" role="group" aria-label="Фильтры Timeline">
        <button
          aria-pressed={active.length === 0}
          onClick={() => {
            setActive([]);
            setExpanded(false);
          }}
        >
          Все темы
        </button>
        {topics.map((topic) => (
          <button
            key={topic}
            aria-pressed={active.includes(topic)}
            onClick={() => {
              setActive((current) =>
                current.includes(topic)
                  ? current.filter((t) => t !== topic)
                  : [...current, topic],
              );
              setExpanded(false);
            }}
          >
            {topic}
          </button>
        ))}
      </div>
      <div className="horizontal-timeline" aria-label="Линия времени">
        <div className="time-axis" aria-hidden="true" />
        {visible && (
          <button
            ref={point}
            className="time-point"
            aria-expanded={expanded}
            aria-controls="greece-detail"
            onClick={() => setExpanded((v) => !v)}
            aria-label="Классическая Греция, V–IV века до н. э."
          >
            <span className="point-label">Классическая Греция</span>
            <span className="point-circle" aria-hidden="true" />
            <span className="point-date">V–IV века до н. э.</span>
          </button>
        )}
      </div>
      {!visible && (
        <p className="quiet-empty">
          В направлении «История России» пока нет точек.
        </p>
      )}
      {visible && expanded && (
        <article
          className="timeline-detail"
          id="greece-detail"
          aria-labelledby="greece-title"
        >
          <div className="detail-heading">
            <div>
              <span className="detail-meta">Древняя Греция · Черновик</span>
              <h2 id="greece-title">Классическая Греция</h2>
            </div>
            <button onClick={close} aria-label="Закрыть заметку">
              Закрыть
            </button>
          </div>
          <p>
            От афинского полиса к вопросам о человеке, государстве и хорошем
            устройстве жизни.
          </p>
          <dl>
            <div>
              <dt>История</dt>
              <dd>
                Афины и Спарта, устройство полиса и пределы афинской демократии.
              </dd>
            </div>
            <div>
              <dt>Философия</dt>
              <dd>
                Сократ, Платон, Аристотель: вопросы о знании и справедливости.
              </dd>
            </div>
            <div>
              <dt>Литература</dt>
              <dd>Греческая трагедия: Эсхил, Софокл и Еврипид.</dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}

export function Literature() {
  const books = [
    { title: "Бесы", author: "Фёдор Достоевский", status: "Читаю сейчас" },
    {
      title: "Думай медленно… решай быстро",
      author: "Даниэль Канеман",
      status: "Читаю сейчас",
    },
    { title: "Анна Каренина", author: "Лев Толстой", status: "Читаем зимой" },
  ];
  return (
    <section className="literature-page">
      <h1>Литература</h1>
      <ul className="reading-list">
        {books.map((book) => (
          <li key={book.title}>
            <div>
              <h2>{book.title}</h2>
              <p>{book.author}</p>
            </div>
            <span className="reading-status">{book.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
