import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "./routes";
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
        // Reduced motion disables scroll reveals, so every element is visible
        // and gets contrast-checked (axe skips invisible elements).
        await page.emulateMedia({ reducedMotion: "reduce" });
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

test("unknown routes get the 404 page with a 404 status", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page Not Found",
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
