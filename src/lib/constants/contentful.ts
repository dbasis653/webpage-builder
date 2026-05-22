// Contentful CDN host — serves published content only.
export const CONTENTFUL_DELIVERY_HOST = "cdn.contentful.com";

// Contentful preview host — serves draft (unpublished) content.
export const CONTENTFUL_PREVIEW_HOST = "preview.contentful.com";

// Content type ID for page entries in Contentful.
export const CONTENTFUL_PAGE_CONTENT_TYPE = "page";

// Number of reference levels to resolve when fetching Contentful entries.
// Level 2 resolves: Page → Section (level 1) → any nested refs (level 2).
export const CONTENTFUL_INCLUDE_DEPTH = 2;
