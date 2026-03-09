import Link from "next/link";

type TechnologyGridProps = {
  category: string;
  technologies: string[];
};

export function TechnologyGrid({ category, technologies }: TechnologyGridProps) {
  if (!technologies.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        No technologies found for this category.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {technologies.map((technology) => (
        <Link
          key={technology}
          href={`/documentation/${encodeURIComponent(category)}/${encodeURIComponent(technology)}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-600"
        >
          <h3 className="text-lg font-semibold capitalize text-slate-900">{technology}</h3>
          <p className="mt-1 text-sm text-slate-600">Open topics</p>
        </Link>
      ))}
    </div>
  );
}
