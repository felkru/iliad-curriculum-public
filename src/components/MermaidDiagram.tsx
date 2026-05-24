"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void;
      render: (id: string, code: string) => Promise<{ svg: string }>;
    };
  }
}

/**
 * Lazy-loads mermaid.js from the CDN on the client and renders the given
 * chart. Falls back to a monospaced code block if mermaid fails (or if
 * JavaScript is disabled).
 */
export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!window.mermaid) {
          const mod = (await import("mermaid")).default as unknown as Window["mermaid"];
          window.mermaid = mod;
          mod!.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "strict",
          });
        }
        const m = window.mermaid!;
        const id = "m" + Math.random().toString(36).slice(2);
        const { svg } = await m.render(id, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre className="overflow-x-auto rounded border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700">
        {chart}
      </pre>
    );
  }
  return <div ref={ref} className="mermaid-host" />;
}
