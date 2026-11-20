import { expect, test } from "@playwright/test";
import { legacyRedirects } from "../../src/lib/redirects";
import { routes } from "./routes";

const SITE = "https://kyletranfaglia.top";
const indexable = routes.filter((r) => r !== "/styleguide");

test.describe("meta tags", () => {
  for (const route of indexable) {
    test(`${route} has canonical, OG/Twitter tags, and a working share image`, async ({
      page,
      request,
    }) => {
      await page.goto(route);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toBe(route === "/" ? `${SITE}/` : `${SITE}${route}`);

      const meta = (sel: string) => page.locator(sel).getAttribute("content");
      expect(await meta('meta[property="og:url"]')).toBe(canonical);
      expect(await meta('meta[property="og:title"]')).toBe(await page.title());
      expect((await meta('meta[name="description"]'))?.length).toBeGreaterThan(
        40,
      );
      expect(await meta('meta[name="twitter:card"]')).toBe(
        "summary_large_image",
      );

      const image = await meta('meta[property="og:image"]');
      expect(image).toMatch(new RegExp(`^${SITE}/og/.+\\.png$`));
      const res = await request.get(new URL(image!).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    });
  }

  test("titles and descriptions are unique across pages", async ({ page }) => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const route of indexable) {
      await page.goto(route);
      titles.add(await page.title());
      descriptions.add(
        (await page
          .locator('meta[name="description"]')
          .getAttribute("content")) ?? "",
      );
    }
    expect(titles.size).toBe(indexable.length);
    expect(descriptions.size).toBe(indexable.length);
  });

  test("noindex pages have no canonical", async ({ page }) => {
    await page.goto("/styleguide");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});

test("home page has Person and WebSite structured data", async ({ page }) => {
  await page.goto("/");
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  const data = JSON.parse(raw!) as {
    "@graph": { "@type": string; name?: string; sameAs?: string[] }[];
  };
  const person = data["@graph"].find((n) => n["@type"] === "Person");
  expect(person?.name).toBe("Kyle Tranfaglia");
  expect(person?.sameAs).toContain("https://github.com/ktranfaglia1");
  expect(data["@graph"].some((n) => n["@type"] === "WebSite")).toBe(true);
});

test("robots.txt and the sitemap are served and consistent", async ({
  request,
}) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);

  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  for (const route of indexable) {
    expect(sitemap).toContain(
      `<loc>${route === "/" ? `${SITE}/` : `${SITE}${route}`}</loc>`,
    );
  }
  expect(sitemap).not.toContain("styleguide");
  expect(sitemap).not.toContain(".html");
});

test.describe("legacy redirects", () => {
  for (const [from, to] of Object.entries(legacyRedirects)) {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test("favicons are served", async ({ request }) => {
  for (const path of [
    "/favicon.svg",
    "/favicon.ico",
    "/apple-touch-icon.png",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
