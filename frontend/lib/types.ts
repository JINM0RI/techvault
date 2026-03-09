export type NotebookCell =
  | {
      type: "markdown";
      content: string;
      language?: never;
    }
  | {
      type: "code";
      content: string;
      language: string;
    };

export type Topic = {
  id: number;
  title: string;
  category: string;
  technology: string;
  created_at: string;
};

export type TopicDetail = Topic & {
  file_path: string;
  cells: NotebookCell[];
};

export type CheatSheet = {
  title: string;
  slug: string;
};
