import type { Section } from "@/lib/validators/page";

// Default props injected when a new section is added via the "+ Add Section" dropdown.
// Each type gets minimal valid data so the section renders without errors.
export const SECTION_DEFAULTS: Record<Section["type"], Record<string, unknown>> = {
  hero: { title: "New Hero", subtitle: "" },
  featureGrid: { features: [] },
  testimonial: { quote: "New quote", author: "Author" },
  cta: { label: "Click here", url: "/" },
};
