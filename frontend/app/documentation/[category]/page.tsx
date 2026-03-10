import Link from "next/link";
import { notFound } from "next/navigation";

import { NotesListManager } from "@/components/NotesListManager";
import { getCategory, getNotes } from "@/lib/api";

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryId = Number(params.category);
  if (Number.isNaN(categoryId)) {
    notFound();
  }

  const [category, notes] = await Promise.all([
    getCategory(categoryId),
    getNotes(categoryId),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link href="/documentation" className="text-sm text-teal-700 hover:underline">
          Back to categories
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Category: {category.name}</h1>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Notes</h2>
        <NotesListManager categoryId={category.id} notes={notes} />
      </div>
    </section>
  );
}
