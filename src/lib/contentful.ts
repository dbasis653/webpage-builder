import { createClient } from "contentful";
import {
  CONTENTFUL_DELIVERY_HOST,
  CONTENTFUL_PREVIEW_HOST,
} from "@/lib/constants/contentful";

// Reads published content only — used in production preview
export const deliveryClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN!,
  host: CONTENTFUL_DELIVERY_HOST,
});

// Reads draft (unpublished) content — used in studio editor
export const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN!,
  host: CONTENTFUL_PREVIEW_HOST,
});
