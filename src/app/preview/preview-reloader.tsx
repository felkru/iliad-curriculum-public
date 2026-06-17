"use client";

import { useEffect } from "react";

/**
 * Polls the preview version token every ~1.5s and reloads the page when it
 * changes — so saving a draft (or switching which draft is newest, for
 * /preview/latest) refreshes the preview automatically.
 */
export function PreviewReloader({
  routeSlug,
  initialToken,
}: {
  routeSlug: string;
  initialToken: string;
}) {
  useEffect(() => {
    let stopped = false;
    const id = setInterval(async () => {
      try {
        const r = await fetch(
          `/preview/version?slug=${encodeURIComponent(routeSlug)}`,
          { cache: "no-store" },
        );
        if (!r.ok) return;
        const j = (await r.json()) as { token?: string };
        if (!stopped && j.token && j.token !== initialToken) location.reload();
      } catch {
        /* transient — keep polling */
      }
    }, 1500);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [routeSlug, initialToken]);
  return null;
}
