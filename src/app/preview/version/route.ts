import { NextRequest, NextResponse } from "next/server";
import { previewVersionToken } from "@/lib/preview";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "latest";
  return NextResponse.json(
    { token: await previewVersionToken(slug) },
    { headers: { "cache-control": "no-store" } },
  );
}
