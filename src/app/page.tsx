import Link from "next/link";
import { listIndex } from "@/lib/content";

export const dynamic = "force-dynamic";

const CLUSTER_LABEL: Record<string, string> = {
  "0": "Foundations",
  A: "Cluster A — Theory of Deep Learning",
  B: "Cluster B — Interpretability",
  C: "Cluster C — Agency",
  D: "Cluster D — Safety: Protocols and Guarantees",
  E: "Cluster E — Safety Guarantees and their Limits",
};

const CLUSTER_ORDER = ["0", "A", "B", "C", "D", "E", "Other"];

function sortedItems<T extends { slug: string; cluster: string | null; position?: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      (a.position ?? Number.POSITIVE_INFINITY) -
        (b.position ?? Number.POSITIVE_INFINITY) ||
      a.slug.localeCompare(b.slug),
  );
}

export default async function Home() {
  const items = await listIndex();
  const byCluster = new Map<string, typeof items>();
  for (const p of items) {
    const k = p.cluster ?? "Other";
    if (!byCluster.has(k)) byCluster.set(k, []);
    byCluster.get(k)!.push(p);
  }
  const orderedClusters = CLUSTER_ORDER.filter((c) => byCluster.has(c)).concat(
    [...byCluster.keys()].filter((c) => !CLUSTER_ORDER.includes(c)),
  );
  return (
    <main className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <header className="mb-14 border-b border-zinc-200 pb-8">
        <h1
          className="font-serif tracking-tight leading-[1.1] text-[2.5rem]"
          style={{ fontWeight: 600 }}
        >
          Iliad Intensive Curriculum
        </h1>
        <p className="mt-4 font-serif italic text-[1.05rem] text-zinc-700 leading-relaxed">
          April 2026 cohort — AI Safety theory of deep learning, agency, alignment.
        </p>
      </header>
      {items.length === 0 ? (
        <p className="font-serif text-zinc-500">No public modules yet.</p>
      ) : (
        <div className="space-y-12">
          {orderedClusters.map((cluster) => (
            <section key={cluster}>
              <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-zinc-500 mb-4">
                {CLUSTER_LABEL[cluster] ?? `Cluster ${cluster}`}
              </h2>
              <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
                {sortedItems(byCluster.get(cluster)!).map((p) => (
                  <li key={p.slug} className="py-4">
                    <Link
                      href={`/modules/${p.slug}`}
                      className="block font-serif text-[1.25rem] leading-snug hover:text-[var(--link)]"
                      style={{ fontWeight: 500 }}
                    >
                      {p.title}
                    </Link>
                    {p.frontmatter?.summary && (
                      <p className="mt-1 font-serif text-[1rem] text-zinc-600 leading-relaxed">
                        {p.frontmatter.summary}
                      </p>
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
