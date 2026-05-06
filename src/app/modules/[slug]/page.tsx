import { notFound } from "next/navigation";
import { readModuleMdx, listModuleSources } from "@/lib/content";
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
  const sources = await listModuleSources(slug);
  return (
    <article className="mx-auto max-w-3xl px-6 py-10 prose">
      <header className="not-prose mb-6">
        <h1 className="text-3xl font-semibold">{fm.title ?? slug}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
          {fm.cluster && <span className="rounded bg-zinc-200 px-2 py-0.5">cluster {fm.cluster}</span>}
          {fm.difficulty && <span className="rounded bg-zinc-200 px-2 py-0.5">difficulty {fm.difficulty}/5</span>}
          {fm.importance && <span className="rounded bg-zinc-200 px-2 py-0.5">importance {fm.importance}/5</span>}
          {fm.timeMinutes && <span className="rounded bg-zinc-200 px-2 py-0.5">~{fm.timeMinutes} min</span>}
        </div>
        {fm.summary && <p className="mt-3 text-zinc-700">{fm.summary}</p>}
        <div className="mt-3 flex gap-3 text-sm">
          <a
            href={`/api/download/${slug}`}
            className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-50"
          >
            Download .md
          </a>
        </div>
      </header>
      {sources.length > 0 && (
        <section className="not-prose mb-6 rounded-md border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold mb-2">Original sources</h2>
          <ul className="text-sm space-y-1">
            {sources.map((f) => (
              <li key={f}>
                <a
                  href={`/uploads/${slug}/${encodeURIComponent(f)}`}
                  className="text-sky-700 hover:underline"
                >
                  {f}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <MdxBody source={mod.body} />
    </article>
  );
}
