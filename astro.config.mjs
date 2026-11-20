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
  integrations: [
    react(),
    mdx(),
    sitemap({
      // Internal review pages stay out of search.
      filter: (page) => !page.includes("/styleguide"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
