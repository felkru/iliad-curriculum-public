import { PreviewView } from "../preview-view";

export const dynamic = "force-dynamic";

export default async function PreviewSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PreviewView routeSlug={slug} />;
}
