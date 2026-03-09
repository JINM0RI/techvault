import { CategoryGrid } from "@/components/CategoryGrid";
import { getCategories } from "@/lib/api";

export default async function DocumentationPage() {
  const categories = await getCategories();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Documentation</h1>
        <p className="mt-2 text-slate-600">Start with a category, then drill down by technology and topic.</p>
      </header>
      <CategoryGrid categories={categories} />
    </section>
  );
}
