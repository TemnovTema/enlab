"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Milestone,
  Sparkles,
} from "lucide-react";

export function Today({
  onTimeline,
  onEnglish,
}: {
  onTimeline: () => void;
  onEnglish: () => void;
}) {
  return (
    <div className="learning-today">
      <div className="personal-heading">
        <span className="eyebrow">СЕГОДНЯ</span>
        <span className="personal-edition">МЕСТО ДЛЯ ЛЮБОПЫТСТВА</span>
      </div>
      <section className="learning-quote">
        <span className="quote-mark" aria-hidden="true">
          “
        </span>
        <h1>
          Ученье — свет.
          <br />
          <em>
            А любопытство —<br />
            его начало.
          </em>
        </h1>
        <p>
          Не обязательно знать всё.
          <br />
          Достаточно сегодня узнать чуть больше, чем вчера.
        </p>
        <span className="quote-caption">
          ОДНА МЫСЛЬ. ОДНО ОТКРЫТИЕ. ОДИН ШАГ.
        </span>
      </section>
      <div className="learning-paths">
        <button onClick={onTimeline}>
          <span className="path-index">01 / ИССЛЕДОВАТЬ</span>
          <div>
            <Milestone size={24} />
            <ArrowUpRight size={21} />
          </div>
          <h2>Связать события и идеи</h2>
          <p>История, философия и литература на одной линии времени.</p>
          <span className="path-link">
            Открыть Timeline <ArrowRight size={17} />
          </span>
        </button>
        <button onClick={onEnglish}>
          <span className="path-index">02 / ПРАКТИКОВАТЬ</span>
          <div>
            <BookOpen size={24} />
            <ArrowUpRight size={21} />
          </div>
          <h2>Вернуться к английскому</h2>
          <p>Ваши материалы, выражения, правила и экзаменационные тесты.</p>
          <span className="path-link">
            Английский <ArrowRight size={17} />
          </span>
        </button>
      </div>
      <div className="space-note">
        <Sparkles size={17} />
        <p>
          Ваше пространство для учёбы. Начнём с интереса — остальное выстроится
          постепенно.
        </p>
      </div>
    </div>
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
  const visible =
    active.length === 0 || active.some((t) => t !== "История России");
  return (
    <div className="learning-timeline">
      <div className="page-title">
        <span className="eyebrow">СОБЫТИЯ, ИДЕИ, СВЯЗИ</span>
        <h1>Timeline</h1>
        <p className="lede">
          Большая история складывается из маленьких открытий.
        </p>
      </div>
      <div className="timeline-topics">
        <span className="eyebrow">НАПРАВЛЕНИЯ</span>
        <div role="group" aria-label="Фильтры Timeline">
          <button
            aria-pressed={active.length === 0}
            className={active.length === 0 ? "chosen" : ""}
            onClick={() => setActive([])}
          >
            Все темы
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              aria-pressed={active.includes(topic)}
              className={active.includes(topic) ? "chosen" : ""}
              onClick={() =>
                setActive((current) =>
                  current.includes(topic)
                    ? current.filter((t) => t !== topic)
                    : [...current, topic],
                )
              }
            >
              <i
                aria-hidden="true"
                className={"topic-dot topic-" + topics.indexOf(topic)}
              />
              {topic}
            </button>
          ))}
        </div>
        <p className="muted">
          Можно выбрать несколько направлений: покажем точки хотя бы по одному
          из них.
        </p>
      </div>
      <section className="timeline-track" aria-label="Линия времени">
        <div className="timeline-era">
          <span>ДО НАШЕЙ ЭРЫ</span>
          <span>АНТИЧНОСТЬ</span>
        </div>
        {visible ? (
          <article className="timeline-event">
            <div className="timeline-date">
              <span>V–IV</span>
              <small>века до н. э.</small>
            </div>
            <div className="timeline-node" aria-hidden="true" />
            <div className="timeline-event-card">
              <div className="card-top">
                <span className="eyebrow">ДРЕВНЯЯ ГРЕЦИЯ</span>
                <span className="draft-label">Черновик</span>
              </div>
              <h2>Классическая Греция</h2>
              <p>
                От афинского полиса к вопросам о человеке, государстве и хорошем
                устройстве жизни.
              </p>
              <div className="event-topics">
                {topics.slice(0, 3).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <button
                className="text-button"
                aria-expanded={expanded}
                aria-controls="greece-outline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Свернуть заметку" : "Что здесь изучить"}
                <ChevronDown
                  size={16}
                  style={{ transform: expanded ? "rotate(180deg)" : undefined }}
                />
              </button>
              {expanded && (
                <div id="greece-outline" className="greece-outline">
                  <span className="eyebrow">
                    НАБРОСОК ДЛЯ БУДУЩЕГО ИЗУЧЕНИЯ
                  </span>
                  <ul>
                    <li>
                      <strong>История.</strong> Афины и Спарта, устройство
                      полиса и пределы афинской демократии.
                    </li>
                    <li>
                      <strong>Философия.</strong> Сократ, Платон, Аристотель:
                      как задавать вопросы о знании и справедливости.
                    </li>
                    <li>
                      <strong>Литература.</strong> Греческая трагедия: Эсхил,
                      Софокл и Еврипид.
                    </li>
                  </ul>
                  <p className="muted">
                    Начальная черновая точка. Материалы и личные заметки можно
                    будет добавить позже.
                  </p>
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="timeline-empty">
            <h2>Здесь пока чистая страница</h2>
            <p>В направлении «История России» ещё нет точек.</p>
            <button onClick={() => setActive([])}>
              Показать все темы <ArrowRight size={16} />
            </button>
          </div>
        )}
        <div className="timeline-continuation">
          <span aria-hidden="true">+</span>
          <p>
            Дальше — новые связи и открытия.
            <small>Пока на линии времени одна черновая точка.</small>
          </p>
        </div>
      </section>
    </div>
  );
}
