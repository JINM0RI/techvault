type OutputPanelProps = {
  output: string;
  isRunning?: boolean;
};

export function OutputPanel({ output, isRunning = false }: OutputPanelProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-950 p-3 text-sm text-slate-50">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-slate-300">Output</div>
      <pre className="min-h-10 whitespace-pre-wrap break-words text-slate-100">
        {isRunning ? "Running..." : output || "No output yet."}
      </pre>
    </div>
  );
}
