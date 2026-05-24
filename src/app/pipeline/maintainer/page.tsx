import Link from "next/link";
import { MermaidDiagram } from "@/components/MermaidDiagram";

const ARCH_DIAGRAM = `flowchart LR
  W[Writer: Google Doc] -->|export .zip| U[admin: /admin/upload]
  U -->|files saved + job queued| DB[(Postgres on Hetzner)]
  WK[iliad-worker.service] -->|LISTEN/NOTIFY| DB
  WK -->|claude --print| C[Claude CLI / OAuth subscription]
  C -->|MDX| WK
  WK -->|UPDATE pages| DB
  DB -->|preview draft| A[admin: /admin/drafts/slug]
  A -->|approve| EX[exporter]
  EX -->|write + git push| GH[public-site repo on GitHub]
  GH -->|webhook| V[Vercel build]
  V -->|CDN| R[iliad.felkru.com readers]
`;

const FILE_MAP: { path: string; what: string }[] = [
  { path: "curriculum_website/src/app/admin/*", what: "Admin UI (Next.js App Router): upload, draft list, draft edit, approve, order, users, settings." },
  { path: "curriculum_website/src/app/admin/drafts/[slug]/edit/tiptap-editor.tsx", what: "WYSIWYG editor. Custom Tiptap nodes for math + Callout/Exercise/Solution; MDX↔HTML bridge in extensions/mdx-bridge.ts." },
  { path: "curriculum_website/src/app/admin/drafts/[slug]/edit/ai-bar.tsx", what: "‘Tell AI what else needs to be changed…’ input bar. Posts to /api/pages/[id]/ai-edit." },
  { path: "curriculum_website/src/app/api/pages/[id]/ai-edit/route.ts", what: "Spawns the claude CLI on the box with the current MDX + the user prompt, returns the edited MDX." },
  { path: "curriculum_website/src/lib/claude/convertSources.ts", what: "Conversion system prompt and CLI wrapper used by the worker." },
  { path: "curriculum_website/src/worker/*", what: "Long-running daemon (iliad-worker.service). Polls generation_jobs, runs the converter, writes MDX back." },
  { path: "curriculum_website/src/lib/exporter/index.ts", what: "On approval: writes MDX into the public-site repo, refreshes content/index.json (with TOC headings), pushes." },
  { path: "curriculum_website/src/lib/db/schema.ts", what: "Drizzle schema: pages, sources, generation_jobs, users_allowlist, site_settings, Auth.js tables." },
  { path: "curriculum_website_public/src/app/modules/[slug]/page.tsx", what: "Public module page: header, frontmatter, MdxBody." },
  { path: "curriculum_website_public/src/components/SidebarNav.tsx", what: "Cluster sidebar + nested TOC for the active module (configured by site_settings.heading_depth)." },
  { path: "curriculum_website_public/src/lib/mdx.tsx", what: "MDXRemote setup: remark-math + rehype-slug + rehype-katex; custom Callout/Exercise/Solution components." },
];

const SECRETS: { name: string; loc: string; note: string }[] = [
  { name: "DATABASE_URL", loc: "/etc/iliad/admin.env", note: "Postgres on the same box. Never log the connection string." },
  { name: "AUTH_SECRET", loc: "/etc/iliad/admin.env", note: "Auth.js session signing key." },
  { name: "AUTH_GITHUB_ID / _SECRET", loc: "/etc/iliad/admin.env", note: "GitHub OAuth for admin login. Felkru’s app." },
  { name: "EMAIL_SERVER", loc: "/etc/iliad/admin.env", note: "Gmail SMTP on port 587 — Hetzner blocks 465 outbound." },
  { name: "GIT_AUTHOR_NAME/EMAIL", loc: "exporter env", note: "Must be ‘Felkru <acc@felkru.com>’ — Vercel Hobby only deploys commits authored by the project owner." },
  { name: "ANTHROPIC_*", loc: "intentionally absent", note: "The Claude CLI uses Felkru’s OAuth subscription at /home/iliad/.claude. The exporter route DELETEs ANTHROPIC_API_KEY before spawning." },
];

const GOTCHAS: { title: string; body: string }[] = [
  {
    title: "Commit author must be Felkru <acc@felkru.com>",
    body: "Vercel Hobby only deploys commits authored by the project owner. The exporter forces GIT_AUTHOR_NAME/EMAIL via env. Do not change this without confirming the Vercel plan.",
  },
  {
    title: "Do not skip git hooks (--no-verify) or bypass GPG signing",
    body: "There is no scenario where this is correct on this codebase.",
  },
  {
    title: "Frontmatter parsing uses the `yaml` package, not a regex",
    body: "We hit production bugs from regex-based parsers eating block scalars (|). Always parse via `yaml`.",
  },
  {
    title: "Internal fields stay in the database; the public download endpoint strips them",
    body: "curriculum_website_public/src/app/api/download/[slug]/route.ts removes teachingGuide, notesForFutureIterations, internalNotes before serving the .md.",
  },
  {
    title: "iCloud creates ‘ 2.ts’ duplicates in .next/types",
    body: "If a local typecheck fails with duplicate-identifier errors, clean .next/types/* 2.ts and retry. Production builds on Hetzner / Vercel are unaffected.",
  },
];

