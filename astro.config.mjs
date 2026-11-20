// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://kyletranfaglia.top",
  // Static output: every page is emitted as `<route>/index.html` in dist/.
  output: "static",
  // URLs have no trailing slash (/projects). Canonicals and the sitemap match;
  // the server should serve <route>/index.html without redirecting (DEPLOY.md).
  trailingSlash: "never",
  integrations: [
    react(),
    mdx(),
    sitemap({
      // Review pages, the 404, and legacy redirect pages stay out of search.
      filter: (page) =>
        !/\/(styleguide|404)$/.test(page) &&
        !page.endsWith(".html") &&
        !page.includes("/CarMart"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
