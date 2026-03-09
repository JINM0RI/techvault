import Link from "next/link";

type CategoryGridProps = {
  categories: string[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        No documentation topics yet. Use Upload to add your first notebook.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/documentation/${encodeURIComponent(category)}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-600"
        >
          <h3 className="text-lg font-semibold capitalize text-slate-900">{category}</h3>
          <p className="mt-1 text-sm text-slate-600">Browse technologies</p>
        </Link>
      ))}
    </div>
  );
}
