import { createClient } from "contentful";

// Reads published content only — used in production preview
export const deliveryClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN!,
  host: "cdn.contentful.com",
});

// Reads draft (unpublished) content — used in studio editor
export const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
  host: "preview.contentful.com",
});
