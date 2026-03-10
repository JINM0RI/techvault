import {
  Block,
  Category,
  CheatSheet,
  CreateCategoryPayload,
  CreateNotePayload,
  CreateTopicPayload,
  Note,
  Topic,
  TopicDetail,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchJson<{ categories: Category[] }>("/categories");
  return data.categories;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return response.json() as Promise<Category>;
}

export async function getCategory(id: number): Promise<Category> {
  return fetchJson<Category>(`/categories/${encodeURIComponent(String(id))}`);
}

export async function getNotes(categoryId: number): Promise<Note[]> {
  const data = await fetchJson<{ notes: Note[] }>(`/categories/${categoryId}/notes`);
  return data.notes;
}

export async function createNote(categoryId: number, payload: CreateNotePayload): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create note");
  }

  return response.json() as Promise<Note>;
}

export async function getNote(id: number): Promise<Note> {
  return fetchJson<Note>(`/notes/${encodeURIComponent(String(id))}`);
}

export async function getTopics(noteId: number): Promise<Topic[]> {
  const data = await fetchJson<{ topics: Topic[] }>(`/notes/${encodeURIComponent(String(noteId))}/topics`);
  return data.topics;
}

export async function getTopicDetail(id: string): Promise<TopicDetail> {
  return fetchJson<TopicDetail>(`/topics/${encodeURIComponent(id)}`);
}

export async function createTopic(noteId: number, payload: CreateTopicPayload): Promise<Topic> {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create topic");
  }

  return response.json() as Promise<Topic>;
}

export async function createBlock(
  topicId: number,
  blockType: "explanation" | "code",
  content = "",
  language?: string,
): Promise<Block> {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}/blocks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ block_type: blockType, content, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to create block");
  }

  return response.json() as Promise<Block>;
}

export async function updateBlock(
  blockId: number,
  content: string,
  language?: string,
): Promise<Block> {
  const response = await fetch(`${API_BASE_URL}/blocks/${blockId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to update block");
  }

  return response.json() as Promise<Block>;
}

export async function deleteBlock(blockId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/blocks/${blockId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete block");
  }
}

export async function moveBlock(blockId: number, direction: "up" | "down"): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/blocks/${blockId}/move`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ direction }),
  });

  if (!response.ok) {
    throw new Error("Failed to move block");
  }
}

export async function runCode(code: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/run-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error("Failed to execute code");
  }

  const data = (await response.json()) as { output: string };
  return data.output;
}

export async function getCheatSheets(): Promise<CheatSheet[]> {
  const data = await fetchJson<{ cheatsheets: CheatSheet[] }>("/cheatsheets");
  return data.cheatsheets;
}

export async function getCheatSheet(slug: string): Promise<CheatSheet & { content: string }> {
  return fetchJson<CheatSheet & { content: string }>(
    `/cheatsheets/${encodeURIComponent(slug)}`,
  );
}

export { API_BASE_URL };
