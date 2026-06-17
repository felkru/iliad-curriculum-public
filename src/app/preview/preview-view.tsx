import { listIndex } from "@/lib/content";
import { listClusters } from "@/lib/cluster-store";
import { readPreview, latestPreviewSlug, previewVersionToken } from "@/lib/preview";
import { MdxBody } from "@/lib/mdx";
import { ModulePageShell } from "@/components/ModulePageShell";
import { SidebarNav } from "@/components/SidebarNav";
import { InlineMd } from "@/components/InlineMd";
import { PreviewReloader } from "./preview-reloader";

function Banner({ label }: { label: string }) {
  return (
    <div className="not-prose mb-4 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
      <span className="font-semibold uppercase tracking-wide">Preview</span>
      <span>{label} — draft, not published. Updates automatically when you save.</span>
    </div>
  );
}

/**
 * Renders a draft preview in the real public layout. Shared by /preview/[slug]
 * and /preview/latest. Always dynamic — reads the draft MDX from disk live.
 */
export async function PreviewView({ routeSlug }: { routeSlug: string }) {
  const actualSlug = routeSlug === "latest" ? await latestPreviewSlug() : routeSlug;
  const [modules, clusterList, token] = await Promise.all([
    listIndex(),
    listClusters(),
    previewVersionToken(routeSlug),
  ]);
  const mod = actualSlug ? await readPreview(actualSlug) : null;

  if (!mod || !actualSlug) {
    return (
      <ModulePageShell sidebar={<SidebarNav modules={modules} activeSlug="" clusters={clusterList} />}>
        <Banner label={routeSlug === "latest" ? "latest" : routeSlug} />
        <p className="mt-10 text-zinc-500">
          No preview yet — open a draft in the editor and Save (or click Preview) to generate one.
        </p>
        <PreviewReloader routeSlug={routeSlug} initialToken={token} />
      </ModulePageShell>
    );
  }

  const fm = mod.frontmatter;
  return (
    <ModulePageShell sidebar={<SidebarNav modules={modules} activeSlug={actualSlug} clusters={clusterList} />}>
      <Banner label={actualSlug} />
      <article>
        <header className="not-prose mb-6 border-b border-zinc-200 pb-4">
          <h1 className="font-serif text-[2.1rem] leading-[1.15] tracking-tight" style={{ fontWeight: 600 }}>
            {fm.title ?? actualSlug}
          </h1>
          <div className="font-sans mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-zinc-500">
            {fm.cluster && <span>Cluster {fm.cluster}</span>}
          </div>
          {fm.summary && (
            <p className="mt-5 font-serif text-[1.08rem] italic leading-relaxed text-zinc-700">{fm.summary}</p>
          )}
          {fm.contributors && fm.contributors.length > 0 && (
            <p className="mt-3 font-sans text-sm text-zinc-600">
              <span className="text-zinc-500">By </span>
              {fm.contributors.join(", ")}
            </p>
          )}
          {fm.learningOutcomes && fm.learningOutcomes.length > 0 && (
            <section className="mt-6 rounded border border-zinc-200 bg-white/60 p-4">
              <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-zinc-500">What you&rsquo;ll learn</h2>
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
      <PreviewReloader routeSlug={routeSlug} initialToken={token} />
    </ModulePageShell>
  );
}
