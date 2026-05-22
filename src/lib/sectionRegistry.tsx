import type { Section } from "@/lib/validators/page";
import {
  HeroPropsSchema,
  FeatureGridPropsSchema,
  TestimonialPropsSchema,
  CTAPropsSchema,
} from "@/lib/validators/sections";
import Hero from "@/components/sections/Hero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import Testimonial from "@/components/sections/Testimonial";
import CTA from "@/components/sections/CTA";

// Each entry validates its own props with Zod and returns the rendered component.
// Returns null if props fail validation — PageRenderer handles the null case.
type SectionRenderFn = (props: Record<string, unknown>) => React.JSX.Element | null;

export const SECTION_REGISTRY: Record<Section["type"], SectionRenderFn> = {
  hero: (props) => {
    const parsed = HeroPropsSchema.safeParse(props);
    if (!parsed.success) return null;
    return <Hero {...parsed.data} />;
  },
  featureGrid: (props) => {
    const parsed = FeatureGridPropsSchema.safeParse(props);
    if (!parsed.success) return null;
    return <FeatureGrid {...parsed.data} />;
  },
  testimonial: (props) => {
    const parsed = TestimonialPropsSchema.safeParse(props);
    if (!parsed.success) return null;
    return <Testimonial {...parsed.data} />;
  },
  cta: (props) => {
    const parsed = CTAPropsSchema.safeParse(props);
    if (!parsed.success) return null;
    return <CTA {...parsed.data} />;
  },
};
