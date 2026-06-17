import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16 "proxy" (formerly middleware). Password-only gate for the internal /
// preview hosts (staging.* and preview*.*). The public production host is never
// gated — and must never serve drafts — so /preview and /gate are 404 there.
const TOKEN = process.env.PREVIEW_GATE_TOKEN ?? "";

function isGatedHost(host: string): boolean {
  const sub = host.split(":")[0].split(".")[0];
  return sub === "staging" || sub.startsWith("preview");
}

function isPreviewOrGate(pathname: string): boolean {
  return (
    pathname === "/preview" ||
    pathname.startsWith("/preview/") ||
    pathname === "/gate" ||
    pathname.startsWith("/gate/")
  );
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  // Public production host: never expose drafts or the gate form.
  if (!isGatedHost(host)) {
    if (isPreviewOrGate(pathname)) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.next();
  }

  // Gated host: allow the gate route itself; everything else needs the cookie.
  if (pathname === "/gate" || pathname.startsWith("/gate/")) return NextResponse.next();

  const cookie = req.cookies.get("igate")?.value;
  if (TOKEN && cookie && cookie === TOKEN) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/gate";
  url.search = `?next=${encodeURIComponent(pathname + (req.nextUrl.search || ""))}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|icon.svg|apple-icon.png).*)"],
};
