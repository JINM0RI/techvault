"use client";

import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useMemo, useState } from "react";

type ExplanationBlockProps = {
  content: string;
  onSave: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onMove: (direction: "up" | "down") => Promise<void>;
};

const DEFAULT_EXPLANATION_DOC: PartialBlock[] = [
  {
    type: "paragraph",
    content: "Write explanation...",
  },
];

function parseInitialContent(value: string): PartialBlock[] {
  if (!value || !value.trim()) {
    return DEFAULT_EXPLANATION_DOC;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as PartialBlock[];
    }
  } catch {
    // Legacy entries may contain HTML from the previous editor.
  }

  const plainText = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return [
    {
      type: "paragraph",
      content: plainText || "Write explanation...",
    },
  ];
}

export function ExplanationBlock({ content, onSave, onDelete, onMove }: ExplanationBlockProps) {
  const [isSaving, setIsSaving] = useState(false);

  const initialContent = useMemo(() => parseInitialContent(content), [content]);
  const editor = useCreateBlockNote({ initialContent });

  async function save() {
    setIsSaving(true);
    try {
      await onSave(JSON.stringify(editor.document));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="rounded border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => onMove("up")}
          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Move Up
        </button>
        <button
          type="button"
          onClick={() => onMove("down")}
          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Move Down
        </button>

        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="ml-auto rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="rounded border border-slate-200 bg-white">
        <BlockNoteView
          editor={editor}
          formattingToolbar
          linkToolbar
          sideMenu
          slashMenu
          className="min-h-56"
        />
      </div>
    </article>
  );
}
