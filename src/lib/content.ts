import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type Frontmatter = {
  title?: string;
  cluster?: string;
  difficulty?: number;
  importance?: number;
  timeMinutes?: number;
  contributors?: string[];
  summary?: string;
};

export type IndexEntry = {
  slug: string;
  title: string;
  cluster: string | null;
  frontmatter: Frontmatter;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "modules");
const INDEX_FILE = path.join(process.cwd(), "content", "index.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function listModuleSources(slug: string): Promise<string[]> {
  try {
    const files = await readdir(path.join(UPLOADS_DIR, slug));
    return files.filter((f) => !f.startsWith(".")).sort();
  } catch {
    return [];
  }
}

export async function listIndex(): Promise<IndexEntry[]> {
  try {
    const raw = await readFile(INDEX_FILE, "utf8");
    return JSON.parse(raw) as IndexEntry[];
  } catch {
    return [];
  }
}

export async function listSlugs(): Promise<string[]> {
  try {
    const files = await readdir(CONTENT_DIR);
    return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export async function readModuleMdx(slug: string): Promise<{
  raw: string;
  frontmatter: Frontmatter;
  body: string;
} | null> {
  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) return { raw, frontmatter: {}, body: raw };
    const yaml = m[1];
    const body = m[2];
    const fm: Frontmatter = {};
    for (const line of yaml.split("\n")) {
      const match = line.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (!match) continue;
      const key = match[1] as keyof Frontmatter;
      let val: unknown = match[2].trim();
      if (typeof val === "string") {
        if (/^\d+$/.test(val)) val = parseInt(val, 10);
        else if (val.startsWith("[") && val.endsWith("]")) {
          val = val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        } else val = val.replace(/^["']|["']$/g, "");
      }
      // @ts-expect-error narrow assignment
      fm[key] = val;
    }
    return { raw, frontmatter: fm, body };
  } catch {
    return null;
  }
}
