"use client";

import { useMemo, useState } from "react";

import { CodeBlock } from "@/components/CodeBlock";
import { ExplanationBlock } from "@/components/ExplanationBlock";
import { createBlock, deleteBlock, moveBlock, updateBlock } from "@/lib/api";
import { Block, TopicDetail } from "@/lib/types";

type TopicEditorProps = {
  initialTopic: TopicDetail;
};

export function TopicEditor({ initialTopic }: TopicEditorProps) {
  const [topic, setTopic] = useState<TopicDetail>(initialTopic);
  const [status, setStatus] = useState("");
  const [slashInput, setSlashInput] = useState("");

  const sortedBlocks = useMemo(
    () => [...topic.blocks].sort((a, b) => a.position - b.position),
    [topic.blocks],
  );

  function replaceBlock(updatedBlock: Block) {
    setTopic((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)),
    }));
  }

  async function refreshTopic() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/topics/${topic.id}`,
      { cache: "no-store" },
    );
    const fresh = (await response.json()) as TopicDetail;
    setTopic(fresh);
  }

  async function addBlock(type: "explanation" | "code") {
    const content =
      type === "explanation" ? "<p>Write your explanation...</p>" : "# Write code here";
    const language = type === "code" ? topic.language || "python" : undefined;

    await createBlock(topic.id, type, content, language);
    await refreshTopic();
    setStatus(`${type === "explanation" ? "Explanation" : "Code"} block added.`);
  }

  async function handleSlashSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = slashInput.trim().toLowerCase();

    if (command === "/code") {
      await addBlock("code");
      setSlashInput("");
      return;
    }

    if (command === "/text") {
      await addBlock("explanation");
      setSlashInput("");
      return;
    }

    setStatus("Supported commands: /code, /text");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {topic.category} / {topic.technology} / {topic.language}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addBlock("explanation")}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Explanation Block
          </button>
          <button
            type="button"
            onClick={() => addBlock("code")}
            className="rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            Add Code Block
          </button>
        </div>

        <form onSubmit={handleSlashSubmit} className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Slash Commands</label>
          <input
            value={slashInput}
            onChange={(event) => setSlashInput(event.target.value)}
            placeholder="Type /code or /text and press Enter"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </form>

        {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
      </div>

      {sortedBlocks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-600">
          No blocks yet. Add your first explanation or code block.
        </p>
      ) : (
        sortedBlocks.map((block) => {
          const move = async (direction: "up" | "down") => {
            await moveBlock(block.id, direction);
            await refreshTopic();
          };

          const remove = async () => {
            await deleteBlock(block.id);
            await refreshTopic();
          };

          if (block.block_type === "explanation") {
            return (
              <ExplanationBlock
                key={block.id}
                html={block.content}
                onSave={async (content) => {
                  const updated = await updateBlock(block.id, content, block.language || undefined);
                  replaceBlock(updated);
                }}
                onDelete={remove}
                onMove={move}
              />
            );
          }

          return (
            <CodeBlock
              key={block.id}
              code={block.content}
              language={block.language || "python"}
              onSave={async (content, language) => {
                const updated = await updateBlock(block.id, content, language);
                replaceBlock(updated);
              }}
              onDelete={remove}
              onMove={move}
            />
          );
        })
      )}
    </div>
  );
}
