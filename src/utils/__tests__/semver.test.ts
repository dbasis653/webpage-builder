import { describe, it, expect } from "vitest";
import { diffPages, bumpVersion } from "@/utils/semver";
import type { Page } from "@/lib/validators/page";

// Helper — builds a minimal valid Page object for testing.
function makePage(sections: Page["sections"] = []): Page {
  return { pageId: "p1", slug: "home", title: "Home", sections };
}

// Helper — builds a minimal valid section.
function makeSection(
  id: string,
  type: Page["sections"][number]["type"],
  props: Record<string, unknown> = {},
): Page["sections"][number] {
  return { sectionId: id, type, props };
}

// ─── diffPages ────────────────────────────────────────────────────────────────

describe("diffPages", () => {
  it("returns none when pages are identical", () => {
    const page = makePage([makeSection("s1", "hero", { title: "Hello" })]);
    const { bump, changes } = diffPages(page, page);
    expect(bump).toBe("none");
    expect(changes).toHaveLength(0);
  });

  it("returns none for identical empty pages", () => {
    const page = makePage([]);
    expect(diffPages(page, page).bump).toBe("none");
  });

  // ── patch ──────────────────────────────────────────────────────────────────

  it("returns patch when a prop value changes", () => {
    const prev = makePage([makeSection("s1", "hero", { title: "Hello" })]);
    const next = makePage([makeSection("s1", "hero", { title: "Hi" })]);
    const { bump, changes } = diffPages(prev, next);
    expect(bump).toBe("patch");
    expect(changes[0]).toContain("[patch]");
  });

  it("returns patch for multiple prop value changes in same section", () => {
    const prev = makePage([makeSection("s1", "cta", { label: "Go", url: "/old" })]);
    const next = makePage([makeSection("s1", "cta", { label: "Start", url: "/new" })]);
    expect(diffPages(prev, next).bump).toBe("patch");
  });

  // ── minor ──────────────────────────────────────────────────────────────────

  it("returns minor when a section is added", () => {
    const prev = makePage([makeSection("s1", "hero", {})]);
    const next = makePage([makeSection("s1", "hero", {}), makeSection("s2", "cta", {})]);
    const { bump, changes } = diffPages(prev, next);
    expect(bump).toBe("minor");
    expect(changes[0]).toContain("[minor]");
  });

  it("returns minor when a new prop key is added to a section", () => {
    const prev = makePage([makeSection("s1", "hero", { title: "Hello" })]);
    const next = makePage([makeSection("s1", "hero", { title: "Hello", subtitle: "World" })]);
    expect(diffPages(prev, next).bump).toBe("minor");
  });

  // ── major ──────────────────────────────────────────────────────────────────

  it("returns major when a section is removed", () => {
    const prev = makePage([makeSection("s1", "hero", {}), makeSection("s2", "cta", {})]);
    const next = makePage([makeSection("s1", "hero", {})]);
    const { bump, changes } = diffPages(prev, next);
    expect(bump).toBe("major");
    expect(changes[0]).toContain("[major]");
  });

  it("returns major when a section type changes", () => {
    const prev = makePage([makeSection("s1", "hero", {})]);
    const next = makePage([makeSection("s1", "cta", {})]);
    expect(diffPages(prev, next).bump).toBe("major");
  });

  it("returns major when a required prop key is removed", () => {
    const prev = makePage([makeSection("s1", "hero", { title: "Hello", subtitle: "Sub" })]);
    const next = makePage([makeSection("s1", "hero", { title: "Hello" })]);
    expect(diffPages(prev, next).bump).toBe("major");
  });

  // ── highest bump wins ──────────────────────────────────────────────────────

  it("returns major when both major and patch changes exist", () => {
    const prev = makePage([
      makeSection("s1", "hero", { title: "Hello" }),
      makeSection("s2", "cta", { label: "Go" }),
    ]);
    // s1 prop changed (patch) + s2 removed (major)
    const next = makePage([makeSection("s1", "hero", { title: "Hi" })]);
    expect(diffPages(prev, next).bump).toBe("major");
  });

  it("returns minor when both minor and patch changes exist", () => {
    const prev = makePage([makeSection("s1", "hero", { title: "Hello" })]);
    // title changed (patch) + new section added (minor)
    const next = makePage([
      makeSection("s1", "hero", { title: "Hi" }),
      makeSection("s2", "cta", {}),
    ]);
    expect(diffPages(prev, next).bump).toBe("minor");
  });
});

// ─── bumpVersion ──────────────────────────────────────────────────────────────

describe("bumpVersion", () => {
  it("increments patch", () => {
    expect(bumpVersion("1.0.0", "patch")).toBe("1.0.1");
  });

  it("increments minor and resets patch", () => {
    expect(bumpVersion("1.0.3", "minor")).toBe("1.1.0");
  });

  it("increments major and resets minor and patch", () => {
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
  });

  it("returns the same version for none", () => {
    expect(bumpVersion("1.2.3", "none")).toBe("1.2.3");
  });

  it("handles version starting at 1.0.0 correctly", () => {
    expect(bumpVersion("1.0.0", "major")).toBe("2.0.0");
    expect(bumpVersion("1.0.0", "minor")).toBe("1.1.0");
    expect(bumpVersion("1.0.0", "patch")).toBe("1.0.1");
  });
});
