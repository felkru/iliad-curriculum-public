import { readFile } from "node:fs/promises";
import path from "node:path";
import { MdxBody } from "@/lib/mdx";

export const dynamic = "force-dynamic";

const ABOUT_FILE = path.join(process.cwd(), "content", "about.mdx");

async function readAbout(): Promise<string | null> {
  try {
    const raw = await readFile(ABOUT_FILE, "utf8");
    const m = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    return m ? m[1] : raw;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const body = await readAbout();

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 py-12">
      <header className="mb-8 border-b border-zinc-200 pb-4">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          About
        </p>
        <h1
          className="mt-2 font-serif text-[2.4rem] leading-[1.1] tracking-tight"
          style={{ fontWeight: 600 }}
        >
          The Iliad Intensive
        </h1>
      </header>
      {body ? (
        <article className="prose">
          <MdxBody source={body} />
        </article>
      ) : (
        <p className="font-serif text-[1.05rem] leading-relaxed text-zinc-700">
          The overview is being imported from the public-release Google Doc.
          In the meantime, see the{" "}
          <a className="underline" href="/">
            module index
          </a>{" "}
          for course content.
        </p>
      )}
    </main>
  );
}
