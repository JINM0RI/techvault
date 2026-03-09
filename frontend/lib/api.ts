import { Block, CheatSheet, CreateTopicPayload, Topic, TopicDetail } from "@/lib/types";

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

export async function getCategories(): Promise<string[]> {
  const data = await fetchJson<{ categories: string[] }>("/documentation/categories");
  return data.categories;
}

export async function getTechnologies(category: string): Promise<string[]> {
  const data = await fetchJson<{ technologies: string[] }>(
    `/documentation/${encodeURIComponent(category)}/technologies`,
  );
  return data.technologies;
}

export async function getTopics(
  category: string,
  technology: string,
): Promise<Topic[]> {
  const data = await fetchJson<{ topics: Topic[] }>(
    `/documentation/${encodeURIComponent(category)}/${encodeURIComponent(technology)}/topics`,
  );
  return data.topics;
}

export async function getTopicDetail(id: string): Promise<TopicDetail> {
  return fetchJson<TopicDetail>(`/topics/${encodeURIComponent(id)}`);
}

export async function createTopic(payload: CreateTopicPayload): Promise<{ id: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create topic");
  }

  return response.json() as Promise<{ id: number; message: string }>;
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
