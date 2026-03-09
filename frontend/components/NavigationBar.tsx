import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/documentation", label: "Documentation" },
  { href: "/cheatsheets", label: "Cheat Sheets" },
];

export function NavigationBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          TECHVAULT
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
