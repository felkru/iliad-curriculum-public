import { notFound, redirect, permanentRedirect } from "next/navigation";
import { listIndex, readModuleMdx, readRedirect } from "@/lib/content";
import { clusterUrlSlug, urlSlugToCluster } from "@/lib/clusters";
import { listClusters } from "@/lib/cluster-store";
import { MdxBody } from "@/lib/mdx";
import { ModulePageShell } from "@/components/ModulePageShell";
import { SidebarNav } from "@/components/SidebarNav";
import { InlineMd } from "@/components/InlineMd";

export const dynamic = "force-dynamic";

// Reserved top-level routes that shouldn't be treated as cluster slugs.
const RESERVED = new Set([
  "about",
  "api",
  "pipeline",
  "modules",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export default async function ModulePage({
  params,
}: {
  params: Promise<{ cluster: string; slug: string }>;
}) {
  const { cluster: clusterParam, slug } = await params;
  if (RESERVED.has(clusterParam)) notFound();

  const [mod, modules, clusterList] = await Promise.all([
    readModuleMdx(slug),
    listIndex(),
    listClusters(),
  ]);
  const expected = urlSlugToCluster(clusterParam, clusterList);

  if (mod) {
    const actualCluster = mod.frontmatter.cluster ?? null;
    const actualClusterSlug = clusterUrlSlug(actualCluster, clusterList);
    if (actualClusterSlug !== clusterParam) {
      permanentRedirect(`/${actualClusterSlug}/${slug}`);
    }
  } else {
    const r = await readRedirect(slug);
    if (r) {
      const target = r.cluster
        ? `/${clusterUrlSlug(r.cluster, clusterList)}/${r.to}`
        : `/${clusterParam}/${r.to}`;
      if (r.permanent) permanentRedirect(target);
      redirect(target);
    }
    notFound();
  }
  if (!expected) {
    permanentRedirect(`/${clusterUrlSlug(mod.frontmatter.cluster, clusterList)}/${slug}`);
  }

  const fm = mod.frontmatter;

  return (
    <ModulePageShell sidebar={<SidebarNav modules={modules} activeSlug={slug} clusters={clusterList} />}>
      <article>
        <header className="not-prose mb-6 border-b border-zinc-200 pb-4">
          <h1
            className="font-serif text-[2.1rem] leading-[1.15] tracking-tight"
            style={{ fontWeight: 600 }}
          >
            {fm.title ?? slug}
          </h1>
          <div className="font-sans mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-zinc-500">
            {fm.cluster && <span>Cluster {fm.cluster}</span>}
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
    </ModulePageShell>
  );
}
