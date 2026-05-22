import { notFound } from "next/navigation";
import { readModuleMdx } from "@/lib/content";
import { MdxBody } from "@/lib/mdx";
import { ModuleSidebar } from "@/components/ModuleSidebar";
import { InlineMd } from "@/components/InlineMd";

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
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
      <ModuleSidebar activeSlug={slug} />
      <article className="min-w-0 flex-1" style={{ maxWidth: 720 }}>
        <header className="not-prose mb-6 border-b border-zinc-200 pb-4">
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
            <a
              href={`/api/download/${slug}`}
              className="ml-3 rounded border border-zinc-300 bg-white px-2.5 py-[3px] text-[0.7rem] normal-case tracking-normal text-zinc-700 hover:bg-zinc-50"
            >
              Download .md
            </a>
          </div>
          {fm.summary && (
            <p className="mt-5 font-serif text-[1.08rem] italic leading-relaxed text-zinc-700">
              {fm.summary}
            </p>
          )}
          {fm.contributors && fm.contributors.length > 0 && (
            <p className="mt-3 font-sans text-sm text-zinc-600">
              <span className="text-zinc-500">By </span>
              {fm.contributors.join(", ")}
            </p>
          )}
          {fm.learningOutcomes && fm.learningOutcomes.length > 0 && (
            <section className="mt-6 rounded border border-zinc-200 bg-white/60 p-4">
              <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-zinc-500">
                What you&rsquo;ll learn
              </h2>
              <ul className="mt-2 list-disc pl-5 font-serif text-[1rem] leading-relaxed text-zinc-800 space-y-1">
                {fm.learningOutcomes.map((o, i) => (
                  <li key={i}>
                    <InlineMd text={o} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </header>
        <div className="prose">
          <MdxBody source={mod.body} />
        </div>
      </article>
    </div>
  );
}
