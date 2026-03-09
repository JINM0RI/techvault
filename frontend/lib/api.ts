import { CheatSheet, Topic, TopicDetail } from "@/lib/types";

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
