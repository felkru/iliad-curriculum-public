import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

const components = {
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
  Exercise: ({ difficulty = 1, children }: { difficulty?: number; children: ReactNode }) => (
    <section className="my-6 border border-zinc-300 rounded-md p-4">
      <header className="text-sm uppercase tracking-wide text-zinc-500 mb-2">
        Exercise · difficulty {difficulty}/5
      </header>
      <div>{children}</div>
    </section>
  ),
  Solution: ({ children }: { children: ReactNode }) => (
    <details className="my-3 ml-4 rounded-md border border-zinc-200 px-3 py-2">
      <summary className="cursor-pointer font-medium">Solution</summary>
      <div className="mt-2">{children}</div>
    </details>
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
