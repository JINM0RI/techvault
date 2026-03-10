import Link from "next/link";

import { TopicEditor } from "@/components/TopicEditor";
import { getTopicDetail } from "@/lib/api";

type TopicPageProps = {
  params: {
    id: string;
  };
};

export default async function TopicPage({ params }: TopicPageProps) {
  const topic = await getTopicDetail(params.id);

  return (
    <section className="space-y-4">
      <Link href={`/notes/${topic.note_id}`} className="text-sm text-teal-700 hover:underline">
        Back to topics
      </Link>
      <TopicEditor initialTopic={topic} />
    </section>
  );
}
