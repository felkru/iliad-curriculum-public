/**
 * Public-site cluster handling. Built-in defaults match the admin's
 * src/lib/clusters.ts. At request time we try to load the editable list
 * shipped by the exporter at `content/clusters.json` — falling back to
 * defaults if it's missing.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Cluster = {
  id: string;
  label: string;
  urlSlug: string;
  position: number;
};

export const DEFAULT_CLUSTERS: Cluster[] = [
  { id: "0", label: "Foundations", urlSlug: "foundations", position: 0 },
  { id: "A", label: "Cluster A — Alignment", urlSlug: "alignment", position: 10 },
  { id: "B", label: "Cluster B — Learning", urlSlug: "learning", position: 20 },
  { id: "C", label: "Cluster C — Abstractions, Representations, and Interpretability", urlSlug: "interpretability", position: 30 },
  { id: "D", label: "Cluster D — Agency", urlSlug: "agency", position: 40 },
  { id: "E", label: "Cluster E — Safety Guarantees and their Limits", urlSlug: "safety", position: 50 },
];

const CLUSTERS_FILE = path.join(process.cwd(), "content", "clusters.json");

export async function listClusters(): Promise<Cluster[]> {
  try {
    const raw = await readFile(CLUSTERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Cluster[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* fall through */
  }
  return DEFAULT_CLUSTERS;
}

export function clusterUrlSlug(
  cluster: string | null | undefined,
  list: Cluster[] = DEFAULT_CLUSTERS,
): string {
  if (!cluster) return "page";
  return list.find((c) => c.id === cluster)?.urlSlug ?? cluster.toLowerCase();
}

export function urlSlugToCluster(
  slug: string,
  list: Cluster[] = DEFAULT_CLUSTERS,
): string | undefined {
  return list.find((c) => c.urlSlug === slug)?.id;
}

export function pagePath(
  cluster: string | null | undefined,
  slug: string,
  list: Cluster[] = DEFAULT_CLUSTERS,
): string {
  return `/${clusterUrlSlug(cluster, list)}/${slug}`;
}

export function clusterLabel(
  cluster: string | null | undefined,
  list: Cluster[] = DEFAULT_CLUSTERS,
): string {
  if (!cluster) return "Other";
  return list.find((c) => c.id === cluster)?.label ?? `Cluster ${cluster}`;
}
