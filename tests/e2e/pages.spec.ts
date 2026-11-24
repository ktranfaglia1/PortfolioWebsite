import { expect, test } from "@playwright/test";

test.describe("projects filter", () => {
  const visibleCards = (page: import("@playwright/test").Page) =>
    page.locator("[data-project]:visible");

  test("filters by category, keeps state in the URL, and survives reload", async ({
    page,
  }) => {
    await page.goto("/projects");
    const total = await page.locator("[data-project]").count();
    await expect(visibleCards(page)).toHaveCount(total);

    const chip = page.getByRole("button", { name: "Data science" });
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/\?category=data-science$/);

    const shown = await visibleCards(page).count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(total);
    await expect(page.getByRole("status").first()).toHaveText(
      `Showing ${shown} of ${total} projects`,
    );

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Data science" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(visibleCards(page)).toHaveCount(shown);
  });

  test("combines category and tech, shows an empty state, and clears", async ({
    page,
  }) => {
    await page.goto("/projects?category=research&tech=C%2B%2B");
    await expect(visibleCards(page)).toHaveCount(0);
    await expect(
      page.getByText("No projects match those filters."),
    ).toBeVisible();
    // Sections with nothing left are hidden too.
    await expect(page.locator("#featured")).toBeHidden();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator("#featured")).toBeVisible();
  });

  test("ignores unknown filter values in the URL", async ({ page }) => {
    await page.goto("/projects?category=nope");
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("shows every project without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/projects?category=research");
    await expect(page.locator("[data-filter]")).toBeHidden();
    const total = await page.locator("[data-project]").count();
    await expect(page.locator("[data-project]:visible")).toHaveCount(total);
    await context.close();
  });
});

test.describe("case study", () => {
  test("has details, links, and prev/next navigation", async ({ page }) => {
    await page.goto("/projects/celite");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Celite");
    await expect(page.getByRole("link", { name: /Live site/ })).toHaveAttribute(
      "href",
      "https://celite.org",
    );
    const nav = page.getByRole("navigation", { name: "More projects" });
    await expect(nav.getByRole("link")).toHaveCount(2);
  });
});

test.describe("contact form", () => {
  async function fill(page: import("@playwright/test").Page) {
    await page.getByLabel("Name").fill("Test Person");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Message").fill("Hello from the test suite.");
  }

  test("shows a success message when Formspree accepts", async ({ page }) => {
    await page.route("https://formspree.io/**", (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(
      page.getByRole("heading", { name: "Message Sent" }),
    ).toBeVisible();
    await expect(page.locator("[data-contact-form]")).toBeHidden();
  });

  test("shows the error inline when Formspree rejects", async ({ page }) => {
    await page.route("https://formspree.io/**", (route) =>
      route.fulfill({
        status: 422,
        json: { errors: [{ field: "email", message: "should be an email" }] },
      }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("[data-form-status]")).toContainText(
      "email should be an email.",
    );
    await expect(page.locator("[data-contact-form]")).toBeVisible();
  });

  test("blocks submission when required fields are empty", async ({ page }) => {
    let posted = false;
    await page.route("https://formspree.io/**", (route) => {
      posted = true;
      return route.fulfill({ status: 200, json: {} });
    });
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByLabel("Name")).toBeFocused();
    expect(posted).toBe(false);
  });
});
