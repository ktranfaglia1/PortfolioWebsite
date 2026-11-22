import { expect, test } from "@playwright/test";
import { routes } from "./routes";

/**
 * The priority viewports from the redesign plan: a phone, then laptop to
 * large-desktop widths. Every route must fit without horizontal scrolling.
 */
const widths = [390, 1280, 1440, 1920, 2560];

for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const route of routes) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}
