export type Material = {
  id: string;
  title: string;
  path: string;
  kind: string;
  status: string;
  error: string | null;
  position: number;
  processed_pages: number;
  total_pages: number | null;
  created_at: string;
  updated_at: string;
};
export type Expression = {
  id: string;
  phrase: string;
  meaning: string;
  example: string;
  own_example: string;
  material_id: string | null;
  source: string;
  context: string;
  created_at: string;
  updated_at: string;
};
export type StudyCard = {
  id: string;
  expression_id: string;
  kind: string;
  prompt: string | null;
  version: number;
  due: string;
};
export type Review = { id: string; rating: number; reviewed_at: string };
export type Fragment = { id: string; page: number; text: string };
