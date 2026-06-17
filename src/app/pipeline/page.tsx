import Link from "next/link";

export default function PipelineLanding() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-zinc-500">
          How this site works
        </p>
        <h1
          className="mt-2 font-serif text-[2.4rem] leading-[1.1] tracking-tight"
          style={{ fontWeight: 600 }}
        >
          The Iliad Intensive content pipeline
        </h1>
        <p className="mt-4 font-serif text-[1.1rem] leading-relaxed text-zinc-700">
          A short tour of how a module goes from a Google Doc to a public page on
          iliad.felkru.com, written for two audiences. Pick the one that fits.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/pipeline/writer"
          className="group rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-sm"
        >
          <div className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-emerald-700">
            For writers
          </div>
          <h2 className="mt-2 font-serif text-[1.4rem] leading-snug" style={{ fontWeight: 600 }}>
            I write or edit curriculum content
          </h2>
          <p className="mt-3 font-serif text-[1rem] leading-relaxed text-zinc-600">
            How to get a new module on the site, request AI edits, and approve
            drafts — no code involved.
          </p>
          <span className="mt-4 inline-block text-sm text-emerald-700 group-hover:underline">
            Read the writer guide →
          </span>
        </Link>

        <Link
          href="/pipeline/maintainer"
          className="group rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-sm"
        >
          <div className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-sky-700">
            For maintainers
          </div>
          <h2 className="mt-2 font-serif text-[1.4rem] leading-snug" style={{ fontWeight: 600 }}>
            I inherit the codebase
          </h2>
          <p className="mt-3 font-serif text-[1rem] leading-relaxed text-zinc-600">
            Architecture, hosting, secrets, deployment, and how to extend the
            system with Claude Code without breaking the writers&rsquo; flow.
          </p>
          <span className="mt-4 inline-block text-sm text-sky-700 group-hover:underline">
            Read the maintainer guide →
          </span>
        </Link>
      </div>

      <Link
        href="/pipeline/local"
        className="group mt-4 block rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-sm"
      >
        <div className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-violet-700">
          For writers · advanced
        </div>
        <h2 className="mt-2 font-serif text-[1.4rem] leading-snug" style={{ fontWeight: 600 }}>
          I want to edit locally (VSCode + AI)
        </h2>
        <p className="mt-3 font-serif text-[1rem] leading-relaxed text-zinc-600">
          Run the whole site on your machine, or preview a single file — options
          for an AI-integrated local workflow.
        </p>
        <span className="mt-4 inline-block text-sm text-violet-700 group-hover:underline">
          Read the local-editing guide &rarr;
        </span>
      </Link>

      <footer className="mt-12 border-t border-zinc-200 pt-6 font-sans text-xs text-zinc-500">
        Maintained by Felix Krückel — questions: felix@aisafetyaachen.org
      </footer>
    </main>
  );
}
