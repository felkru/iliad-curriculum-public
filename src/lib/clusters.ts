/**
 * Cluster -> URL slug map. Mirrors the admin's src/lib/clusters.ts —
 * keep in sync.
 */
export const CLUSTER_URL_SLUG: Record<string, string> = {
  "0": "foundations",
  A: "alignment",
  B: "learning",
  C: "interpretability",
  D: "agency",
  E: "safety",
};

export const CLUSTER_LABEL: Record<string, string> = {
  "0": "Foundations",
  A: "Cluster A — Alignment",
  B: "Cluster B — Learning",
  C: "Cluster C — Abstractions, Representations, and Interpretability",
  D: "Cluster D — Agency",
  E: "Cluster E — Safety Guarantees and their Limits",
};

export const CLUSTERS_IN_ORDER = ["0", "A", "B", "C", "D", "E"] as const;

export function clusterUrlSlug(cluster: string | null | undefined): string {
  if (!cluster) return "page";
  return CLUSTER_URL_SLUG[cluster] ?? cluster.toLowerCase();
}

/** URL slug -> cluster letter (the reverse map). */
export const URL_SLUG_TO_CLUSTER: Record<string, string> = Object.fromEntries(
  Object.entries(CLUSTER_URL_SLUG).map(([k, v]) => [v, k]),
);

export function pagePath(cluster: string | null | undefined, slug: string): string {
  return `/${clusterUrlSlug(cluster)}/${slug}`;
}