export default function MaintainerGuide() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <nav className="mb-6 font-sans text-xs uppercase tracking-[0.15em] text-zinc-500">
        <Link href="/pipeline" className="hover:text-black">← Pipeline overview</Link>
      </nav>
      <header className="mb-10">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-sky-700">
          For maintainers
        </p>
        <h1
          className="mt-2 font-serif text-[2.2rem] leading-[1.1] tracking-tight"
          style={{ fontWeight: 600 }}
        >
          Architecture, hosting, and where to make changes
        </h1>
        <p className="mt-4 font-serif text-[1.05rem] leading-relaxed text-zinc-700">
          Everything you need to inherit the codebase, support contributors, and
          ship new features using Claude Code without disrupting the writers&rsquo;
          flow.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          End-to-end data flow
        </h2>
        <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-5">
          <MermaidDiagram chart={ARCH_DIAGRAM} />
        </div>
        <p className="mt-3 font-serif text-[0.95rem] leading-relaxed text-zinc-600">
          Two Hetzner CX23 services (admin + worker) on the same box share a
          Postgres database. The exporter is the only writer to the public-site
          GitHub repo; Vercel does the static deploy.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          Two repos, two Next.js apps
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="font-sans text-[0.7rem] uppercase tracking-[0.15em] text-zinc-500">
              curriculum_website
            </div>
            <h3 className="mt-1 font-serif text-[1.15rem]" style={{ fontWeight: 600 }}>
              Admin (Hetzner)
            </h3>
            <p className="mt-2 font-serif text-[0.98rem] leading-relaxed text-zinc-700">
              Dynamic Next.js 16 app on iliad-admin.felkru.com. Owns the database,
              the upload flow, the WYSIWYG editor, the AI-edit endpoint, and the
              exporter. Runs as systemd <code className="font-mono text-[0.85em]">iliad-admin.service</code> +
              <code className="font-mono text-[0.85em]"> iliad-worker.service</code>.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="font-sans text-[0.7rem] uppercase tracking-[0.15em] text-zinc-500">
              curriculum_website_public
            </div>
            <h3 className="mt-1 font-serif text-[1.15rem]" style={{ fontWeight: 600 }}>
              Public (Vercel)
            </h3>
            <p className="mt-2 font-serif text-[0.98rem] leading-relaxed text-zinc-700">
              The reader-facing site at iliad.felkru.com. The admin exporter pushes
              MDX into <code className="font-mono text-[0.85em]">content/modules/*.mdx</code> +
              <code className="font-mono text-[0.85em]"> content/index.json</code> and Vercel rebuilds. No
              database; reads everything from disk at request time.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          Files you&rsquo;ll touch most
        </h2>
        <table className="mt-3 w-full border-collapse text-left font-sans text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-xs uppercase tracking-[0.12em] text-zinc-500">
              <th className="py-2 pr-4">Path</th>
              <th className="py-2">What it does</th>
            </tr>
          </thead>
          <tbody className="font-serif text-[0.95rem] leading-snug">
            {FILE_MAP.map((f) => (
              <tr key={f.path} className="border-b border-zinc-100 align-top">
                <td className="py-3 pr-4 font-mono text-[0.82rem] text-zinc-700">{f.path}</td>
                <td className="py-3 text-zinc-700">{f.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-12">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          Secrets &amp; environment
        </h2>
        <p className="mt-2 font-serif text-[1rem] leading-relaxed text-zinc-700">
          All admin secrets live on the box at <code className="font-mono text-[0.85em]">/etc/iliad/admin.env</code>
          {" "}(systemd reads it via <code className="font-mono text-[0.85em]">EnvironmentFile=</code>). Never commit
          them, never log them, never share the file in a chat tool.
        </p>
        <table className="mt-3 w-full border-collapse text-left font-sans text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-xs uppercase tracking-[0.12em] text-zinc-500">
              <th className="py-2 pr-4">Key</th>
              <th className="py-2 pr-4">Location</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody className="font-serif text-[0.95rem] leading-snug">
            {SECRETS.map((s) => (
              <tr key={s.name} className="border-b border-zinc-100 align-top">
                <td className="py-3 pr-4 font-mono text-[0.82rem] text-zinc-700">{s.name}</td>
                <td className="py-3 pr-4 text-zinc-600">{s.loc}</td>
                <td className="py-3 text-zinc-700">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-12">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          Extending the system with Claude Code
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6 font-serif text-[1rem] leading-relaxed text-zinc-700">
          <li>
            Pull both repos:{" "}
            <code className="font-mono text-[0.85em]">curriculum_website</code> and{" "}
            <code className="font-mono text-[0.85em]">curriculum_website_public</code>.
          </li>
          <li>
            Run <code className="font-mono text-[0.85em]">claude</code> in the repo root. The
            project-level <code className="font-mono text-[0.85em]">CLAUDE.md</code> and{" "}
            <code className="font-mono text-[0.85em]">AGENTS.md</code> brief the agent on
            the codebase conventions (Next.js 16 differences, no skipping hooks, etc.).
          </li>
          <li>
            For changes touching the editor or pipeline, work in a branch — Vercel
            preview deploys catch regressions on the public side before they hit
            iliad.felkru.com.
          </li>
          <li>
            When pushing to <code className="font-mono text-[0.85em]">main</code>, the
            <code className="font-mono text-[0.85em]"> Felkru/acc@felkru.com</code>{" "}
            committer identity is required for Vercel Hobby. The exporter forces
            this automatically; manual commits need it set in your local git config.
          </li>
          <li>
            Deploy the admin app:{" "}
            <code className="font-mono text-[0.85em]">infra/deploy.sh</code> rsyncs the
            built app to the box and runs{" "}
            <code className="font-mono text-[0.85em]">systemctl restart iliad-admin</code>.
          </li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          Gotchas (read before your first PR)
        </h2>
        <div className="mt-3 space-y-3">
          {GOTCHAS.map((g) => (
            <div key={g.title} className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-sans text-sm font-semibold text-amber-900">{g.title}</h3>
              <p className="mt-1 font-serif text-[0.98rem] leading-relaxed text-amber-950">
                {g.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
