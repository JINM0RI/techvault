"use client";

import { FormEvent, useMemo, useState } from "react";

import { CategoryGrid } from "@/components/CategoryGrid";
import { createCategory } from "@/lib/api";
import { Category } from "@/lib/types";

type DocumentationManagerProps = {
  categories: Category[];
};

export function DocumentationManager({ categories }: DocumentationManagerProps) {
  const [list, setList] = useState<Category[]>(categories);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sorted = useMemo(
    () => [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [list],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const created = await createCategory({ name });
      setList((prev) => [created, ...prev]);
      setName("");
      setShowModal(false);
      setStatus("Category created.");
    } catch {
      setStatus("Failed to create category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add Category
        </button>
      </div>

      {status ? <p className="text-sm text-slate-600">{status}</p> : null}

      <CategoryGrid categories={sorted} />

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-900">Add Category</h2>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700">Category Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="Machine Learning"
                  required
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-slate-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
