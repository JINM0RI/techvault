import { DocumentationManager } from "@/components/DocumentationManager";
import { getCategories } from "@/lib/api";

export default async function DocumentationPage() {
  const categories = await getCategories();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">TECHVAULT Documentation</h1>
        <p className="mt-2 text-slate-600">Create categories, then organize notes and topics.</p>
      </header>
      <DocumentationManager categories={categories} />
    </section>
  );
}
