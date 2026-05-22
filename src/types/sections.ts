import type { z } from "zod";
import type {
  HeroPropsSchema,
  FeatureGridPropsSchema,
  TestimonialPropsSchema,
  CTAPropsSchema,
} from "@/lib/validators/sections";

export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type FeatureGridProps = z.infer<typeof FeatureGridPropsSchema>;
export type TestimonialProps = z.infer<typeof TestimonialPropsSchema>;
export type CTAProps = z.infer<typeof CTAPropsSchema>;
