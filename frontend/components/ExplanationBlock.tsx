"use client";

import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useState } from "react";

type ExplanationBlockProps = {
  html: string;
  onSave: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onMove: (direction: "up" | "down") => Promise<void>;
};

export function ExplanationBlock({ html, onSave, onDelete, onMove }: ExplanationBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: html || "<p>Write explanation...</p>",
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !isEditing) {
      editor.commands.setContent(html || "<p>Write explanation...</p>");
    }
  }, [html, editor, isEditing]);

  const viewerHtml = useMemo(() => html || "<p>Empty explanation block.</p>", [html]);

  async function save() {
    if (!editor) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editor.getHTML());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit
        </button>
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
      </div>

      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: viewerHtml }}
      />

      {isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Edit Explanation Block</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Bullet List
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Numbered List
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setColor("#0f766e").run()}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Accent Color
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt("Enter URL");
                  if (!url) return;
                  editor?.chain().focus().setLink({ href: url }).run();
                }}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                Link
              </button>
            </div>
            <div className="min-h-48 rounded border border-slate-300 p-3">
              <EditorContent editor={editor} />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
