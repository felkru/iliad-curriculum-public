import Link from "next/link";
import { IliadMark } from "./IliadMark";
import { listIndex } from "@/lib/content";

function shortLabel(slug: string): string {
  // 0-prerequisites -> "0", a-1-ai-alignment -> "A.1"
  const m = slug.match(/^([0-9]+|[a-z])(?:-([0-9]+))?-/);
  if (!m) return slug;
  return m[2] ? `${m[1].toUpperCase()}.${m[2]}` : m[1].toUpperCase();
}

export async function Navbar() {
  const items = await listIndex();
  const ordered = [...items].sort(
    (a, b) =>
      (a.position ?? Number.POSITIVE_INFINITY) -
        (b.position ?? Number.POSITIVE_INFINITY) ||
      a.slug.localeCompare(b.slug),
  );
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-[var(--background)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-5 px-6 font-sans text-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-zinc-700 hover:text-black"
        >
          <IliadMark size={18} className="text-black" />
          <span className="hidden font-medium sm:inline">Iliad Intensive Curriculum</span>
          <span className="font-medium sm:hidden">Iliad</span>
        </Link>
        {ordered.length > 0 && (
          <nav
            aria-label="Modules"
            className="flex flex-1 items-center gap-1 overflow-x-auto text-zinc-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {ordered.map((m) => (
              <Link
                key={m.slug}
                href={`/modules/${m.slug}`}
                title={m.title}
                className="shrink-0 rounded px-2 py-1 text-xs uppercase tracking-wide text-zinc-600 hover:bg-zinc-100 hover:text-black"
              >
                {shortLabel(m.slug)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
