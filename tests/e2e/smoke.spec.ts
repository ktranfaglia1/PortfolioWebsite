import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Every public route. Extend this list as pages are added. */
const routes = ["/", "/styleguide"];
const themes = ["dark", "light"] as const;

async function useTheme(page: Page, theme: (typeof themes)[number]) {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
}

for (const route of routes) {
  test.describe(`route ${route}`, () => {
    test("renders with a title, a single h1, header, and footer", async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/Kyle Tranfaglia/);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });

    for (const theme of themes) {
      test(`has no WCAG 2.2 AA violations (${theme})`, async ({ page }) => {
        await useTheme(page, theme);
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });
}
