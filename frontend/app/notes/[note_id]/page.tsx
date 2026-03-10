import Link from "next/link";
import { notFound } from "next/navigation";

import { TopicListManager } from "@/components/TopicListManager";
import { getNote, getTopics } from "@/lib/api";

type NotePageProps = {
  params: {
    note_id: string;
  };
};

export default async function NotePage({ params }: NotePageProps) {
  const noteId = Number(params.note_id);
  if (Number.isNaN(noteId)) {
    notFound();
  }

  const [note, topics] = await Promise.all([getNote(noteId), getTopics(noteId)]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href={`/documentation/${note.category_id}`} className="text-sm text-teal-700 hover:underline">
          Back to notes
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{note.name}</h1>
        <p className="text-slate-600">Topics</p>
      </div>
      <TopicListManager noteId={noteId} topics={topics} />
    </section>
  );
}
