import { readdirSync } from "node:fs";

/** Case-study slugs: featured and standard projects are .mdx files. */
export const caseStudies = readdirSync("src/content/projects")
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => `/projects/${f.replace(/\.mdx$/, "")}`);

/** Every public route. New pages go here. */
export const routes = [
  "/",
  "/projects",
  "/experience",
  "/experience/other",
  "/resume",
  "/contact",
  "/styleguide",
  ...caseStudies,
];
