import { describe, it, expect } from "vitest";
import { PageSchema, SectionSchema } from "@/lib/validators/page";

// ─── SectionSchema ────────────────────────────────────────────────────────────

describe("SectionSchema", () => {
  it("accepts a valid hero section", () => {
    const input = {
      sectionId: "s1",
      type: "hero",
      props: { title: "Welcome" },
    };
    expect(SectionSchema.safeParse(input).success).toBe(true);
  });

  it("accepts all valid section types", () => {
    const types = ["hero", "featureGrid", "testimonial", "cta"];
    for (const type of types) {
      const input = { sectionId: "s1", type, props: {} };
      expect(SectionSchema.safeParse(input).success).toBe(true);
    }
  });

  it("rejects an unknown section type", () => {
    const input = { sectionId: "s1", type: "banner", props: {} };
    expect(SectionSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a section missing sectionId", () => {
    const input = { type: "hero", props: {} };
    expect(SectionSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a section missing type", () => {
    const input = { sectionId: "s1", props: {} };
    expect(SectionSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a section with empty props", () => {
    const input = { sectionId: "s1", type: "cta", props: {} };
    expect(SectionSchema.safeParse(input).success).toBe(true);
  });

  it("accepts a section with any prop values", () => {
    const input = {
      sectionId: "s1",
      type: "hero",
      props: { title: "Hello", count: 42, nested: { a: true } },
    };
    expect(SectionSchema.safeParse(input).success).toBe(true);
  });
});

// ─── PageSchema ───────────────────────────────────────────────────────────────

describe("PageSchema", () => {
  it("accepts a valid page with sections", () => {
    const input = {
      pageId: "p1",
      slug: "home",
      title: "Home Page",
      sections: [
        { sectionId: "s1", type: "hero", props: { title: "Welcome" } },
      ],
    };
    expect(PageSchema.safeParse(input).success).toBe(true);
  });

  it("accepts a page with empty sections array", () => {
    const input = { pageId: "p1", slug: "home", title: "Home Page", sections: [] };
    expect(PageSchema.safeParse(input).success).toBe(true);
  });

  it("rejects a page missing slug", () => {
    const input = { pageId: "p1", title: "Home Page", sections: [] };
    expect(PageSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a page missing title", () => {
    const input = { pageId: "p1", slug: "home", sections: [] };
    expect(PageSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a page missing pageId", () => {
    const input = { slug: "home", title: "Home Page", sections: [] };
    expect(PageSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a page where sections is not an array", () => {
    const input = { pageId: "p1", slug: "home", title: "Home Page", sections: "not-an-array" };
    expect(PageSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a page with an invalid section inside sections", () => {
    const input = {
      pageId: "p1",
      slug: "home",
      title: "Home Page",
      sections: [{ sectionId: "s1", type: "invalid-type", props: {} }],
    };
    expect(PageSchema.safeParse(input).success).toBe(false);
  });

  it("rejects a completely empty object", () => {
    expect(PageSchema.safeParse({}).success).toBe(false);
  });
});
