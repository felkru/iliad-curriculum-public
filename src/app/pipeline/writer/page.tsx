import Link from "next/link";

type Step = {
  n: number;
  title: string;
  body: string;
  bullets?: string[];
  who: "writer" | "system" | "felix";
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "You draft the module in Google Docs",
    body: "Same as before — work in the shared course-materials doc. Keep the standard structure (Contributor, Learning outcomes, Prerequisites, Content, Teaching guide, Notes for future iterations).",
    bullets: [
      "Section names matter — the converter uses them to split the page.",
      "Anything under 'Teaching guide' and 'Notes for future iterations' stays admin-only and never appears on the public site.",
    ],
    who: "writer",
  },
  {
    n: 2,
    title: "Export the doc as a .zip",
    body: "File → Download → Web Page (.html, zipped). That gives one .html file plus an images/ folder.",
    who: "writer",
  },
  {
    n: 3,
    title: "Send the zip to Felix (or upload it yourself)",
    body: "Either email the zip, or — if you have an admin login — drag it into the upload panel at iliad-admin.felkru.com/admin/upload and pick the module slug.",
    who: "writer",
  },
  {
    n: 4,
    title: "Claude converts HTML → MDX",
    body: "An always-running worker on the server feeds the HTML to Claude with a strict conversion prompt. The output is a single MDX file with frontmatter (title, cluster, contributors, learning outcomes, teaching guide…) and the body.",
    bullets: [
      "Every link, equation, image, and section in the source must appear in the output — no summarising.",
      "Math is rewritten as KaTeX ($…$, $$…$$).",
      "Internal sections become hidden YAML fields, not body content.",
    ],
    who: "system",
  },
  {
    n: 5,
    title: "Preview the draft",
    body: "At iliad-admin.felkru.com/admin/drafts/<slug> you see the rendered page exactly as it will look live. Frontmatter is editable inline.",
    who: "writer",
  },
  {
    n: 6,
    title: "Edit in the WYSIWYG editor — or ask the AI",
    body: "Open the editor; everything is rich-text. There is a floating bar at the bottom that says 'Tell AI what else needs to be changed…'. Type plain English, hit enter — Claude rewrites the page on the server and the editor refreshes.",
    bullets: [
      "Math, callouts, exercises, solutions, tables — all editable visually.",
      "Save Draft persists your edits. The Approve button below it makes the page live.",
    ],
    who: "writer",
  },
  {
    n: 7,
    title: "Approve → the page is live in ~30 seconds",
    body: "Approving writes the MDX into the public-site git repo and pushes. Vercel rebuilds and serves the new page at iliad.felkru.com/modules/<slug>. The .md download button on the public page always reflects the current approved version.",
    who: "felix",
  },
];

const WHO_BADGE: Record<Step["who"], { label: string; color: string }> = {
  writer: { label: "You", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  system: { label: "System", color: "bg-sky-100 text-sky-800 border-sky-300" },
  felix: { label: "Admin", color: "bg-amber-100 text-amber-800 border-amber-300" },
};

export default function WriterGuide() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="mb-6 font-sans text-xs uppercase tracking-[0.15em] text-zinc-500">
        <Link href="/pipeline" className="hover:text-black">← Pipeline overview</Link>
      </nav>
      <header className="mb-10">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-emerald-700">
          For writers
        </p>
        <h1
          className="mt-2 font-serif text-[2.2rem] leading-[1.1] tracking-tight"
          style={{ fontWeight: 600 }}
        >
          From Google Doc to live module, in seven steps
        </h1>
        <p className="mt-4 font-serif text-[1.05rem] leading-relaxed text-zinc-700">
          You never have to touch code. Everything below is either you doing
          something in Google Docs / the admin web UI, or the system doing
          something on its own.
        </p>
      </header>

      <ol className="space-y-6">
        {STEPS.map((s) => {
          const badge = WHO_BADGE[s.who];
          return (
            <li
              key={s.n}
              className="rounded-lg border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white"
                  aria-hidden="true"
                >
                  {s.n}
                </span>
                <h2 className="font-serif text-[1.25rem] leading-tight" style={{ fontWeight: 600 }}>
                  {s.title}
                </h2>
                <span
                  className={
                    "ml-auto rounded-full border px-2 py-0.5 font-sans text-[0.65rem] uppercase tracking-[0.12em] " +
                    badge.color
                  }
                >
                  {badge.label}
                </span>
              </div>
              <p className="mt-3 font-serif text-[1rem] leading-relaxed text-zinc-700">
                {s.body}
              </p>
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-1 pl-5 font-serif text-[0.98rem] leading-relaxed text-zinc-700">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          Things you can do without code
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-serif text-[1rem] leading-relaxed text-zinc-800">
          <li>Rewrite any paragraph in the WYSIWYG editor.</li>
          <li>Ask the AI to &ldquo;make this section tighter&rdquo;, &ldquo;turn this list into a callout&rdquo;, &ldquo;add a definition of X here&rdquo;.</li>
          <li>Set learning outcomes, summary, contributors, and cluster in the inline frontmatter panel.</li>
          <li>Reorder modules globally at /admin/order.</li>
          <li>Toggle a draft to internal-only — useful for unfinished teaching guides.</li>
        </ul>
      </section>

      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-amber-800">
          Things that need Felix (or another admin)
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-serif text-[1rem] leading-relaxed text-zinc-800">
          <li>Adding a brand-new module slug to the public site.</li>
          <li>Adding a new contributor email to the admin allowlist.</li>
          <li>Anything that touches the homepage, /about, or the site-wide settings.</li>
        </ul>
      </section>
    </main>
  );
}
