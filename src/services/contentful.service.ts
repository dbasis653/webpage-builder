import { deliveryClient, previewClient } from "@/lib/contentful";
import { PageSchema, type Page } from "@/lib/validators/page";
import { ApiError } from "@/utils/apiError";
import type { Entry, EntrySkeletonType } from "contentful";

// Transforms a raw Contentful section entry into our Section shape.
// Strips all Contentful-specific metadata (sys, metadata, etc).
function transformSection(entry: Entry<EntrySkeletonType>): unknown {
  const fields = entry.fields as Record<string, unknown>;
  return {
    sectionId: fields.sectionId,
    type: fields.type,
    props: fields.props ?? {},
  };
}

// Transforms a raw Contentful page entry into our Page shape.
// Returns a plain object ready for Zod validation.
function transformPage(entry: Entry<EntrySkeletonType>): unknown {
  const fields = entry.fields as Record<string, unknown>;
  const sections = Array.isArray(fields.sections)
    ? (fields.sections as Entry<EntrySkeletonType>[]).map(transformSection)
    : [];

  return {
    pageId: entry.sys.id,
    slug: fields.slug,
    title: fields.title,
    sections,
  };
}

// Fetches a page by slug from Contentful, validates it, and returns a clean Page object.
// Throws if the page is not found or if the data fails validation.
export async function fetchPageBySlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<Page> {
  const client = options?.preview ? previewClient : deliveryClient;

  // 1. Query Contentful for the page entry matching the slug
  const response = await client.getEntries({
    content_type: "page",
    "fields.slug": slug,
    include: 2,
  } as Parameters<typeof client.getEntries>[0]);

  // 2. Throw if no matching page found
  if (response.items.length === 0) {
    throw new ApiError(404, `Page not found: ${slug}`);
  }

  // 3. Transform raw Contentful entry into our shape
  const raw = transformPage(response.items[0]);

  // 4. Validate with Zod — throws ZodError if data is invalid
  const page = PageSchema.parse(raw);

  // 5. Return clean, typed Page object
  return page;
}
