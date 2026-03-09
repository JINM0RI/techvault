import Link from "next/link";

import { TechnologyGrid } from "@/components/TechnologyGrid";
import { getTechnologies } from "@/lib/api";

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  const technologies = await getTechnologies(category);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/documentation" className="text-sm text-teal-700 hover:underline">
          Back to categories
        </Link>
        <h1 className="text-3xl font-bold capitalize tracking-tight text-slate-900">{category}</h1>
      </div>
      <TechnologyGrid category={category} technologies={technologies} />
    </section>
  );
}
