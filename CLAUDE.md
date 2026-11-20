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
- All copy lives in `src/content/` and `src/site.config.ts`. Never hard-code copy in components.
- Schema changes go through `src/content.config.ts`; the field reference is PLAN.md §4. Pages read content through `src/lib/content.ts`, not `getCollection` directly.
- Page titles, meta descriptions, and intros live in `src/content/pages.yaml`.
- Images go in `src/assets/images/` (named after the content slug) and render with `astro:assets` `<Image>`, never from `public/`. Only downloadable files (PDFs) live in `public/`.
- Missing images use `<ImagePlaceholder>` and get a `TODO(kyle)` comment. `grep -rn "TODO(kyle)" src` lists everything Kyle still owes.
- `reference/` (git-ignored) holds private source material such as the hospitality resume. Use it for writing content; never publish or commit it.

## Conventions
- `.astro` components by default; React only in `src/components/islands/`, hydrated with the lightest `client:*` directive that works.
- Style with Tailwind utilities that reference design tokens; no raw hex values in components.
- Pure logic goes in `src/lib/` with Vitest tests next to it (`*.test.ts`).
- New routes get added to the `routes` list in `tests/e2e/smoke.spec.ts`.
- Whitespace between an `{expression}` and a following element can be dropped by the Astro compiler, and Prettier rewrites `{" "}` back to a plain space. Put separators inside a string expression instead: `<span>{` · ${org}`}</span>`.
- Design tokens live in `src/styles/global.css`. Tailwind's default palette is disabled, so only semantic colors exist (`bg-canvas`, `bg-surface`, `text-fg-muted`, `border-line`, `bg-accent`, ...). Review components on `/styleguide` (noindex, not in the sitemap).
- Theme: follows the OS setting until the toggle saves a choice (dark if no OS preference); `<html data-theme>` is set before paint by the inline script in `BaseLayout.astro`; changes go through `src/scripts/theme.ts`.

## Guardrails
- Home page JS budget: < 100 KB gzipped. Check accessibility in both themes; respect `prefers-reduced-motion`.
- Pitchfire: no outbound link while `showLink: false`; never name the acquiring LLC.
- No phone number on web pages. Don't commit secrets or `*:Zone.Identifier` files.
- The build must stay a plain static `dist/`. When routes change, update the redirects and the files in `deploy/` (see PLAN.md §7).
- Pinned versions: TypeScript stays on 6.0.x until `astro check` and typescript-eslint support 7. `pnpm-workspace.yaml` allows eslint-plugin-jsx-a11y's outdated ESLint peer range.

## Workflow
- Work on `redesign` (or feature branches off it). Never push to `main` without Kyle's approval.

## Astro docs (check before related work)
- Routing: https://docs.astro.build/en/guides/routing/
- Framework components (React islands): https://docs.astro.build/en/guides/framework-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling / Tailwind: https://docs.astro.build/en/guides/styling/
