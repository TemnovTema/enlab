import type { GrammarLesson } from "./types";
export const grammar: GrammarLesson[] = [
  {
    id: "present",
    title: "Настоящее: Simple и Continuous",
    summary: "Привычки, факты, временные ситуации и изменения.",
    rules: [
      {
        label: "Present Simple",
        form: "I/you/we/they work · he/she/it works",
        explanation:
          "Регулярные действия, общие факты и состояния. В вопросах и отрицаниях: do/does + начальная форма.",
        example:
          "The university offers evening courses. Does the library close at six?",
      },
      {
        label: "Present Continuous",
        form: "am/is/are + verb-ing",
        explanation:
          "Действие сейчас, временная ситуация или изменение. Stative verbs (know, believe, own) обычно употребляются в Simple.",
        example:
          "I am staying near campus this month. The demand for online courses is growing.",
      },
      {
        label: "Разное значение глагола",
        form: "think / be thinking",
        explanation:
          "Think в значении «считать» описывает мнение; be thinking about означает процесс обдумывания.",
        example:
          "I think the course is useful. I am thinking about changing my timetable.",
      },
    ],
    mistake:
      "Не добавляйте -s после does: Does she study? Не Does she studies?",
    check: {
      question: "This semester, I ___ with two other students.",
      options: ["am living", "live usually", "am knowing"],
      answer: "am living",
      explanation:
        "This semester задаёт временную ситуацию: Present Continuous.",
    },
  },
  {
    id: "past",
    title: "Прошедшее: Simple, Continuous, Perfect",
    summary: "Событие, фон и то, что произошло ещё раньше.",
    rules: [
      {
        label: "Past Simple",
        form: "verb-ed / irregular form",
        explanation:
          "Завершённое событие в определённый прошлый момент. После did/didn’t используется начальная форма.",
        example:
          "The researchers published their findings in 2022. They did not include children.",
      },
      {
        label: "Past Continuous",
        form: "was/were + verb-ing",
        explanation:
          "Действие в процессе в прошлом, часто фон для другого события.",
        example: "I was taking notes when the lecturer changed the slide.",
      },
      {
        label: "Past Perfect",
        form: "had + past participle",
        explanation:
          "Действие, завершившееся до другого прошлого момента. Не требуется для каждого события в рассказе.",
        example: "By the time we arrived, the lecture had started.",
      },
    ],
    mistake: "I didn’t went → I didn’t go. Had went → had gone.",
    check: {
      question:
        "When I reached the station, the train ___. I had to wait for the next one.",
      options: ["has left", "had left", "was leaving tomorrow"],
      answer: "had left",
      explanation: "Поезд ушёл до вашего прибытия: had left.",
    },
  },
  {
    id: "perfect",
    title: "Present Perfect и Perfect Continuous",
    summary: "Связь прошлого с настоящим, результат и длительность.",
    rules: [
      {
        label: "Результат и опыт",
        form: "have/has + past participle",
        explanation:
          "Опыт до настоящего момента, недавний результат, незавершённый период. Не сочетается с завершённым yesterday/in 2020.",
        example:
          "I have submitted my application. She has visited three universities this year.",
      },
      {
        label: "Длительность",
        form: "have/has been + verb-ing",
        explanation:
          "Подчёркивает процесс, начавшийся раньше и продолжающийся сейчас либо недавно завершившийся.",
        example: "We have been analysing the data all morning.",
      },
      {
        label: "Since и for",
        form: "since + starting point · for + duration",
        explanation:
          "Since указывает начало, for — продолжительность. С состояниями используйте Perfect Simple.",
        example:
          "I have known her since September. I have studied here for two years.",
      },
    ],
    mistake: "I have seen him yesterday → I saw him yesterday.",
    check: {
      question: "I ___ three chapters so far.",
      options: ["have read", "read yesterday", "have been read"],
      answer: "have read",
      explanation:
        "So far и измеримый результат three chapters требуют Present Perfect Simple.",
    },
  },
  {
    id: "future",
    title: "Будущее и будущие завершённые действия",
    summary: "Решения, планы, расписания и дедлайны.",
    rules: [
      {
        label: "Will и going to",
        form: "will + verb · am/is/are going to + verb",
        explanation:
          "Will: решение в момент речи, обещание или прогноз. Going to: предварительное намерение или прогноз по видимым признакам.",
        example:
          "I will help you with the notes. I am going to apply for a scholarship.",
      },
      {
        label: "Договорённости и расписания",
        form: "Present Continuous / Present Simple",
        explanation:
          "Continuous — личная договорённость; Simple — официальное расписание.",
        example: "I am meeting my tutor on Friday. The exam starts at nine.",
      },
      {
        label: "Future Continuous / Perfect",
        form: "will be working · will have finished",
        explanation:
          "Continuous — процесс в будущем; Perfect — завершение к будущему моменту.",
        example:
          "At ten, I will be taking the test. By Friday, I will have finished the report.",
      },
    ],
    mistake:
      "В придаточном времени обычно без will: I will call when I arrive.",
    check: {
      question: "By the end of June, we ___ the project.",
      options: ["will have completed", "will completing", "have complete"],
      answer: "will have completed",
      explanation: "Завершение к будущей дате: Future Perfect.",
    },
  },
  {
    id: "conditionals",
    title: "Условные предложения: 0, 1, 2, 3",
    summary: "Закономерность, реальное условие и воображаемые ситуации.",
    rules: [
      {
        label: "Zero и First",
        form: "if + present, present / will + verb",
        explanation:
          "Zero — закономерность. First — реальная возможность в будущем. В обычном условии после if не ставится will.",
        example:
          "If water freezes, it expands. If I pass the exam, I will apply for the programme.",
      },
      {
        label: "Second",
        form: "if + past, would + verb",
        explanation:
          "Воображаемая или маловероятная ситуация сейчас/в будущем. В формальном условии: If I were you.",
        example: "If I had more time, I would take another course.",
      },
      {
        label: "Third",
        form: "if + had + V3, would have + V3",
        explanation:
          "Нереальное условие в прошлом и его нереальный прошлый результат.",
        example: "If she had left earlier, she would have caught the bus.",
      },
    ],
    mistake:
      "If I would know → If I knew. Не путайте прошлую форму во втором типе с реальным прошлым.",
    check: {
      question: "If I had checked the timetable, I ___ the lecture.",
      options: ["would not have missed", "will not miss", "do not miss"],
      answer: "would not have missed",
      explanation: "Нереальное прошлое условие: third conditional.",
    },
  },
  {
    id: "wish",
    title: "Mixed conditionals, wish и unless",
    summary: "Прошлая причина с нынешним результатом и сожаления.",
    rules: [
      {
        label: "Mixed conditional",
        form: "if + had + V3, would + verb",
        explanation: "Прошлое событие, которое могло бы изменить настоящее.",
        example: "If I had accepted the offer, I would live abroad now.",
      },
      {
        label: "Wish",
        form: "wish + past / past perfect",
        explanation:
          "Past — желание изменить настоящее; Past Perfect — сожаление о прошлом. Wish + would описывает желаемое изменение поведения/ситуации.",
        example:
          "I wish I understood this topic. I wish I had revised earlier.",
      },
      {
        label: "Unless",
        form: "unless = if ... not",
        explanation:
          "Unless вводит отрицательное условие. Не добавляйте лишнее отрицание.",
        example: "You cannot enter unless you show your student card.",
      },
    ],
    mistake:
      "I wish I would know → I wish I knew. Unless you don’t pay меняет смысл «если не заплатишь».",
    check: {
      question: "I failed yesterday. I wish I ___ more.",
      options: ["had studied", "study", "will study"],
      answer: "had studied",
      explanation: "Сожаление о завершённом прошлом: wish + Past Perfect.",
    },
  },
  {
    id: "modals",
    title: "Модальные глаголы",
    summary: "Обязанность, запрет, совет и вероятность.",
    rules: [
      {
        label: "Обязанность и отсутствие необходимости",
        form: "must / have to · don’t have to",
        explanation:
          "Must/have to — необходимость. Don’t have to — необязательно. Mustn’t — запрещено.",
        example:
          "You must bring identification. You do not have to print the form. You must not use a phone.",
      },
      {
        label: "Совет и возможность",
        form: "should / could / might + verb",
        explanation:
          "Should — совет; could — возможность или предложение; might — неопределённая вероятность.",
        example:
          "You should check your answers. The results might arrive tomorrow.",
      },
      {
        label: "Вывод о прошлом",
        form: "must/can’t/might have + V3",
        explanation:
          "Must have — уверенный положительный вывод; can’t have — уверенный отрицательный; might have — возможное объяснение.",
        example:
          "She must have forgotten the deadline. He cannot have read all the books in one hour.",
      },
    ],
    mistake:
      "Mustn’t и don’t have to не синонимы: запрет против отсутствия обязанности.",
    check: {
      question: "The course is optional. You ___ attend.",
      options: ["must not", "do not have to", "cannot"],
      answer: "do not have to",
      explanation:
        "Optional означает, что посещение не обязательно, а не запрещено.",
    },
  },
  {
    id: "passive",
    title: "Пассивный залог",
    summary: "Когда важнее действие или результат, чем исполнитель.",
    rules: [
      {
        label: "Основная конструкция",
        form: "be in the required tense + V3",
        explanation:
          "Время выражает be; причастие не меняется. Исполнителя можно добавить через by.",
        example:
          "The essays are marked anonymously. The bridge was built in 1980.",
      },
      {
        label: "Сложные формы",
        form: "has been done · is being done · must be done",
        explanation:
          "Perfect подчёркивает результат; Continuous — текущий процесс; модальный глагол ставится перед be.",
        example:
          "The results have been published. The hall is being repaired. All questions must be answered.",
      },
      {
        label: "Безличное сообщение",
        form: "It is believed that ...",
        explanation:
          "Позволяет передать мнение или сообщение без указания конкретного автора.",
        example: "It is believed that regular practice improves performance.",
      },
    ],
    mistake:
      "The report was wrote → was written. Не теряйте be после модального глагола.",
    check: {
      question: "The applications ___ at the moment.",
      options: ["are being reviewed", "are reviewing", "have reviewing"],
      answer: "are being reviewed",
      explanation:
        "Заявки подвергаются рассмотрению прямо сейчас: Present Continuous Passive.",
    },
  },
  {
    id: "reported",
    title: "Косвенная речь и вопросы",
    summary: "Передать чужие слова с правильным порядком слов.",
    rules: [
      {
        label: "Сообщения",
        form: "said (that) · told someone (that)",
        explanation:
          "При переносе точки отсчёта в прошлое время часто сдвигается назад: is→was, have done→had done, will→would. Если факт остаётся актуальным, сдвиг не всегда обязателен.",
        example: "She said that she was tired. He told me that he would call.",
      },
      {
        label: "Косвенные вопросы",
        form: "asked if/whether · asked where/why + subject + verb",
        explanation:
          "Порядок слов утвердительный; вспомогательные do/does/did исчезают.",
        example:
          "She asked where I lived. He asked whether the library was open.",
      },
      {
        label: "Просьбы",
        form: "asked/told + object + (not) to + verb",
        explanation: "Для просьб и указаний удобно использовать инфинитив.",
        example:
          "The tutor asked us to submit the draft. She told me not to wait.",
      },
    ],
    mistake: "She asked where did I live → She asked where I lived.",
    check: {
      question: "He asked me ___.",
      options: ["where I studied", "where did I study", "where do I studied"],
      answer: "where I studied",
      explanation:
        "В косвенном вопросе используется утвердительный порядок слов.",
    },
  },
  {
    id: "relatives",
    title: "Относительные придаточные",
    summary: "Who, which, that, whose и различие запятых.",
    rules: [
      {
        label: "Defining",
        form: "noun + who/which/that ...",
        explanation:
          "Уточняет, о каком предмете/человеке идёт речь. Запятых нет. Who — люди, which — вещи, that — оба варианта.",
        example: "Students who attend regularly tend to improve faster.",
      },
      {
        label: "Non-defining",
        form: "noun, who/which ...,",
        explanation:
          "Добавляет необязательную информацию, выделяется запятыми. That здесь не используется.",
        example: "The library, which opened last year, has quiet study rooms.",
      },
      {
        label: "Whose и опущение",
        form: "whose + noun",
        explanation:
          "Whose выражает принадлежность. В defining можно опустить объектное местоимение, но не подлежащее.",
        example:
          "The student whose laptop broke borrowed mine. The book (that) I borrowed is useful.",
      },
    ],
    mistake:
      "Не опускайте who, если оно подлежащее: the person who called, не the person called в этом значении.",
    check: {
      question: "My tutor, ___ office is upstairs, teaches economics.",
      options: ["whose", "which", "that"],
      answer: "whose",
      explanation: "Речь о принадлежности: офис преподавателя.",
    },
  },
  {
    id: "gerunds",
    title: "Герундий и инфинитив",
    summary: "Enjoy doing, decide to do и изменение смысла.",
    rules: [
      {
        label: "Глагол + -ing",
        form: "enjoy / avoid / consider / suggest + -ing",
        explanation:
          "После этих глаголов используйте герундий. После предлогов также обычно -ing.",
        example: "I enjoy reading. She is interested in studying abroad.",
      },
      {
        label: "Глагол + to",
        form: "decide / hope / plan / manage + to + verb",
        explanation:
          "Эти глаголы требуют инфинитив. После make/let + object в активном залоге используется инфинитив без to.",
        example:
          "They decided to postpone the meeting. The tutor let us leave early.",
      },
      {
        label: "Remember и stop",
        form: "remember doing / to do · stop doing / to do",
        explanation:
          "Remember doing — помнить прошлое; remember to do — не забыть действие. Stop doing — прекратить; stop to do — остановиться ради другого действия.",
        example:
          "I remember meeting her. Remember to save the file. We stopped to buy water.",
      },
    ],
    mistake:
      "I look forward to hear → I look forward to hearing: to здесь предлог.",
    check: {
      question: "We are considering ___ the deadline.",
      options: ["extending", "to extend", "extend"],
      answer: "extending",
      explanation: "После consider нужен герундий.",
    },
  },
  {
    id: "articles",
    title: "Артикли и определители",
    summary: "A/an, the, нулевой артикль и обобщения.",
    rules: [
      {
        label: "A/an",
        form: "a/an + singular countable noun",
        explanation:
          "Один неопределённый предмет/представитель класса. An выбирается по звуку, а не по букве.",
        example:
          "She is a researcher. We waited for an hour. It is a useful book.",
      },
      {
        label: "The",
        form: "the + identified noun",
        explanation:
          "Конкретный, известный собеседникам предмет, уникальный в контексте или определённый уточнением.",
        example: "I read an article. The article described a new experiment.",
      },
      {
        label: "Обобщение",
        form: "plural / uncountable noun without article",
        explanation:
          "Для общих категорий часто нужен нулевой артикль. Для одного исчисляемого существительного определитель обычно обязателен.",
        example: "Education can improve lives. Students need feedback.",
      },
    ],
    mistake:
      "An university → a university: начало /juː/. An hour, потому что h не произносится.",
    check: {
      question: "She gave me ___ useful piece of advice.",
      options: ["a", "an", "—"],
      answer: "a",
      explanation:
        "Piece — исчисляемое в единственном числе; useful начинается со звука /j/.",
    },
  },
  {
    id: "quantifiers",
    title: "Количество и исчисляемость",
    summary: "Much/many, few/little, fewer/less и согласование.",
    rules: [
      {
        label: "Much и many",
        form: "many + plural · much + uncountable",
        explanation:
          "Advice, information, research и equipment обычно неисчисляемы. Для единицы: a piece of advice/information.",
        example:
          "There are many sources, but there is not much reliable information.",
      },
      {
        label: "Few и little",
        form: "(a) few + plural · (a) little + uncountable",
        explanation:
          "Без a подчёркивается недостаток; с a — некоторое, пусть небольшое количество.",
        example:
          "Few students replied, so the sample was too small. We still have a little time.",
      },
      {
        label: "Fewer, less, each",
        form: "fewer + plural · less + uncountable · each + singular",
        explanation:
          "Для экзамена придерживайтесь стандартного различия fewer/less. Each/every обычно требуют единственного числа глагола.",
        example:
          "Fewer cars mean less pollution. Each participant receives a certificate.",
      },
    ],
    mistake:
      "Many informations → much information. Each students have → Each student has.",
    check: {
      question: "There were ___ participants than expected.",
      options: ["fewer", "less", "little"],
      answer: "fewer",
      explanation: "Participants — исчисляемое во множественном числе.",
    },
  },
  {
    id: "comparison",
    title: "Сравнения, степень и результат",
    summary: "Comparatives, as … as, too/enough и so/such.",
    rules: [
      {
        label: "Сравнительная степень",
        form: "-er / more ... than · the -est / most",
        explanation:
          "Не сочетайте more с -er. Усиление: much/far/slightly + comparative.",
        example:
          "This method is far more efficient. The second task was slightly easier.",
      },
      {
        label: "Равенство и параллельное изменение",
        form: "as ... as · the more ..., the more ...",
        explanation:
          "As … as выражает равенство; парная конструкция показывает связь изменений.",
        example:
          "The course is not as demanding as I expected. The more you practise, the more confident you become.",
      },
      {
        label: "Too/enough, so/such",
        form: "too + adjective · adjective + enough · enough + noun",
        explanation:
          "Too означает чрезмерность. So + adjective; such + (a/an) + adjective + noun.",
        example:
          "The room is too noisy to study. We have enough time. It was such a useful lecture.",
      },
    ],
    mistake:
      "Enough clear → clear enough. So useful lecture → such a useful lecture.",
    check: {
      question: "The instructions were not clear ___ for beginners.",
      options: ["enough", "too", "such"],
      answer: "enough",
      explanation: "Enough стоит после прилагательного clear.",
    },
  },
  {
    id: "linking",
    title: "Связки: причина, контраст, цель",
    summary: "Понимать логику текста и строить связные ответы.",
    rules: [
      {
        label: "Контраст",
        form: "although + clause · despite + noun/-ing",
        explanation:
          "Although требует подлежащее и сказуемое; despite/in spite of — существительное или герундий. However связывает отдельные мысли.",
        example:
          "Although it was expensive, we enrolled. Despite the cost, we enrolled.",
      },
      {
        label: "Причина и следствие",
        form: "because + clause · because of + noun · therefore",
        explanation:
          "Различайте причину и вывод. Therefore и as a result обозначают следствие, а не саму причину.",
        example:
          "The seminar was cancelled because the speaker was ill. As a result, students went home.",
      },
      {
        label: "Цель",
        form: "to / in order to + verb · so that + clause",
        explanation:
          "To вводит цель действия; so that позволяет указать другого исполнителя или модальность.",
        example:
          "I took notes to remember the details. She spoke slowly so that everyone could follow.",
      },
    ],
    mistake:
      "Despite it was raining → Although it was raining / Despite the rain.",
    check: {
      question: "___ being tired, she finished the report.",
      options: ["Despite", "Although", "Because"],
      answer: "Despite",
      explanation: "После пропуска стоит -ing, поэтому подходит despite.",
    },
  },
  {
    id: "word-formation",
    title: "Словообразование, предлоги и сочетания",
    summary: "Определять часть речи и учить слова вместе.",
    rules: [
      {
        label: "Части речи",
        form: "analyse → analysis → analytical · care → careful → carefully",
        explanation:
          "В пропуске определите функцию: перед существительным часто прилагательное, после артикля — существительное, действие может уточнять наречие.",
        example:
          "The researchers conducted a detailed analysis. They examined the evidence carefully.",
      },
      {
        label: "Устойчивые предлоги",
        form: "depend on · responsible for · interested in · access to",
        explanation:
          "Предлог часто определяется словом, а не переводом на русский. Запоминайте сочетание целиком.",
        example:
          "Success depends on regular practice. Students need access to reliable sources.",
      },
      {
        label: "Collocations и phrasal verbs",
        form: "make progress · do research · carry out a study",
        explanation:
          "Учите типичные пары и фразовые глаголы в предложении. У разделяемого фразового глагола местоимение ставится между частями.",
        example: "We carried out a survey. Please turn it off.",
      },
    ],
    mistake: "Do a progress → make progress. Depend from → depend on.",
    check: {
      question: "The team carried ___ a survey of local residents.",
      options: ["out", "on", "off"],
      answer: "out",
      explanation: "Carry out a survey означает «провести опрос».",
    },
  },
];
