import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GATE_FILE = process.env.PREVIEW_GATE_FILE ?? "/var/iliad/preview-gate.json";
const TOKEN = process.env.PREVIEW_GATE_TOKEN ?? "";

async function currentPassword(): Promise<string> {
  try {
    const raw = await readFile(GATE_FILE, "utf8");
    return String((JSON.parse(raw) as { password?: string }).password ?? "").trim();
  } catch {
    return "";
  }
}

function formHtml(next: string, error = ""): string {
  const safeNext = next.replace(/"/g, "&quot;");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Protected preview</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#fafafa}
form{background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:28px;max-width:340px;width:90%;box-shadow:0 8px 30px rgba(0,0,0,.06)}
h1{font-size:16px;margin:0 0 4px}p{color:#71717a;font-size:13px;margin:0 0 16px}
input[type=password]{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d4d4d8;border-radius:8px;font-size:14px}
button{margin-top:12px;width:100%;padding:10px;border:0;border-radius:8px;background:#7c3aed;color:#fff;font-weight:600;font-size:14px;cursor:pointer}
.e{color:#dc2626;font-size:12px;margin-top:8px}</style></head>
<body><form method="POST" action="/gate"><h1>Protected preview</h1>
<p>Enter the password to view this site.</p>
<input type="password" name="password" autofocus autocomplete="current-password" placeholder="Password">
<input type="hidden" name="next" value="${safeNext}">
<button type="submit">Enter</button>${error ? `<div class="e">${error}</div>` : ""}</form></body></html>`;
}

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") || "/";
  return new NextResponse(formHtml(next), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const nextRaw = String(form.get("next") ?? "/");
  const next = nextRaw.startsWith("/") ? nextRaw : "/";
  const expected = await currentPassword();

  if (!expected || password !== expected) {
    return new NextResponse(formHtml(next, "Wrong password."), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }
  // Relative Location → browser resolves against the gated host (avoids
  // leaking the internal localhost origin from req.url).
  const res = new NextResponse(null, { status: 303, headers: { Location: next } });
  res.cookies.set("igate", TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days — "remember the password"
  });
  return res;
}
