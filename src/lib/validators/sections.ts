import { z } from "zod";

export const HeroPropsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export const FeatureItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export const FeatureGridPropsSchema = z.object({
  features: z.array(FeatureItemSchema),
});

export const TestimonialPropsSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  avatar: z.string().optional(),
});

export const CTAPropsSchema = z.object({
  label: z.string(),
  url: z.string(),
  variant: z.enum(["primary", "secondary"]).optional(),
});
