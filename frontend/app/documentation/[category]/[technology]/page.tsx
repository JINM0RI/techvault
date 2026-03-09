import Link from "next/link";

import { TopicListManager } from "@/components/TopicListManager";
import { getTopics } from "@/lib/api";

type TechnologyPageProps = {
  params: {
    category: string;
    technology: string;
  };
};

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const category = decodeURIComponent(params.category);
  const technology = decodeURIComponent(params.technology);
  const topics = await getTopics(category, technology);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/documentation/${encodeURIComponent(category)}`}
          className="text-sm text-teal-700 hover:underline"
        >
          Back to technologies
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {technology} topics
        </h1>
        <p className="text-slate-600">Category: {category}</p>
      </div>
      <TopicListManager category={category} technology={technology} topics={topics} />
    </section>
  );
}
