import Link from "next/link";

import { Note } from "@/lib/types";

type NotesListProps = {
  notes: Note[];
};

export function NotesList({ notes }: NotesListProps) {
  if (!notes.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        No notes available in this category.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-600"
          >
            <span className="font-medium text-slate-900">{note.name}</span>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {note.technology || "General"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
