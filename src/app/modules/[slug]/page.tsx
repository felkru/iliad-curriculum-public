import { notFound, permanentRedirect } from "next/navigation";
import { readModuleMdx, readRedirect } from "@/lib/content";
import { clusterUrlSlug } from "@/lib/clusters";

export const dynamic = "force-dynamic";

/**
 * Legacy URL: /modules/<slug>. Forward to the canonical
 * /<cluster-url-slug>/<slug> location with a 301.
 */
export default async function LegacyModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = await readModuleMdx(slug);
  if (mod) {
    permanentRedirect(`/${clusterUrlSlug(mod.frontmatter.cluster)}/${slug}`);
  }
  const r = await readRedirect(slug);
  if (r) {
    permanentRedirect(
      `/${clusterUrlSlug(r.cluster)}/${r.to}`,
    );
  }
  notFound();
}
