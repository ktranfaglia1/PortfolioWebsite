import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default defineConfig([
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "playwright-report/",
      "test-results/",
      "reference/",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  // Accessibility rules for markup in .astro files
  astro.configs["jsx-a11y-recommended"],
  // Accessibility rules for React islands
  {
    files: ["**/*.{jsx,tsx}"],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]);
