import { cache } from "react";
import type { Metadata } from "next";
import { fetchPageBySlug } from "@/services/contentful.service";
import PageRenderer from "@/components/PageRenderer";
import { ApiError } from "@/utils/apiError";

type Props = { params: Promise<{ slug: string }> };

// Cached wrapper so generateMetadata and the page component share one Contentful
// fetch per render cycle. React cache() deduplicates calls within a single request.
const getCachedPage = cache(fetchPageBySlug);

// Generates page-level <title> from Contentful page data.
// Returns a fallback if the page is not found to avoid crashing metadata resolution.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const page = await getCachedPage(slug);
    return { title: page.title };
  } catch (err) {
    // 1. Only swallow 404 — re-throw everything else
    if (err instanceof ApiError && err.statusCode === 404) {
      return { title: "Page not found" };
    }
    throw err;
  }
}

// Fetches the published page by slug and renders it.
// Errors intentionally bubble to error.tsx — no try/catch here.
export default async function PreviewPage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;

  // 1. Fetch page — hits cache if generateMetadata already called it
  const page = await getCachedPage(slug);

  // 2. Render page sections via registry
  return <PageRenderer page={page} />;
}
