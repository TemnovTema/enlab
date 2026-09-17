import type { VocabularyBlock } from "./types";
const block = (
  id: string,
  title: string,
  description: string,
  items: [string, string, string][],
): VocabularyBlock => ({
  id,
  title,
  description,
  items: items.map(([phrase, meaning, example]) => ({
    phrase,
    meaning,
    example,
  })),
});
export const vocabulary: VocabularyBlock[] = [
  block(
    "education",
    "Образование и университет",
    "Обучение, дедлайны, исследования и академическая жизнь.",
    [
      [
        "meet a deadline",
        "уложиться в срок",
        "Students need to plan ahead to meet a deadline.",
      ],
      [
        "submit an assignment",
        "сдать учебную работу",
        "You can submit an assignment through the online portal.",
      ],
      [
        "gain knowledge",
        "получать знания",
        "Workshops allow students to gain knowledge through practice.",
      ],
      [
        "tuition fees",
        "плата за обучение",
        "Tuition fees vary between institutions.",
      ],
      [
        "academic performance",
        "успеваемость",
        "Sleep can affect academic performance.",
      ],
      [
        "receive feedback",
        "получить обратную связь",
        "Students receive feedback on their first draft.",
      ],
      [
        "develop critical thinking",
        "развивать критическое мышление",
        "Comparing sources helps learners develop critical thinking.",
      ],
      [
        "compulsory attendance",
        "обязательное посещение",
        "The laboratory course requires compulsory attendance.",
      ],
    ],
  ),
  block(
    "environment",
    "Природа и окружающая среда",
    "Климат, ресурсы и устойчивые привычки.",
    [
      [
        "reduce emissions",
        "сокращать выбросы",
        "Better public transport can reduce emissions.",
      ],
      [
        "renewable energy",
        "возобновляемая энергия",
        "The region is investing in renewable energy.",
      ],
      [
        "natural habitat",
        "естественная среда обитания",
        "Road construction can damage an animal’s natural habitat.",
      ],
      [
        "pose a threat",
        "представлять угрозу",
        "Rising temperatures pose a threat to some crops.",
      ],
      [
        "conserve water",
        "экономить воду",
        "Households can conserve water by fixing leaks.",
      ],
      [
        "environmental impact",
        "воздействие на окружающую среду",
        "The report considers the environmental impact of tourism.",
      ],
      [
        "raise awareness",
        "повышать осведомлённость",
        "The campaign aims to raise awareness of food waste.",
      ],
      [
        "sustainable development",
        "устойчивое развитие",
        "The city has adopted a plan for sustainable development.",
      ],
    ],
  ),
  block(
    "technology",
    "Технологии и цифровая жизнь",
    "Польза, риски и изменения в повседневности.",
    [
      [
        "protect personal data",
        "защищать персональные данные",
        "Services must protect personal data.",
      ],
      [
        "access to information",
        "доступ к информации",
        "Libraries provide access to information.",
      ],
      [
        "digital literacy",
        "цифровая грамотность",
        "Digital literacy includes evaluating online sources.",
      ],
      [
        "rely on technology",
        "полагаться на технологии",
        "Many businesses rely on technology to manage orders.",
      ],
      [
        "a reliable source",
        "надёжный источник",
        "A university website can be a reliable source of course information.",
      ],
      [
        "keep up with",
        "успевать за изменениями",
        "Small firms struggle to keep up with rapid technological change.",
      ],
      [
        "automate routine tasks",
        "автоматизировать рутинные задачи",
        "Software can automate routine tasks.",
      ],
      [
        "bridge the gap",
        "сокращать разрыв",
        "Affordable internet can help bridge the gap between communities.",
      ],
    ],
  ),
  block(
    "health",
    "Здоровье и образ жизни",
    "Привычки, благополучие и профилактика.",
    [
      [
        "a balanced diet",
        "сбалансированное питание",
        "A balanced diet includes a variety of foods.",
      ],
      [
        "a sedentary lifestyle",
        "малоподвижный образ жизни",
        "Office work can contribute to a sedentary lifestyle.",
      ],
      [
        "mental well-being",
        "психологическое благополучие",
        "Social connections can support mental well-being.",
      ],
      [
        "cope with stress",
        "справляться со стрессом",
        "Regular breaks help some students cope with stress.",
      ],
      [
        "physical activity",
        "физическая активность",
        "The study measured daily physical activity.",
      ],
      [
        "get enough sleep",
        "достаточно спать",
        "Students often find it difficult to get enough sleep during exams.",
      ],
      [
        "preventive measures",
        "профилактические меры",
        "The programme focuses on preventive measures.",
      ],
      [
        "have an effect on",
        "влиять на",
        "Noise can have an effect on concentration.",
      ],
    ],
  ),
  block("work", "Работа и экономика", "Навыки, занятость и рабочая среда.", [
    [
      "job satisfaction",
      "удовлетворённость работой",
      "Flexible hours may improve job satisfaction.",
    ],
    [
      "work-life balance",
      "баланс работы и личной жизни",
      "Remote work does not always improve work-life balance.",
    ],
    [
      "acquire skills",
      "приобретать навыки",
      "Internships help graduates acquire skills.",
    ],
    [
      "career prospects",
      "карьерные перспективы",
      "Additional training can improve career prospects.",
    ],
    [
      "a shortage of",
      "нехватка чего-либо",
      "The industry faces a shortage of skilled workers.",
    ],
    [
      "earn a living",
      "зарабатывать на жизнь",
      "Many artists earn a living through several kinds of work.",
    ],
    [
      "take responsibility for",
      "брать ответственность за",
      "Team leaders take responsibility for planning.",
    ],
    [
      "economic growth",
      "экономический рост",
      "Infrastructure investment may support economic growth.",
    ],
  ]),
  block(
    "cities",
    "Города, транспорт и общество",
    "Городская среда, жильё и общественные решения.",
    [
      [
        "affordable housing",
        "доступное по цене жильё",
        "The council plans to build more affordable housing.",
      ],
      [
        "traffic congestion",
        "транспортные заторы",
        "Flexible working hours may reduce traffic congestion.",
      ],
      [
        "public transport",
        "общественный транспорт",
        "Reliable public transport makes commuting easier.",
      ],
      [
        "local residents",
        "местные жители",
        "Local residents were invited to discuss the proposal.",
      ],
      [
        "a sense of community",
        "чувство общности",
        "Shared gardens can create a sense of community.",
      ],
      [
        "improve access to",
        "улучшать доступ к",
        "New bus routes will improve access to the hospital.",
      ],
      [
        "quality of life",
        "качество жизни",
        "Green spaces can improve quality of life.",
      ],
      [
        "take into account",
        "принимать во внимание",
        "Planners should take into account the needs of older residents.",
      ],
    ],
  ),
  block(
    "research",
    "Наука, данные и аргументы",
    "Лексика, которая помогает читать академические тексты.",
    [
      [
        "carry out research",
        "проводить исследование",
        "The team will carry out research on commuting habits.",
      ],
      [
        "collect data",
        "собирать данные",
        "Researchers collect data through interviews.",
      ],
      [
        "draw a conclusion",
        "делать вывод",
        "It is too early to draw a conclusion from these results.",
      ],
      [
        "provide evidence",
        "предоставлять свидетельства, данные",
        "The experiment may provide evidence for the theory.",
      ],
      [
        "a significant increase",
        "значительное увеличение",
        "The survey recorded a significant increase in participation.",
      ],
      [
        "a wide range of",
        "широкий спектр чего-либо",
        "The sample included a wide range of age groups.",
      ],
      [
        "be associated with",
        "быть связанным с",
        "Long journeys can be associated with higher stress levels.",
      ],
      [
        "a potential drawback",
        "возможный недостаток",
        "The small sample size is a potential drawback of the study.",
      ],
    ],
  ),
  block(
    "argument",
    "Мнение, контраст и перефразирование",
    "Полезные связки для понимания и построения аргумента.",
    [
      [
        "to some extent",
        "в некоторой степени",
        "I agree with this view to some extent.",
      ],
      [
        "in contrast",
        "в противоположность этому",
        "The north was dry; in contrast, the south received heavy rain.",
      ],
      [
        "as a result",
        "в результате",
        "The train was cancelled; as a result, we arrived late.",
      ],
      [
        "in terms of",
        "с точки зрения, в отношении",
        "The options differ in terms of cost.",
      ],
      [
        "play a crucial role",
        "играть ключевую роль",
        "Teachers play a crucial role in supporting learners.",
      ],
      [
        "outweigh the disadvantages",
        "перевешивать недостатки",
        "In this case, the benefits outweigh the disadvantages.",
      ],
      [
        "from my perspective",
        "с моей точки зрения",
        "From my perspective, the proposal needs more evidence.",
      ],
      [
        "regardless of",
        "независимо от",
        "The library is open to everyone, regardless of age.",
      ],
    ],
  ),
];
export const roadmap = [
  {
    week: "01–02",
    title: "Основа и диагностика",
    text: "Пройдите по одному Reading и Listening. Разберите ошибки. Повторите времена, артикли и количественные слова.",
  },
  {
    week: "03–04",
    title: "Точность понимания",
    text: "Тренируйте True / False / Not Given и пропуски. Разберите модальные глаголы, пассив и условные предложения.",
  },
  {
    week: "05–06",
    title: "Скорость и перефразирование",
    text: "Решайте задания с таймером. Ищите в тексте перефразированные ответы, повторяйте связки и тематические выражения.",
  },
  {
    week: "07–08",
    title: "Репетиция экзамена",
    text: "Используйте полные варианты вашего экзамена или официальные пробники нужного формата. Включайте Writing и Speaking; эти мини-тесты покрывают только Reading и Listening.",
  },
];
