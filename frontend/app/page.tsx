import Link from "next/link";

export default function HomePage() {
  return (
    <section className="animate-float-in">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          Personal Knowledge Documentation
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          TECHVAULT
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          Build interactive learning docs directly in the app using rich-text explanation
          blocks and runnable code blocks.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/documentation"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-teal-600 hover:bg-white"
          >
            <h2 className="text-xl font-semibold text-slate-900">Documentation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Browse categories, technologies, and topic notebooks.
            </p>
          </Link>
          <Link
            href="/cheatsheets"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-teal-600 hover:bg-white"
          >
            <h2 className="text-xl font-semibold text-slate-900">Cheat Sheets</h2>
            <p className="mt-2 text-sm text-slate-600">
              Quick markdown references for everyday commands and syntax.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
