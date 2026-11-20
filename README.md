# kyletranfaglia.top

Source for my personal portfolio: **[kyletranfaglia.top](https://kyletranfaglia.top)**. It covers my projects, experience, resume and contact details.

It's a fast, accessible, fully static site. Pages ship almost no JavaScript, and everything works with JavaScript turned off.

## Tech stack

- **[Astro](https://astro.build)** with **TypeScript** (strict). Static output, with content kept in typed content collections (Zod schemas) instead of being hard-coded into pages.
- **Tailwind CSS v4**, with every color, size and shadow defined as a design token in CSS variables. Light and dark themes follow the OS setting and can be switched manually.
- **React**, used for a single island: a ⌘K command palette built on `cmdk` and loaded only on first use.
- **Small vanilla scripts** for progressive enhancement: project filtering, the contact form (Formspree), theme switching, scroll reveals.
- **Build-time generation:** an Open Graph share image for every page (Satori → sharp), the favicon set, the sitemap, robots.txt and JSON-LD structured data.

## Quality

- **Tests:** Vitest unit tests for all logic in `src/lib/`. Playwright end-to-end tests for every route, including **axe** accessibility scans in both themes, layout and overflow checks, SEO metadata, and redirects from old URLs.
- **CI:** type checking, ESLint, Prettier, build and tests on every pull request, plus a Lighthouse report covering performance, accessibility, best practices and SEO.

## Getting started

You need Node 26 (see `.nvmrc`) and pnpm.

```bash
pnpm install
pnpm dev          # local dev server at http://localhost:4321
pnpm build        # static build to dist/
pnpm preview      # serve the build locally
pnpm verify       # type check, lint, format check, build, unit tests and e2e tests
```

## Project structure

```
src/
├── content/          # Projects, experience, education, skills and page copy (Markdown/MDX/YAML)
├── content.config.ts # Content schemas
├── site.config.ts    # Identity, links and site-wide settings
├── pages/            # Routes, share-image endpoints, robots.txt, legacy redirects
├── layouts/          # Base HTML shell (SEO, theme, analytics)
├── components/       # ui/, layout/, content/, page/, islands/
├── scripts/          # Progressive-enhancement scripts
├── lib/              # Pure logic with unit tests
└── styles/           # Design tokens and global styles
tests/e2e/            # Playwright suites
```

The previous version of the site is kept on the `legacy` branch.

## Author

**[Kyle Tranfaglia](https://github.com/ktranfaglia1)**: Software Engineer · [LinkedIn](https://www.linkedin.com/in/kyletranfaglia)
