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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Iliad Intensive Curriculum</h1>
      <p className="mt-2 text-zinc-600">
        April 2026 cohort — AI Safety theory of deep learning, agency, alignment.
      </p>
      {items.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500">No public modules yet.</p>
      ) : (
        <div className="mt-10 space-y-8">
          {orderedClusters.map((cluster) => (
            <section key={cluster}>
              <h2 className="text-lg font-medium mb-3">
                {CLUSTER_LABEL[cluster] ?? `Cluster ${cluster}`}
              </h2>
              <ul className="divide-y divide-zinc-200 rounded border border-zinc-200 bg-white">
                {sortedItems(byCluster.get(cluster)!).map((p) => (
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
