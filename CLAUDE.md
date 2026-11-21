# Kyle Tranfaglia — Portfolio

Astro + TypeScript static site. React only for interactive islands. Tailwind v4 with CSS-variable tokens.
Node 26 (`nvm use`), pnpm. **See PLAN.md** for all decisions, the phase plan, and current status.

## Commands
- `pnpm dev` — local dev server (for agents: `pnpm astro dev --background`, then `pnpm astro dev status | logs | stop`)
- `pnpm build` / `pnpm preview` — production build to `dist/` and local preview
- `pnpm verify` — check + lint + format check + build + unit + e2e. Run before every commit. (Not `pnpm ci`: that's a built-in pnpm command that reinstalls dependencies.)
- `pnpm format` — apply Prettier
- E2E tests run against `astro preview` on port 4322 with `--ignore-lock`, so build first. (Astro 7 auto-backgrounds `preview`/`dev` when it detects an AI agent; `--ignore-lock` keeps the test server in the foreground and avoids colliding with a running `pnpm dev`.)

## Content rules
- All copy lives in `src/content/` and `src/site.config.ts`. Never hard-code sentences in components; short UI labels ("Now", "Send message", "All projects") are fine.
- Schema changes go through `src/content.config.ts`; the field reference is PLAN.md §4. Pages read content through `src/lib/content.ts`, not `getCollection` directly.
- Page titles, meta descriptions, and intros live in `src/content/pages.yaml`.
- Images go in `src/assets/images/` (named after the content slug) and render with `astro:assets` `<Image>`, never from `public/`. Only downloadable files (PDFs) live in `public/`.
- Missing images use `<ImagePlaceholder>` and get a `TODO(kyle)` comment. `grep -rn "TODO(kyle)" src` lists everything Kyle still owes.
- `reference/` (git-ignored) holds private source material such as the hospitality resume. Use it for writing content; never publish or commit it.

## Conventions
- `.astro` components by default; React only in `src/components/islands/`, hydrated with the lightest `client:*` directive that works. Small behaviors (filter, form, toggle) are plain scripts in `src/scripts/` that enhance server-rendered HTML, so pages work without JS.
- Components: `ui/` (generic), `layout/` (shell), `content/` (render one content entry: ProjectCard, ExperienceItem, SkillTag), `page/` (page chrome: PageHeader).
- Absolutely positioned children (e.g. `sr-only` text) inside an `overflow-x-auto` box escape it unless the box is `relative`, causing page-wide horizontal scroll.
- Style with Tailwind utilities that reference design tokens; no raw hex values in components. Exceptions: `src/lib/og.ts` and `scripts/generate-icons.ts` (Satori can't read CSS variables; keep their hex in sync with the dark tokens) and the `theme-color` metas.
- Pure logic goes in `src/lib/` with Vitest tests next to it (`*.test.ts`).
- New routes get added to `tests/e2e/routes.ts` (case studies are picked up automatically). New pages also need an OG card in `src/pages/og/[...slug].png.ts` and copy in `pages.yaml`; the SEO tests check unique titles/descriptions and working share images.
- URLs never end in a slash (`trailingSlash: "never"`). Old-site URLs live in `src/lib/redirects.ts`; never emit a root-level `<name>.html` file (it shadows `<name>/index.html` on many servers).
- `pnpm lighthouse` (after `pnpm build`; set `CHROME_PATH` to Playwright's Chromium locally) audits mobile performance. Under WSL it leaves `C:\Users\...\lighthouse.*` Chrome profile folders in the repo (git-ignored; safe to `rm -rf ./C:*`). Above-the-fold images: `loading="eager"`, `fetchpriority="high"`, and no `data-reveal`.
- Whitespace between an `{expression}` and a following element can be dropped by the Astro compiler, and Prettier rewrites `{" "}` back to a plain space. Put separators inside a string expression instead: `<span>{` · ${org}`}</span>`.
- Editorial layout (Phase 5.5): the container is wide by default (`--container-max` 110rem, fluid `--gutter`); body text keeps a ~68ch measure. `Section` takes `eyebrow` (usually "01"), `split` (header in a sticky left column) and `rule`. `PageHeader` and copy in `pages.yaml` take a `headline` where one *asterisk-wrapped* phrase renders in the serif italic (`AccentText`, Instrument Serif; accents only). Featured projects render as `ProjectRow`; case-study MDX can import `FlowDiagram` (steps and caption passed as props, so copy stays in the MDX); /experience opens with `CareerGraph` (lane logic in `src/lib/career-graph.ts`). `tests/e2e/viewports.spec.ts` checks every route for horizontal overflow at 390/1280/1440/1920/2560px.
- Design tokens live in `src/styles/global.css`. Tailwind's default palette is disabled, so only semantic colors exist (`bg-canvas`, `bg-surface`, `text-fg-muted`, `border-line`, `bg-accent`, ...). Review components on `/styleguide` (noindex, not in the sitemap).
- Interaction hooks: `data-reveal` (scroll fade-in; `Card reveal={n}` staggers), `data-spotlight` (cursor glow), `data-palette-trigger` (opens ⌘K). Palette items come from `src/lib/palette.ts`; keep long text out of `keywords` (cmdk's fuzzy match makes it match everything).
- Accessibility tests run axe with reduced motion so reveal-hidden content is still checked.
- Theme: follows the OS setting until the toggle saves a choice (dark if no OS preference); `<html data-theme>` is set before paint by the inline script in `BaseLayout.astro`; changes go through `src/scripts/theme.ts`.

## Guardrails
- Home page JS budget: < 100 KB gzipped. Check accessibility in both themes; respect `prefers-reduced-motion`.
- Pitchfire: no outbound link while `showLink: false`; never name the acquiring LLC.
- No phone number on web pages. Don't commit secrets or `*:Zone.Identifier` files.
- The build must stay a plain static `dist/`. When routes change, update the redirects and the files in `deploy/` (see PLAN.md §7).
- `GITHUB_TOKEN` (optional, build-time) feeds the GitHub heatmap; without it the card is skipped and the build still succeeds. Never commit a token.
- Pinned versions: TypeScript stays on 6.0.x until `astro check` and typescript-eslint support 7. `pnpm-workspace.yaml` allows eslint-plugin-jsx-a11y's outdated ESLint peer range.

## Workflow
- Work on `redesign` (or feature branches off it). Never push to `main` without Kyle's approval.

## Astro docs (check before related work)
- Routing: https://docs.astro.build/en/guides/routing/
- Framework components (React islands): https://docs.astro.build/en/guides/framework-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling / Tailwind: https://docs.astro.build/en/guides/styling/
