import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { Frontmatter } from "./content";

// Draft previews live OUTSIDE the repo (never committed/pushed) — the admin
// writes <slug>.mdx here on save; these routes render them live.
const PREVIEW_DIR = process.env.ILIAD_PREVIEW_DIR ?? "/var/iliad/previews";

export async function readPreview(
  slug: string,
): Promise<{ frontmatter: Frontmatter; body: string } | null> {
  try {
    const raw = await readFile(path.join(PREVIEW_DIR, `${slug}.mdx`), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) return { frontmatter: {}, body: raw };
    return { frontmatter: (YAML.parse(m[1]) as Frontmatter | null) ?? {}, body: m[2] };
  } catch {
    return null;
  }
}

/** Slug of the most-recently-written preview (for /preview/latest). */
export async function latestPreviewSlug(): Promise<string | null> {
  try {
    const files = (await readdir(PREVIEW_DIR)).filter((f) => f.endsWith(".mdx"));
    let best: string | null = null;
    let bestT = -1;
    for (const f of files) {
      const s = await stat(path.join(PREVIEW_DIR, f));
      if (s.mtimeMs > bestT) {
        bestT = s.mtimeMs;
        best = f.replace(/\.mdx$/, "");
      }
    }
    return best;
  } catch {
    return null;
  }
}

/**
 * Version token the auto-reload poller compares. For a specific slug it's the
 * file mtime; for "latest" it's `<slug>:<mtime>` so switching to a newer draft
 * (or editing the current one) both change the token → the page reloads.
 */
export async function previewVersionToken(routeSlug: string): Promise<string> {
  if (routeSlug === "latest") {
    const slug = await latestPreviewSlug();
    if (!slug) return "none";
    return `${slug}:${await mtime(slug)}`;
  }
  return await mtime(routeSlug);
}

async function mtime(slug: string): Promise<string> {
  try {
    const s = await stat(path.join(PREVIEW_DIR, `${slug}.mdx`));
    return String(Math.floor(s.mtimeMs));
  } catch {
    return "0";
  }
}
