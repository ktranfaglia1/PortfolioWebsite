# Kyle Tranfaglia — Portfolio

Astro + TypeScript static site. React only for interactive islands. Tailwind v4 with CSS-variable tokens.
Node 26 (`nvm use`), pnpm. The original redesign plan (decisions, phases, content-model field reference) is in `reference/PLAN.md`: private and git-ignored, so never commit it. The plan is complete; treat it as history.

## Commands

- `pnpm dev` — local dev server (for agents: `pnpm astro dev --background`, then `pnpm astro dev status | logs | stop`)
- `pnpm build` / `pnpm preview` — production build to `dist/` and local preview
- `pnpm verify` — check + lint + format check + build + unit + e2e. Run before every commit. (Not `pnpm ci`: that's a built-in pnpm command that reinstalls dependencies.)
- `pnpm format` — apply Prettier
- After a content schema change (`src/content.config.ts`), delete `.astro/data-store.json` and restart `pnpm dev`. The dev server caches parsed entries by file hash, so entries saved under the old schema keep stale data (new fields missing) until the cache is cleared. Builds use a separate cache in `node_modules/.astro/` and aren't affected.
- E2E tests run against `astro preview` on port 4322 with `--ignore-lock`, so build first. (Astro 7 auto-backgrounds `preview`/`dev` when it detects an AI agent; `--ignore-lock` keeps the test server in the foreground and avoids colliding with a running `pnpm dev`.)

## Content rules

- All copy lives in `src/content/` and `src/site.config.ts`. Never hard-code sentences in components; short UI labels ("Now", "Send message", "All projects") are fine.
- Schema changes go through `src/content.config.ts`; the field reference is `reference/PLAN.md` §4 (the schemas themselves are the source of truth). Pages read content through `src/lib/content.ts`, not `getCollection` directly.
- Page titles, meta descriptions, and intros live in `src/content/pages.yaml`.
- Images go in `src/assets/images/` (named after the content slug) and render with `astro:assets` `<Image>`, never from `public/`. Only downloadable files (PDFs) live in `public/`.
- Missing images use `<ImagePlaceholder>` and get a `TODO(kyle)` comment. `grep -rn "TODO(kyle)" src` lists everything Kyle still owes.
- `reference/` (git-ignored) holds private source material such as the hospitality resume. Use it for writing content; never publish or commit it.

## Conventions

- `.astro` components by default; React only in `src/components/islands/`, hydrated with the lightest `client:*` directive that works. Small behaviors (filter, form, toggle) are plain scripts in `src/scripts/` that enhance server-rendered HTML, so pages work without JS.
- Components: `ui/` (generic), `layout/` (shell), `content/` (render one content entry: ProjectRow, ExperienceItem, SkillTag), `page/` (page chrome: PageHeader).
- Absolutely positioned children (e.g. `sr-only` text) inside an `overflow-x-auto` box escape it unless the box is `relative`, causing page-wide horizontal scroll.
- Style with Tailwind utilities that reference design tokens; no raw hex values in components. Exceptions: `src/lib/og.ts` and `scripts/generate-icons.ts` (Satori can't read CSS variables; keep their hex in sync with the dark tokens) and the `theme-color` metas.
- Pure logic goes in `src/lib/` with Vitest tests next to it (`*.test.ts`).
- New routes get added to `tests/e2e/routes.ts` (case studies are picked up automatically). New pages also need an OG card in `src/pages/og/[...slug].png.ts` and copy in `pages.yaml`; the SEO tests check unique titles/descriptions and working share images.
- URLs never end in a slash (`trailingSlash: "never"`). Old-site URLs live in `src/lib/redirects.ts`; never emit a root-level `<name>.html` file (it shadows `<name>/index.html` on many servers).
- `pnpm lighthouse` (after `pnpm build`; set `CHROME_PATH` to Playwright's Chromium locally) audits mobile performance. Under WSL it leaves `C:\Users\...\lighthouse.*` Chrome profile folders in the repo (git-ignored; safe to `rm -rf ./C:*`). Above-the-fold images: `loading="eager"`, `fetchpriority="high"`, and no `data-reveal`.
- Whitespace between an `{expression}` and a following element can be dropped by the Astro compiler, and Prettier rewrites `{" "}` back to a plain space. Put separators inside a string expression instead: `<span>{` · ${org}`}</span>`.
- Editorial layout (Phase 5.5): the container is wide by default (`--container-max` 110rem, fluid `--gutter`); body text keeps a ~68ch measure (exception: experience timeline entries use `max-w-4xl`, since their bullets are short). `Section` takes `eyebrow` (usually "01"), `split` (header in a sticky left column), `rule`, and (non-split only) an `action` slot for a right-aligned header link. `PageHeader` and copy in `pages.yaml` take a `headline` where one _asterisk-wrapped_ phrase renders in the serif italic (`AccentText`, Instrument Serif; accents only). Featured projects render as `ProjectRow`; case-study MDX can import `FlowDiagram` (steps and caption passed as props, so copy stays in the MDX) and `CaseFigure` (an imported screenshot placed inside the section it illustrates; keep it out of `gallery` to avoid showing it twice); the contents sidebar highlights the current section (`src/scripts/toc.ts`); experience logos render through `OrgLogo` (white tile; `orgLogo.bleed` fills it; an icon per group when there's no logo); /experience opens with `CareerGraph` (lane logic in `src/lib/career-graph.ts`). `tests/e2e/viewports.spec.ts` checks every route for horizontal overflow at 390/1280/1440/1920/2560px.
- Design tokens live in `src/styles/global.css`. Tailwind's default palette is disabled, so only semantic colors exist (`bg-canvas`, `bg-surface`, `text-fg-muted`, `border-line`, `bg-accent`, ...). Review components on `/styleguide` (noindex, not in the sitemap).
- Interaction hooks: `data-reveal` (scroll fade-in; `Card reveal={n}` staggers), `data-spotlight` (cursor glow), `data-palette-trigger` (opens ⌘K). Palette items come from `src/lib/palette.ts`; keep long text out of `keywords` (cmdk's fuzzy match makes it match everything).
- Accessibility tests run axe with reduced motion so reveal-hidden content is still checked.
- Theme: follows the OS setting until the toggle saves a choice (dark if no OS preference); `<html data-theme>` is set before paint by the inline script in `BaseLayout.astro`; changes go through `src/scripts/theme.ts`.

## Guardrails

- Home page JS budget: < 100 KB gzipped. Check accessibility in both themes; respect `prefers-reduced-motion`.
- Pitchfire: no outbound link while `showLink: false`; never name the acquiring LLC.
- No phone number on web pages. Don't commit secrets or `*:Zone.Identifier` files.
- The build must stay a plain static `dist/`. When routes change, update the redirects and the server configs in README.md ("Running it on a server"). `scripts/deploy.sh` is what the server runs to build and swap `dist/`.
- `GITHUB_TOKEN` (optional, build-time) feeds the GitHub heatmap; without it the card is skipped and the build still succeeds. Never commit a token.
- Pinned versions: TypeScript stays on 6.0.x until `astro check` and typescript-eslint support 7. `pnpm-workspace.yaml` allows eslint-plugin-jsx-a11y's outdated ESLint peer range.

## Workflow

- Work on `redesign` (or feature branches off it). Never push to `main` without Kyle's approval.

## Astro docs (check before related work)

- Routing: https://docs.astro.build/en/guides/routing/
- Framework components (React islands): https://docs.astro.build/en/guides/framework-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling / Tailwind: https://docs.astro.build/en/guides/styling/
