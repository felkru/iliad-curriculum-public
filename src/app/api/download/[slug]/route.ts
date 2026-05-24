import { NextResponse } from "next/server";
import YAML from "yaml";
import { readModuleMdx } from "@/lib/content";

export const runtime = "nodejs";

// Frontmatter keys that must never leave the backend in a public download.
const PRIVATE_KEYS = new Set([
  "teachingGuide",
  "teaching_guide",
  "notesForFutureIterations",
  "notes_for_future_iterations",
  "internalNotes",
  "internal_notes",
]);

function stripPrivateFrontmatter(raw: string): string {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return raw;
  let fm: Record<string, unknown>;
  try {
    fm = (YAML.parse(m[1]) ?? {}) as Record<string, unknown>;
  } catch {
    return raw;
  }
  let touched = false;
  for (const k of Object.keys(fm)) {
    if (PRIVATE_KEYS.has(k)) {
      delete fm[k];
      touched = true;
    }
  }
  if (!touched) return raw;
  return `---\n${YAML.stringify(fm).trimEnd()}\n---\n${m[2]}`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const mod = await readModuleMdx(slug);
  if (!mod) return NextResponse.json({ error: "not found" }, { status: 404 });
  const sanitized = stripPrivateFrontmatter(mod.raw);
  return new NextResponse(sanitized, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.md"`,
    },
  });
}
