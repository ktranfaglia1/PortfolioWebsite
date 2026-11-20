import { expect, test } from "@playwright/test";
import { routes } from "./routes";

test.describe("theme", () => {
  test("first visit follows the OS setting, live", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("a saved choice beats the OS setting", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("toggle switches theme, persists, and applies before paint on reload", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Dark mode" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    // The inline head script must set the theme before any bundled JS runs.
    await page.route("**/*.js", (route) => route.abort());
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("navigation", () => {
  test("marks the current page in the nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      nav.getByRole("link", { name: "Projects" }),
    ).not.toHaveAttribute("aria-current");
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test("opens, closes with Escape, and returns focus", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Menu" });
    const mobileNav = page.locator("#mobile-nav");

    await expect(mobileNav).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(
      mobileNav.getByRole("link", { name: "Projects" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(mobileNav).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("has no horizontal scroll at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${route}`).toBe(0);
    }
  });
});
