import { NextResponse } from "next/server";
import { readModuleMdx } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const mod = await readModuleMdx(slug);
  if (!mod) return NextResponse.json({ error: "not found" }, { status: 404 });
  return new NextResponse(mod.raw, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.md"`,
    },
  });
}
