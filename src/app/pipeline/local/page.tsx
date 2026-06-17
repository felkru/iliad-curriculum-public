import Link from "next/link";

export const metadata = {
  title: "Working locally — Iliad Intensive",
  description:
    "How to edit and preview curriculum materials locally (VSCode, npm run dev, single-file preview) for an AI-integrated workflow.",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="font-serif text-[1.4rem] leading-snug" style={{ fontWeight: 600 }}>
        {title}
      </h2>
      <div className="mt-3 font-serif text-[1.02rem] leading-relaxed text-zinc-700">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md bg-zinc-900 px-4 py-3 font-mono text-[0.82rem] leading-relaxed text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

export default function LocalEditingGuide() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-6">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          For writers · advanced
        </p>
        <h1
          className="mt-2 font-serif text-[2.4rem] leading-[1.1] tracking-tight"
          style={{ fontWeight: 600 }}
        >
          Working locally
        </h1>
        <p className="mt-4 font-serif text-[1.1rem] leading-relaxed text-zinc-700">
          You don&rsquo;t need any of this — the admin editor and its live
          preview cover everyday authoring. But if you prefer to work in your
          own editor (VSCode, Cursor, …) with an AI coding assistant, the public
          site is a normal Next.js app you can run on your machine. Pick whatever
          fits.
        </p>
      </header>

      <Card title="A · Full local site (recommended)">
        Clone the public repo and run the dev server — it renders the entire
        site with hot-reload, including every custom component (callouts,
        exercises, figures) and KaTeX math, exactly as production. No database
        or secrets needed; the content is just the files in <code>content/</code>.
        <Code>{`git clone git@github.com:felkru/iliad-curriculum-public.git
cd iliad-curriculum-public
npm install
npm run dev        # → http://localhost:3000`}</Code>
        <p className="mt-3">
          <strong>VSCode tip:</strong> open the built-in <em>Simple Browser</em>{" "}
          (<code>Cmd/Ctrl+Shift+P</code> → &ldquo;Simple Browser: Show&rdquo;) at{" "}
          <code>localhost:3000</code> to see the rendered page beside your editor
          — a tight loop for AI-assisted editing of site code and non-module
          content.
        </p>
      </Card>

      <Card title="B · Quick single-file preview (no server)">
        For a fast structural look at one <code>.mdx</code> without running the
        app, use a VSCode MDX preview extension (e.g.{" "}
        <em>&ldquo;MDX&rdquo;</em> by unified). It shows prose and standard
        Markdown, but <strong>not</strong> the custom curriculum components or
        math — switch to Option A when you need those to render.
      </Card>

      <Card title="C · No setup — live preview in the admin">
        Editing a draft in the admin? Click{" "}
        <strong>👁 Preview</strong> at the top of the editor: it opens a live,
        password-gated preview that hot-reloads on save and shows the full page
        — including the frontmatter header (title, summary, contributors,
        learning outcomes) — exactly as it will look once published.
      </Card>

      <Card title="What you can edit locally">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Freely:</strong> site code (<code>src/</code>) and non-module
            content (<code>about.mdx</code>, site config).
          </li>
          <li>
            <strong>Module content</strong> (<code>content/modules/*.mdx</code>):
            render and experiment all you like locally, but{" "}
            <strong>don&rsquo;t hand-push it</strong> — the admin database is the
            source of truth and the next publish overwrites it. Edit modules
            through the admin.
          </li>
        </ul>
        <p className="mt-3">
          Pushing a commit to the repo rebuilds the site automatically (every
          commit is built and deployed), so site-code and{" "}
          <code>about.mdx</code> changes go live on merge to <code>main</code>.
        </p>
      </Card>

      <footer className="mt-12 border-t border-zinc-200 pt-6 font-sans text-xs text-zinc-500">
        <Link href="/pipeline" className="text-emerald-700 hover:underline">
          ← Back to the content pipeline
        </Link>
      </footer>
    </main>
  );
}
