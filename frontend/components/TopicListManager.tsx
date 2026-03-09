"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { createTopic } from "@/lib/api";
import { Topic } from "@/lib/types";

type TopicListManagerProps = {
  category: string;
  technology: string;
  topics: Topic[];
};

export function TopicListManager({ category, technology, topics }: TopicListManagerProps) {
  const [list, setList] = useState<Topic[]>(topics);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sorted = useMemo(
    () => [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [list],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const created = await createTopic({
        category,
        technology,
        title,
        language,
      });

      const createdAt = new Date().toISOString();
      setList((prev) => [
        {
          id: created.id,
          title,
          category,
          technology,
          language,
          created_at: createdAt,
        },
        ...prev,
      ]);
      setTitle("");
      setLanguage("python");
      setStatus("Topic created.");
    } catch {
      setStatus("Failed to create topic.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Add Topic</h2>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Topic Name</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Python Lists"
              required
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-700">Category</span>
            <input
              value={category}
              disabled
              className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2"
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-700">Technology</span>
            <input
              value={technology}
              disabled
              className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="sql">SQL</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Topic"}
          </button>
        </form>
        {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
      </section>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
          No topics available yet for this technology.
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((topic) => (
            <li key={topic.id}>
              <Link
                href={`/topic/${topic.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-600"
              >
                <span className="font-medium text-slate-900">{topic.title}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500">{topic.language}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
