"use client";

import { FormEvent, useState } from "react";

import { API_BASE_URL } from "@/lib/api";

export default function UploadPage() {
  const [category, setCategory] = useState("tech");
  const [technology, setTechnology] = useState("python");
  const [topicTitle, setTopicTitle] = useState("Python Lists");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setStatus("Please select a notebook file.");
      return;
    }

    setLoading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("category", category);
    formData.append("technology", technology);
    formData.append("topic_title", topicTitle);
    formData.append("notebook_file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { id?: number; detail?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setStatus(`Uploaded successfully. Topic ID: ${data.id}`);
      setFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Notebook</h1>
      <p className="mt-2 text-slate-600">
        Add topic metadata and upload an <code>.ipynb</code> file.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Technology</span>
          <input
            value={technology}
            onChange={(event) => setTechnology(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Topic Title</span>
          <input
            value={topicTitle}
            onChange={(event) => setTopicTitle(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Notebook File (.ipynb)</span>
          <input
            type="file"
            accept=".ipynb"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-700"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Uploading..." : "Upload Notebook"}
        </button>
      </form>

      {status ? (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {status}
        </p>
      ) : null}
    </section>
  );
}
