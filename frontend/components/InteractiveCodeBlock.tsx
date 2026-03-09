"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { OutputPanel } from "@/components/OutputPanel";
import { API_BASE_URL } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type InteractiveCodeBlockProps = {
  initialCode: string;
};

export function InteractiveCodeBlock({ initialCode }: InteractiveCodeBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  async function runCode() {
    setIsRunning(true);
    try {
      const response = await fetch(`${API_BASE_URL}/run-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Execution request failed");
      }

      const data = (await response.json()) as { output: string };
      setOutput(data.output);
    } catch {
      setOutput("Failed to execute code.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <MonacoEditor
        height="260px"
        defaultLanguage="python"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
      <button
        type="button"
        onClick={runCode}
        disabled={isRunning}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRunning ? "Running..." : "Run"}
      </button>
      <OutputPanel output={output} isRunning={isRunning} />
    </section>
  );
}
