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

export type Topic = {
  id: number;
  title: string;
  category: string;
  technology: string;
  language: string;
  created_at: string;
};

export type TopicDetail = Topic & {
  blocks: Block[];
};

export type CreateTopicPayload = {
  category: string;
  technology: string;
  title: string;
  language: string;
};

export type CheatSheet = {
  title: string;
  slug: string;
};
