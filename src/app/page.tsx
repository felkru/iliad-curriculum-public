import Link from "next/link";
import { listIndex } from "@/lib/content";

export default async function Home() {
  const items = await listIndex();
  const byCluster = new Map<string, typeof items>();
  for (const p of items) {
    const k = p.cluster ?? "Other";
    if (!byCluster.has(k)) byCluster.set(k, []);
    byCluster.get(k)!.push(p);
  }
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Iliad Intensive Curriculum</h1>
      <p className="mt-2 text-zinc-600">
        April 2026 cohort — AI Safety theory of deep learning, agency, alignment.
      </p>
      {items.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500">No public modules yet.</p>
      ) : (
        <div className="mt-10 space-y-8">
          {[...byCluster.entries()].map(([cluster, list]) => (
            <section key={cluster}>
              <h2 className="text-lg font-medium mb-3">Cluster {cluster}</h2>
              <ul className="divide-y divide-zinc-200 rounded border border-zinc-200 bg-white">
                {list.map((p) => (
                  <li key={p.slug} className="px-4 py-3">
                    <Link href={`/modules/${p.slug}`} className="font-medium">
                      {p.title}
                    </Link>
                    {p.frontmatter?.summary && (
                      <p className="text-sm text-zinc-600">{p.frontmatter.summary}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
