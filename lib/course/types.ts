export type VocabularyItem = {
  phrase: string;
  meaning: string;
  example: string;
};
export type VocabularyBlock = {
  id: string;
  title: string;
  description: string;
  items: VocabularyItem[];
};
export type GrammarLesson = {
  id: string;
  title: string;
  summary: string;
  rules: {
    label: string;
    form: string;
    explanation: string;
    example: string;
  }[];
  mistake: string;
  check: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  };
};
export type Question = {
  id: string;
  type: "choice" | "tfng" | "gap" | "heading";
  prompt: string;
  options?: string[];
  maxWords?: number;
  answer: string[];
  explanation: string;
  evidence: string;
};
export type PracticeTest = {
  id: string;
  version: number;
  skill: "reading" | "listening";
  title: string;
  subtitle: string;
  minutes: number;
  topic: string;
  instructions: string;
  passage: string[];
  audio?: string;
  transcript?: string;
  questions: Question[];
};
export type PublicTest = Omit<PracticeTest, "questions" | "transcript"> & {
  questions: Omit<Question, "answer" | "explanation" | "evidence">[];
};
export type TestResult = {
  testId: string;
  version: number;
  title: string;
  skill: "reading" | "listening";
  score: number;
  total: number;
  completedAt: string;
  transcript?: string;
  items: {
    id: string;
    prompt: string;
    submitted: string;
    accepted: string[];
    correct: boolean;
    explanation: string;
    evidence: string;
  }[];
};
