"use client";

import Link from "next/link";
import { useNav } from "./NavContext";
import type { IndexEntry } from "@/lib/content";

const CLUSTER_LABEL: Record<string, string> = {
  "0": "Foundations",
  A: "A — Theory of Deep Learning",
  B: "B — Interpretability",
  C: "C — Agency",
  D: "D — Safety: Protocols and Guarantees",
  E: "E — Safety Guarantees and their Limits",
};
const CLUSTER_ORDER = ["0", "A", "B", "C", "D", "E", "Other"];

export function SidebarNav({
  modules,
  activeSlug,
}: {
  modules: IndexEntry[];
  activeSlug?: string;
}) {
  const { open, setOpen } = useNav();
  if (!open) return null;

  const byCluster = new Map<string, IndexEntry[]>();
  for (const m of modules) {
    const k = m.cluster ?? "Other";
    if (!byCluster.has(k)) byCluster.set(k, []);
    byCluster.get(k)!.push(m);
  }
  for (const list of byCluster.values()) {
    list.sort(
      (a, b) =>
        (a.position ?? Number.POSITIVE_INFINITY) -
          (b.position ?? Number.POSITIVE_INFINITY) ||
        a.slug.localeCompare(b.slug),
    );
  }
  const orderedClusters = CLUSTER_ORDER.filter((c) => byCluster.has(c)).concat(
    [...byCluster.keys()].filter((c) => !CLUSTER_ORDER.includes(c)),
  );

  return (
    <nav
      aria-label="Modules"
      className="w-full max-w-xs shrink-0 self-start sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-4"
    >
      <div className="space-y-5 font-sans text-sm">
        {orderedClusters.map((cluster) => (
          <section key={cluster}>
            <h3 className="mb-2 text-[0.68rem] uppercase tracking-[0.15em] text-zinc-500">
              {CLUSTER_LABEL[cluster] ?? `Cluster ${cluster}`}
            </h3>
            <ul className="space-y-1">
              {byCluster.get(cluster)!.map((p) => {
                const active = p.slug === activeSlug;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/modules/${p.slug}`}
                      onClick={() => {
                        // close on mobile after navigation
                        if (window.matchMedia("(max-width: 1023px)").matches)
                          setOpen(false);
                      }}
                      className={
                        "block rounded px-2 py-1 leading-snug " +
                        (active
                          ? "bg-zinc-200 text-black font-medium"
                          : "text-zinc-700 hover:bg-zinc-100 hover:text-black")
                      }
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
