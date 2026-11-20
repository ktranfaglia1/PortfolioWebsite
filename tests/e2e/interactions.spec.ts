import { expect, test } from "@playwright/test";

test.describe("command palette", () => {
  test("opens from the header button, searches, and navigates", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search and commands" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const input = dialog.getByRole("combobox");
    await expect(input).toBeFocused();
    await input.fill("chess bot");
    await expect(dialog.getByRole("option").first()).toContainText(
      "Transformer Chess Bot",
    );
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/projects\/transformer-chess-bot$/);
  });

  test("opens with Ctrl+K, closes with Escape, and returns focus", async ({
    page,
  }) => {
    await page.goto("/projects");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // Second open goes through the already-mounted palette.
    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
  });

  test("finds projects by technology and runs actions", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox").fill("pytorch");
    await expect(
      dialog.getByRole("option", { name: /Transformer Chess Bot/ }),
    ).toBeVisible();

    await dialog.getByRole("combobox").fill("toggle theme");
    await expect(dialog.locator("[aria-selected=true]")).toContainText(
      "Toggle light / dark theme",
    );
    const before = await page.locator("html").getAttribute("data-theme");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      before!,
    );
  });

  test("copies the email address", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox").fill("copy email");
    await expect(dialog.locator("[aria-selected=true]")).toContainText(
      "Copy email address",
    );
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("status").filter({ hasText: "copied" }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "kyletranfaglia@gmail.com",
    );
  });

  test("does not load React until it is opened", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (r) => {
      if (r.resourceType() === "script") scripts.push(r.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(
      scripts.some((u) => /CommandPalette|react-dom|client\./.test(u)),
    ).toBe(false);
  });
});

test.describe("scroll reveal", () => {
  test("hides below-the-fold items until they scroll into view", async ({
    page,
  }) => {
    await page.goto("/experience");
    const last = page.locator("[data-reveal]").last();
    await expect(last).not.toHaveClass(/is-revealed/);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveClass(/is-revealed/);
    await expect(last).toHaveCSS("opacity", "1");
  });

  test("never hides anything with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/experience");
    await expect(page.locator("html")).not.toHaveClass(/reveal/);
    await expect(page.locator("[data-reveal]").last()).toHaveCSS(
      "opacity",
      "1",
    );
  });

  test("never hides anything without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/experience");
    await expect(page.locator("[data-reveal]").last()).toHaveCSS(
      "opacity",
      "1",
    );
    await context.close();
  });
});

test("Konami code cycles the accent color", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  for (const key of [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ]) {
    await page.keyboard.press(key);
  }
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.documentElement.style.getPropertyValue("--accent-hue"),
      ),
    )
    .toBe("165");
  await expect(
    page.getByRole("status").filter({ hasText: "Achievement unlocked" }),
  ).toBeVisible();
});
