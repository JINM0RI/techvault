import Link from "next/link";

import { Topic } from "@/lib/types";

type TopicListProps = {
  topics: Topic[];
};

export function TopicList({ topics }: TopicListProps) {
  if (!topics.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        No topics available yet for this technology.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {topics.map((topic) => (
        <li key={topic.id}>
          <Link
            href={`/topic/${topic.id}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-600"
          >
            <span className="font-medium text-slate-900">{topic.title}</span>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {new Date(topic.created_at).toLocaleDateString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
