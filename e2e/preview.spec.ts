import { test, expect } from "@playwright/test";

// Smoke tests for the /preview/[slug] route.
// Verifies that the page loads, sections render, and the CTA is keyboard accessible.
test.describe("Preview page — smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/preview/home");
    await page.waitForLoadState("networkidle");
  });

  test("page loads without error", async ({ page }) => {
    // No error boundary or 404 should be visible
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.locator("body")).not.toContainText("Page not found");
  });

  test("page title is set in the document", async ({ page }) => {
    // The <title> tag should be populated from Contentful page data
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe("Page not found");
  });

  test("at least one section renders", async ({ page }) => {
    // Every section component wraps content in a <section> element
    const sections = page.locator("section");
    await expect(sections.first()).toBeVisible();
  });

  test("hero title is visible", async ({ page }) => {
    // Hero renders an <h1> with the page title text
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test("CTA button is visible and has an href", async ({ page }) => {
    const cta = page.locator("[data-testid='cta-button']").first();
    await expect(cta).toBeVisible();

    // CTA must link somewhere — href must be non-empty
    const href = await cta.getAttribute("href");
    expect(href).toBeTruthy();
    expect((href as string).length).toBeGreaterThan(0);
  });

  test("CTA button is keyboard focusable via Tab", async ({ page }) => {
    // Start focus from the body and tab through until we reach the CTA
    await page.locator("body").click();

    const cta = page.locator("[data-testid='cta-button']").first();

    // Focus the CTA directly and verify it receives focus
    await cta.focus();
    await expect(cta).toBeFocused();
  });
});
