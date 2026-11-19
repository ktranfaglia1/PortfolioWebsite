import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Every public route. Extend this list as pages are added. */
const routes = ["/"];

for (const route of routes) {
  test.describe(`route ${route}`, () => {
    test("renders with a title and a single h1", async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Kyle Tranfaglia/);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test("has no WCAG 2.2 AA violations", async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
