/**
 * MDX renderer for the public site. The component catalogue must stay in
 * lockstep with the admin's src/lib/mdx/render.tsx — same components, same
 * attribute names. Both files are read by the AI edit agent at runtime.
 */
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

const components = {
  /**
   * Callout — coloured side-note for an important remark, warning, or tip.
   * Usage: <Callout type="note|warning|tip">body</Callout>
   */
  Callout: ({
    type = "note",
    children,
  }: {
    type?: "note" | "warning" | "tip";
    children: ReactNode;
  }) => (
    <div
      className={
        "my-4 rounded-md border-l-4 px-4 py-3 " +
        (type === "warning"
          ? "border-amber-500 bg-amber-50"
          : type === "tip"
            ? "border-emerald-500 bg-emerald-50"
            : "border-sky-500 bg-sky-50")
      }
    >
      {children}
    </div>
  ),

  /**
   * Exercise — boxed practice problem with 1–5 difficulty stamp.
   * Usage: <Exercise difficulty={N}>problem</Exercise>
   */
  Exercise: ({ difficulty = 1, children }: { difficulty?: number; children: ReactNode }) => (
    <section className="my-6 border border-zinc-300 rounded-md p-4">
      <header className="text-sm uppercase tracking-wide text-zinc-500 mb-2">
        Exercise · difficulty {difficulty}/5
      </header>
      <div>{children}</div>
    </section>
  ),

  /**
   * Solution — collapsible answer that follows an Exercise.
   * Usage: <Solution>worked answer</Solution>
   */
  Solution: ({ children }: { children: ReactNode }) => (
    <details className="my-3 rounded-md border border-zinc-200 px-3 py-2">
      <summary className="cursor-pointer font-medium">Solution</summary>
      <div className="mt-2">{children}</div>
    </details>
  ),

  /**
   * Definition — bolded named-concept block.
   * Usage: <Definition term="RLCT">Real Log Canonical Threshold; see Watanabe.</Definition>
   */
  Definition: ({ term, children }: { term: string; children: ReactNode }) => (
    <section
      className="my-4 rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3"
      data-component="definition"
    >
      <header className="text-xs uppercase tracking-wider text-zinc-500">
        Definition
      </header>
      <p className="mt-1">
        <strong className="font-semibold">{term}.</strong>{" "}
        <span>{children}</span>
      </p>
    </section>
  ),

  /**
   * Theorem — formal statement.
   * Usage: <Theorem kind="theorem|lemma|proposition|corollary" name="optional attribution">statement</Theorem>
   */
  Theorem: ({
    kind = "theorem",
    name,
    children,
  }: {
    kind?: "theorem" | "lemma" | "proposition" | "corollary";
    name?: string;
    children: ReactNode;
  }) => {
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);
    return (
      <section
        className="my-5 border-l-4 border-violet-500 bg-violet-50 px-4 py-3 rounded-r"
        data-component="theorem"
      >
        <header className="text-xs uppercase tracking-wider text-violet-700">
          {label}
          {name ? ` · ${name}` : ""}
        </header>
        <div className="mt-1 italic">{children}</div>
      </section>
    );
  },

  /**
   * Figure — image with caption.
   * Usage: <Figure src="/uploads/<slug>/file.png" alt="..." caption="..." />
   */
  Figure: ({ src, alt, caption }: { src: string; alt?: string; caption?: string }) => (
    <figure className="my-6 text-center" data-component="figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? caption ?? ""}
        loading="lazy"
        decoding="async"
        className="mx-auto h-auto max-w-full rounded"
      />
      {caption ? (
        <figcaption className="mt-2 text-sm text-zinc-600">{caption}</figcaption>
      ) : null}
    </figure>
  ),
};

export function MdxBody({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          // rehypeSlug must run before rehypeKatex so it operates on plain
          // heading text. Adds `id` attrs that the sidebar TOC links target.
          rehypePlugins: [rehypeSlug, [rehypeKatex, { strict: false }]],
        },
      }}
    />
  );
}
