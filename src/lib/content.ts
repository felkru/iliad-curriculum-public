import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export type Frontmatter = {
  title?: string;
  cluster?: string;
  difficulty?: number;
  importance?: number;
  timeMinutes?: number;
  contributors?: string[];
  summary?: string;
  learningOutcomes?: string[];
  // Internal fields — public site ignores these.
  teachingGuide?: string;
  notesForFutureIterations?: string;
  internalNotes?: string;
};

export type IndexEntry = {
  slug: string;
  title: string;
  cluster: string | null;
  position?: number;
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
    const parsed: Frontmatter = (YAML.parse(m[1]) as Frontmatter | null) ?? {};
    return { raw, frontmatter: parsed, body: m[2] };
  } catch {
    return null;
  }
}
