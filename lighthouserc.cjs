/**
 * Lighthouse CI: mobile audits of every page type against the built site.
 * Non-blocking in CI (reports only); targets are in PLAN.md §9.
 * Run locally: pnpm build && pnpm lighthouse
 */
const port = 4325;
const pages = [
  "/",
  "/projects",
  "/projects/music-painter",
  "/experience",
  "/experience/other",
  "/resume",
  "/contact",
];

module.exports = {
  ci: {
    collect: {
      startServerCommand: `pnpm preview --host 127.0.0.1 --port ${port} --ignore-lock`,
      startServerReadyPattern: "Local|localhost|127\\.0\\.0\\.1",
      url: pages.map((p) => `http://127.0.0.1:${port}${p}`),
      numberOfRuns: 1,
      settings: { chromeFlags: "--headless=new --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.95 }],
        "categories:accessibility": ["warn", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.95 }],
        "categories:seo": ["warn", { minScore: 0.95 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.05 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
