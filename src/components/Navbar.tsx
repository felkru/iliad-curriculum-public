import Link from "next/link";
import { IliadMark } from "./IliadMark";
import { NavDrawer } from "./NavDrawer";
import { listIndex } from "@/lib/content";

export async function Navbar() {
  const items = await listIndex();
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-[var(--background)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-4 sm:px-6 font-sans text-sm">
        <NavDrawer modules={items} />
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-zinc-700 hover:text-black"
        >
          <IliadMark size={18} className="text-black" />
          <span className="hidden font-medium sm:inline">Iliad Intensive Curriculum</span>
          <span className="font-medium sm:hidden">Iliad</span>
        </Link>
      </div>
    </header>
  );
}
