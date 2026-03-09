import Link from "next/link";

import { getCheatSheets } from "@/lib/api";

export default async function CheatSheetsPage() {
  const cheatSheets = await getCheatSheets();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cheat Sheets</h1>
        <p className="mt-2 text-slate-600">Quick markdown-only reference notes.</p>
      </header>

      {!cheatSheets.length ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
          No cheat sheets found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cheatSheets.map((sheet) => (
            <Link
              key={sheet.slug}
              href={`/cheatsheets/${sheet.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-600"
            >
              <h3 className="text-lg font-semibold text-slate-900">{sheet.title}</h3>
              <p className="mt-1 text-sm text-slate-600">Open cheat sheet</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
