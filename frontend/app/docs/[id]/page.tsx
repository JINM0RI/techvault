import Link from "next/link";

import { InteractiveCodeBlock } from "@/components/InteractiveCodeBlock";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getTopicDetail } from "@/lib/api";

type TopicDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const topic = await getTopicDetail(params.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Interactive Topic</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{topic.title}</h1>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            Category: <span className="font-medium capitalize text-slate-800">{topic.category}</span>
          </p>
          <p>
            Technology: <span className="font-medium capitalize text-slate-800">{topic.technology}</span>
          </p>
          <p>Cells: {topic.cells.length}</p>
        </div>
        <Link
          href={`/documentation/${encodeURIComponent(topic.category)}/${encodeURIComponent(topic.technology)}`}
          className="mt-4 inline-block text-sm text-teal-700 hover:underline"
        >
          Back to topic list
        </Link>
      </aside>

      <section className="space-y-4">
        {topic.cells.map((cell, index) => (
          <div key={`${cell.type}-${index}`} className="animate-float-in">
            {cell.type === "markdown" ? (
              <MarkdownRenderer content={cell.content} />
            ) : (
              <InteractiveCodeBlock initialCode={cell.content} />
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
