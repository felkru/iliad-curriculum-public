"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export function NavDrawer({ modules }: { modules: IndexEntry[] }) {
  const [open, setOpen] = useState(false);

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

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
    <>
      <button
        type="button"
        aria-label="Open modules menu"
        aria-expanded={open}
        aria-controls="nav-drawer"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 rounded p-1.5 text-zinc-700 hover:bg-zinc-100"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
        >
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {/* Scrim */}
      <div
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 top-12 z-20 bg-black/30 transition-opacity " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        id="nav-drawer"
        className={
          "fixed left-0 top-12 z-30 h-[calc(100vh-3rem)] w-full max-w-xs overflow-y-auto " +
          "border-r border-zinc-200 bg-[var(--background)] shadow-lg transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
        aria-hidden={!open}
      >
        <nav className="space-y-5 px-5 py-6 font-sans text-sm">
          {orderedClusters.length === 0 ? (
            <p className="text-zinc-500">No public modules yet.</p>
          ) : (
            orderedClusters.map((cluster) => (
              <section key={cluster}>
                <h3 className="mb-2 text-[0.68rem] uppercase tracking-[0.15em] text-zinc-500">
                  {CLUSTER_LABEL[cluster] ?? `Cluster ${cluster}`}
                </h3>
                <ul className="space-y-1">
                  {byCluster.get(cluster)!.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/modules/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="block rounded px-2 py-1 leading-snug text-zinc-700 hover:bg-zinc-100 hover:text-black"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
