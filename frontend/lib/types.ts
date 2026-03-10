export type BlockType = "explanation" | "code";

export type BlockLanguage = "python" | "javascript" | "sql" | "html" | "css";

export type Block = {
  id: number;
  topic_id: number;
  block_type: BlockType;
  content: string;
  language: string | null;
  position: number;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  created_at: string;
};

export type Note = {
  id: number;
  category_id: number;
  name: string;
  technology: string | null;
  created_at: string;
};

export type Topic = {
  id: number;
  note_id: number;
  title: string;
  language: string;
  created_at: string;
};

export type TopicDetail = Topic & {
  category: { id: number; name: string } | null;
  note: { id: number; name: string; technology: string | null } | null;
  blocks: Block[];
};

export type CreateCategoryPayload = { name: string };

export type CreateNotePayload = { name: string; technology?: string };

export type CreateTopicPayload = { title: string; language: string };

export type CheatSheet = {
  title: string;
  slug: string;
};
