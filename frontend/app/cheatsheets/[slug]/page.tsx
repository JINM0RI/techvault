import Link from "next/link";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getCheatSheet } from "@/lib/api";

type CheatSheetDetailProps = {
  params: {
    slug: string;
  };
};

export default async function CheatSheetDetailPage({ params }: CheatSheetDetailProps) {
  const sheet = await getCheatSheet(params.slug);

  return (
    <section className="space-y-4">
      <Link href="/cheatsheets" className="text-sm text-teal-700 hover:underline">
        Back to cheat sheets
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{sheet.title}</h1>
      <MarkdownRenderer content={sheet.content} />
    </section>
  );
}
