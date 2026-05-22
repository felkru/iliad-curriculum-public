import { notFound } from "next/navigation";
import { readModuleMdx } from "@/lib/content";
import { MdxBody } from "@/lib/mdx";

// Read MDX from disk at request time so the exporter's git push picks up
// new content immediately without rebuild.
export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = await readModuleMdx(slug);
  if (!mod) notFound();
  const fm = mod.frontmatter;
  return (
    <article className="mx-auto px-6 py-14" style={{ maxWidth: 720 }}>
      <header className="not-prose mb-10 border-b border-zinc-200 pb-6">
        <h1
          className="font-serif text-[2.1rem] leading-[1.15] tracking-tight"
          style={{ fontWeight: 600 }}
        >
          {fm.title ?? slug}
        </h1>
        <div className="font-sans mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-zinc-500">
          {fm.cluster && <span>Cluster {fm.cluster}</span>}
          {fm.cluster && (fm.difficulty || fm.importance || fm.timeMinutes) ? <span>·</span> : null}
          {fm.difficulty && <span>Difficulty {fm.difficulty}/5</span>}
          {fm.difficulty && (fm.importance || fm.timeMinutes) ? <span>·</span> : null}
          {fm.importance && <span>Importance {fm.importance}/5</span>}
          {fm.importance && fm.timeMinutes ? <span>·</span> : null}
          {fm.timeMinutes && <span>~{fm.timeMinutes} min</span>}
        </div>
        {fm.summary && (
          <p className="mt-5 font-serif text-[1.08rem] italic leading-relaxed text-zinc-700">
            {fm.summary}
          </p>
        )}
        <div className="font-sans mt-5 flex gap-3 text-sm">
          <a
            href={`/api/download/${slug}`}
            className="rounded border border-zinc-300 bg-white px-3 py-1 text-zinc-700 hover:bg-zinc-50"
          >
            Download .md
          </a>
        </div>
      </header>
      <div className="prose mx-auto">
        <MdxBody source={mod.body} />
      </div>
    </article>
  );
}
