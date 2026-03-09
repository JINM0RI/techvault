"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { OutputPanel } from "@/components/OutputPanel";
import { runCode } from "@/lib/api";
import { BlockLanguage } from "@/lib/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type CodeBlockProps = {
  code: string;
  language: string;
  onSave: (content: string, language: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onMove: (direction: "up" | "down") => Promise<void>;
};

const LANG_OPTIONS: BlockLanguage[] = ["python", "javascript", "sql", "html", "css"];

export function CodeBlock({ code, language, onSave, onDelete, onMove }: CodeBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftCode, setDraftCode] = useState(code);
  const [draftLanguage, setDraftLanguage] = useState(language || "python");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftCode(code);
      setDraftLanguage(language || "python");
    }
  }, [code, language, isEditing]);

  async function handleRun() {
    if (draftLanguage !== "python") {
      setOutput("Execution is available for Python only in PROTO1.");
      return;
    }

    setIsRunning(true);
    try {
      const result = await runCode(draftCode);
      setOutput(result);
    } catch {
      setOutput("Failed to execute code.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(draftCode, draftLanguage);
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
        <span className="ml-auto rounded bg-slate-100 px-2 py-1 text-xs uppercase tracking-wide text-slate-600">
          {language || "python"}
        </span>
      </div>

      <MonacoEditor
        height="220px"
        language={language || "python"}
        value={code}
        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className="rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isRunning ? "Running..." : "Run"}
        </button>
      </div>

      <div className="mt-3">
        <OutputPanel output={output} isRunning={isRunning} />
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Edit Code Block</h3>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Language
              <select
                value={draftLanguage}
                onChange={(event) => setDraftLanguage(event.target.value)}
                className="mt-1 block w-full rounded border border-slate-300 px-2 py-1"
              >
                {LANG_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <MonacoEditor
              height="300px"
              language={draftLanguage}
              value={draftCode}
              onChange={(value) => setDraftCode(value ?? "")}
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSave}
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
