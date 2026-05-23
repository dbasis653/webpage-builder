import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

// Accessibility tests for the /preview/[slug] route.
// Runs axe-core scan, writes a11y-report.json, and fails on critical violations.
test.describe("Preview page — accessibility (axe)", () => {
  test("has no critical accessibility violations", async ({ page }) => {
    await page.goto("/preview/home");
    await page.waitForLoadState("networkidle");

    // Run full axe scan on the rendered page
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    // Write full report to disk — required artefact for CI and submission
    const reportPath = path.join(process.cwd(), "a11y-report.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          url: "/preview/home",
          timestamp: new Date().toISOString(),
          violations: results.violations,
          passes: results.passes.length,
          incomplete: results.incomplete.length,
          inapplicable: results.inapplicable.length,
        },
        null,
        2,
      ),
    );

    // Filter for critical violations only — these block CI
    const critical = results.violations.filter(
      (v) => v.impact === "critical",
    );

    // Log all violations for visibility in CI output
    if (results.violations.length > 0) {
      console.log(
        `\nAxe found ${results.violations.length} violation(s):\n`,
        results.violations.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join("\n"),
      );
    }

    // Fail only on critical — serious/moderate/minor are reported but not blocking
    expect(
      critical,
      `Critical a11y violations found:\n${critical.map((v) => `${v.id}: ${v.description}`).join("\n")}`,
    ).toHaveLength(0);
  });
});
