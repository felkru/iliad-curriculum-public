import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16 "proxy" (formerly middleware). Password-only gate for the internal /
// preview hosts (staging.* and preview*.*). The public production host is never
// gated. We only check a signed cookie here (edge-safe, no fs); the password
// itself is validated in the Node `/gate` route which reads the box-local file.
const TOKEN = process.env.PREVIEW_GATE_TOKEN ?? "";

function isGatedHost(host: string): boolean {
  const sub = host.split(":")[0].split(".")[0];
  return sub === "staging" || sub.startsWith("preview");
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (!isGatedHost(host)) return NextResponse.next();

  const { pathname } = req.nextUrl;
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
