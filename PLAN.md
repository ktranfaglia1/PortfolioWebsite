# Portfolio Redesign Plan

> **Status: APPROVED · Phases 0–5 done · Phase 6 (content pass) next.** Deploy approach (§7) is pending the server admin's answers.
> Branch: `redesign` · Legacy site preserved on `legacy` · Production: `main` → https://kyletranfaglia.top
> Last updated: 2026-11-19

---

## 1. Goals

- Present Kyle clearly as a **software engineer and data scientist**, with enough depth that a recruiter, an engineer, or someone reading his resume can learn his full educational and professional background.
- A modern, polished, organized, interactive UI that stays restrained.
- Content lives in data files, so updating the site never requires touching component code.
- Simple local dev, automated checks, and a deploy that's easy to hand off to the server admin.

**Audience:** recruiters and hiring managers, other engineers, and people following up on a resume.
**Positioning:** "Software Engineer · Data Scientist" is the identity. Co-founder of Pitchfire is the current role, not the identity.
Tagline source (LinkedIn): *Full-Stack Development, Data & Analytics, AI*.

---

## 2. Decisions

### Platform and tooling
| Area | Decision |
|---|---|
| Framework | **Astro + TypeScript (strict)**. React 19 only for interactive islands. Static output (`dist/`). |
| Styling | **Tailwind CSS v4 + CSS-variable design tokens**. shadcn/ui (Radix) for accessible primitives only. Motion for island animations, Astro View Transitions between pages, CSS for small effects. Lucide (UI icons) + Simple Icons (tech logos). |
| Fonts | **Geist Sans + Geist Mono**, self-hosted via Fontsource. |
| Content | **Astro content collections** with Zod schemas, validated at build time. |
| Tooling | **pnpm**, **Node 26 LTS** pinned with `.nvmrc` + `engines`. |
| Hosting | **Friend's server** (same host as Pynacle Games), behind Cloudflare. The build produces a static `dist/` that any host can serve. **How it gets built and served is pending the server admin's answers** (see §7). Nothing before Phase 7 depends on it. |
| Analytics | **Cloudflare Web Analytics** (replaces GA4): no cookies, no consent banner, tiny beacon. |
| Contact | **Formspree** (existing form ID). Submits with `fetch` and shows success/error inline, falls back to a plain HTML POST, honeypot + Formspree spam filtering. |
| Testing | **Standard.** CI on every PR (failures block the merge): `astro check`, ESLint, Prettier check, build. Vitest for `src/lib` logic. Playwright smoke test for every route + axe scan in both themes. Lighthouse CI as a non-blocking report from Phase 5. |

### Design
**Bento + polished product feel**, using the terminal-minimal type system (sans + mono accents) and restrained motion. **Dark-first design** with a light/dark toggle (first visit follows the OS setting, dark if none; the toggle remembers the choice; no flash on load). References: linear.app, raycast.com, vercel.com (feel); brittanychiang.com, leerob.com (type and restraint).

### Interactivity
⌘K command palette · light/dark toggle · project filtering (state kept in the URL) · GitHub activity (fetched at build time) · "Now" card · one small easter egg. Everything works with the keyboard and respects `prefers-reduced-motion`.

### Content
| Item | Decision |
|---|---|
| Featured projects (full case studies) | Music Painter, Pynacle Games, Celite, Transformer Chess Bot, Cambridge FEMA Tool, Sport Classification, Chess Openings & Elo |
| Standard projects (card + detail page) | CarMart (screenshots only, no longer hosted), Laridae publication ("Research & Writing") |
| Archive table (no detail pages) | Arbitrary-Length Integer Calculator, Parallel Query Parser, Spell Checker, Hill-Climb Decryption. **Poker game excluded.** |
| Pitchfire | Full experience entry + "Now" card. Logo + product screenshots (**placeholders until Kyle supplies images**). **No outbound link** (`showLink: false`, one-field toggle later). Mention New North Ventures incubation as on the resume; never name the acquiring LLC. |
| Experience page | Professional (Pitchfire, City of Cambridge) · Teaching & Tutoring (**5 separate roles**) · Leadership & Community (GullCode, ESHSCPC full; clean-up and Jaycees as one-line volunteering items) · Education & Honors (awards as a compact list) |
| Other Experience page | `/experience/other`: SoDel Concepts (role progression), Clayton Theatre, Georgia House, with a short framing intro. Linked from `/experience`. |
| Skills | Grouped like the new resume (Languages / Frontend / Backend & Data / AI & ML / Infrastructure & Tools) with icons. Soft-skills and office-software lists dropped. |
| Contact details | Email, LinkedIn (`linkedin.com/in/kyletranfaglia`), GitHub, form. **Phone not on web pages** (still in the resume PDF). |
| Resume page | HTML resume summary + **Download Resume** + **Download Transcript**, optional inline PDF preview on desktop. Hospitality resume PDF **not published**. |
| Blog | Not now. |
| Image placeholders | Any image not yet available uses a consistent, clearly labeled placeholder and is listed in `TODO(kyle)` comments plus §9. |

---

## 3. Information architecture

| Route | Contents |
|---|---|
| `/` | **Hero:** name, "Software Engineer · Data Scientist", a one-line value statement, CTAs (Projects, Resume, Contact). **Bento grid:** Now (Pitchfire), 2–3 featured projects, tech stack, education snapshot, GitHub activity, location, contact card. |
| `/projects` | Filter bar island (category + tech). Featured grid, then standard projects, then the Archive table. |
| `/projects/[slug]` | Case study: overview, role/team/timeline, stack, problem → approach → outcome, recognition (conferences), gallery, links, prev/next. |
| `/experience` | Section nav (deep links like `#teaching`); Professional; Teaching & Tutoring; Leadership & Community; Education & Honors; card linking to Other Experience. |
| `/experience/other` | Hospitality and other work, LinkedIn-style entries with role progression. |
| `/resume` | HTML resume summary, downloads, optional PDF preview. |
| `/contact` | Formspree form, email, LinkedIn, GitHub. |
| `/404` | Branded not-found page with ⌘K hint and links. |

**Global:** header nav (5 items), ⌘K palette (pages, projects, experience, actions like "copy email", "toggle theme", "download resume"), theme toggle, footer.

**Redirects** (Astro `redirects` works on any host as a fallback; real 301s are added to the server's web-server config once it's known):
`/index.html` → `/` · `/projects.html` → `/projects` · `/resume.html` → `/resume` · `/contact.html` → `/contact` · `/CarMart/*` → `/projects/carmart`

---

## 4. Content model

All content lives in `src/content/` and `src/site.config.ts`. Schemas are defined in `src/content.config.ts`. A typo, unknown value, end-before-start date, or unknown icon slug fails the build with a message naming the file and field. Pages read content through `src/lib/content.ts` (drafts filtered, sorting in one place).

**`site.config.ts`:** name, headline, tagline, location, email, socials, GitHub username, resume/transcript paths, Formspree ID, Cloudflare analytics token. The "Now" card is derived from the experience entry with `group: professional` and `end: present`, so it isn't duplicated here.

**`projects/*.mdx`** (featured/standard: frontmatter + case-study body) and **`projects/*.md`** (archive: frontmatter only). The file name is the URL slug.
```
title, summary (≤ 160 chars), tier: featured | standard | archive,
categories: [software | ai-ml | data-science | research | web],
stack: string[], role, team?: number (incl. Kyle), context?: string (course, client, internship),
start, end?: date | "present", links: { live?, repo?, paper? },
cover?: { src: image, alt }, gallery?: [{ src, alt }],
recognition?: string[], order?: number (within tier), draft?: boolean
```

**`experience/<group>/*.md`**
```
org, orgDescription?, orgUrl?, showLink (default true), orgLogo?: { src, alt }, logoPlaceholder?,
role, group: professional | teaching | leadership | volunteer | other, location?,
start, end?: date | "present", dateLabel? (overrides the formatted range),
summary, highlights: string[], skills: string[],
positions: [{ role, detail?, start?, end? }]   # role progression (e.g. SoDel)
project?: reference to a project (e.g. City of Cambridge → cambridge-fema-tool), order?, draft?
```

**`education.yaml`**: school, location, dates, degrees (name + tracks), minors, GPA, distinction, honors (title, when?, detail?).
**`skills.yaml`**: groups (label, order) → items (name, Simple Icons slug or none for a text badge).
**`pages.yaml`**: per-page title, meta description (≤ 160), heading, intro. Keeps page copy out of components.

**Images:** `src/assets/images/{projects,profile}/`, named after the content slug, downsized to ≤ 2400 px. Astro generates responsive AVIF/WebP at build time.

---

## 5. Tech stack and repo layout

- Astro (latest stable, exact version pinned at scaffold), `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`
- React 19, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui primitives, `cmdk`, Motion
- Geist Sans/Mono (Fontsource), images via `astro:assets` (AVIF/WebP, responsive `srcset`)
- TypeScript strict, ESLint, Prettier (+ Astro and Tailwind plugins), Vitest, Playwright + `@axe-core/playwright`

```
.
├── .github/workflows/ci.yml
├── deploy/                 # Phase 7: files matching the server's real setup (see §7)
├── public/                 # favicon set, robots.txt, resume/*.pdf, Laridae PDF
├── src/
│   ├── assets/images/
│   ├── components/
│   │   └── islands/        # CommandPalette (React + cmdk, Phase 4)
│   │                       # Theme toggle, mobile menu, project filter, and contact form are plain .astro
│   │                       # + small scripts in src/scripts/ (progressive enhancement, no React runtime)
│   ├── content/            # projects/, experience/, education.yaml, skills.yaml
│   ├── content.config.ts
│   ├── layouts/
│   ├── lib/                # pure helpers, unit-tested
│   ├── pages/
│   ├── styles/global.css   # Tailwind + design tokens
│   └── site.config.ts
├── tests/e2e/
├── CLAUDE.md
├── DEPLOY.md               # handoff for the server admin
└── PLAN.md
```

**Scripts:** `dev`, `build`, `preview`, `check`, `lint`, `format`, `test`, `test:e2e`, `verify` (runs all of them in order; it's not named `ci` because `pnpm ci` is a built-in pnpm command).

---

## 6. Prerequisites (local)

- **Node 26** via nvm (already installed): `nvm use` reads `.nvmrc`.
- **pnpm**: `npm i -g pnpm` (one time). Corepack no longer ships with Node 25+.
- **Playwright browser** (one time, for e2e tests): `pnpm exec playwright install chromium`. Then install the Linux libraries Chromium needs: `pnpm exec playwright install-deps --dry-run chromium` lists the packages, and you install them with `sudo apt-get install`. Don't run pnpm under `sudo`: sudo's PATH picks up the system Node 12 instead of nvm's Node 26.
- **Pinned on purpose:** TypeScript **6.0.x**, because `astro check` and typescript-eslint don't support TypeScript 7 yet. Revisit when they do.
- **No Docker needed.** `pnpm build && pnpm preview` serves the production build locally.

---

## 7. Deployment (friend's Docker server)

**What changes and why:** the old site was plain files that the server could serve directly after `git pull`. The new site must be **built** first (`pnpm build` → `dist/`). Serving the repo as-is would publish source code, not the site.

**What's known vs. assumed:**
- *Known:* the server pulls `main` daily and serves the old site. Pynacle Games (Vite + React) runs on it, and its repo does not commit `dist/`, so it's built somewhere outside GitHub.
- *Unknown:* whether the server itself runs builds, whether it uses Docker, and which web server it uses. The PynacleGamesWebsite repo has no Docker or server config.

**Questions for the server admin** (Kyle asks before Phase 7):
1. How does Pynacle Games get from GitHub to live? Do you run `npm run build` on the server, or is it built somewhere else?
2. Is Node installed on the server, or do sites run in Docker containers?
3. What serves the sites: nginx, Caddy, Apache, something else?
4. What runs the daily pull (cron, a script, a container), and could it run a build command too?

**Candidate approaches** (pick one from the answers):

| If the server… | Approach | Admin's change |
|---|---|---|
| builds Pynacle Games itself (Node available) | Same as Pynacle Games: pull → `pnpm install --frozen-lockfile && pnpm build` → serve `dist/` | Add a build step and point the web root at `dist/` |
| runs sites in Docker | Repo ships a Dockerfile (Node build stage → static web server) | Build and run the image |
| should only pull static files, as it does today | A GitHub Action builds on every push to `main` and commits `dist/` to a `deploy` branch | Pull the `deploy` branch instead of `main`. Nothing else changes. |

**Fallback if the admin is hard to reach:** the GitHub Action `deploy` branch needs the smallest change on his side (a branch name) and nothing on the server has to change. It's also a good default because it doesn't depend on any of the unknowns.

**Either way (server requirements for DEPLOY.md):**
- Serve `dist/` as-is with clean URLs: `/projects` → `dist/projects/index.html` **without** a trailing-slash redirect (nginx: `try_files $uri $uri/index.html =404;`). Canonicals and the sitemap use no trailing slash.
- Serve `dist/404.html` with status 404 for unknown paths (it also forwards old `.html` URLs).
- 301s from `src/lib/redirects.ts`: `/projects.html` → `/projects`, `/resume.html` → `/resume`, `/contact.html` → `/contact`, `/CarMart/*` → `/projects/carmart`.
- Cache headers: `/_astro/*` is content-hashed (cache 1 year, immutable); HTML, `/og/*`, and PDFs short or revalidate.
- Optional `GITHUB_TOKEN` (read-only) for the contribution heatmap: a build secret wherever the build runs. Without it, the build still succeeds and the heatmap is hidden.
- Cloudflare: DNS and proxy stay as they are. Purge the cache once after cutover. Enable Web Analytics in the dashboard.
- Rollback: redeploy the previous build, or as a last resort the `legacy` branch.

**`DEPLOY.md`** is written for the server admin (Kyle's friend) once the approach is chosen. It covers what changed, the exact commands, the update and rollback steps, and what to check after cutover.

**Previews:** there are no hosted PR previews on this setup. Review happens locally with `pnpm dev` / `pnpm preview`. CI still runs on every PR.

---

## 8. Phases

Each phase ends with a commit on `redesign` and a short review. ★ marks phases where Kyle approves before work continues.

**Phase 0: Foundation**
- Remove the legacy files from the `redesign` branch (kept on `legacy` and in history; needed assets are copied in Phase 2).
- Scaffold Astro (TS strict) with React, MDX, Tailwind v4, ESLint, Prettier, Vitest, Playwright.
- `.nvmrc`, `engines`, `.gitignore` (including `*:Zone.Identifier`).
- CI workflow, CLAUDE.md.

**Phase 1: Design system ★**
- Tokens (dark default + light), type scale, spacing, radius, motion.
- No-flash theme script and toggle.
- Layout shell (header, footer, skip link).
- Base components: Button, Tag, Card, BentoCell, Section, TimelineItem, ImagePlaceholder.
- An unindexed `/styleguide` page for review.

**Phase 2: Content layer**
- Schemas.
- Migrate and rewrite existing content into concise data files.
- Add the new resume content (Pitchfire, 5 separate tutoring and teaching roles, hospitality).
- Optimize and rename images, with placeholders where images are missing.

**Phase 3: Pages ★**
- Home bento, Projects + filter, project detail template, Experience, Other Experience, Resume, Contact, 404.
- All responsive and accessible.

**Phase 4: Interactivity** ✅
- ⌘K palette (React + cmdk, **lazy-loaded on first open**: pages ship ~4 KB of JS up front).
- GitHub activity heatmap (build-time GraphQL, needs `GITHUB_TOKEN`; **behind `showGitHubActivity`, off** because the public graph doesn't reflect recent work).
- Card spotlight, scroll reveals (off for reduced motion and without JS), Konami-code accent easter egg + console greeting.
- **Native cross-document View Transitions** (CSS only) instead of Astro's ClientRouter, so existing scripts keep working; unsupported browsers navigate normally.

**Phase 5: SEO and quality** ✅
- Canonical URLs (no trailing slash), OG/Twitter tags, build-time OG images (Satori → sharp) for every page, KT favicon set (`pnpm icons`).
- Sitemap (public pages only), robots.txt, `Person` + `WebSite` JSON-LD on home, Cloudflare beacon (loads once the token is set).
- Legacy URLs: static redirect pages under `/CarMart/`; root `.html` URLs forwarded by the 404 page (static files there would shadow clean URLs). Real 301s go in the server config.
- Lighthouse CI (mobile, non-blocking in CI): Performance 97–100, Accessibility/Best Practices/SEO 100, CLS 0 on every page. LCP < 2s everywhere except `/projects` (≈2.4s simulated slow 4G; font preloads trade a little LCP for zero layout shift).

**Phase 6: Final content pass**
- Kyle supplies updated content and images (Pitchfire logo and screenshots, anything else marked `TODO(kyle)`).
- Proofreading. Check every link.

**Phase 7: Launch ★**
- **Before this phase:** Kyle gets the server admin's answers to the §7 questions and picks the deploy approach.
- Add the matching deploy files and write `DEPLOY.md`. Kyle sends it to the server admin.
- Merge `redesign` → `main`. The admin applies the change.
- Purge the Cloudflare cache.
- Verify pages, redirects, form, analytics, OG previews (LinkedIn Post Inspector), and Lighthouse on production.

---

## 9. Quality checklist (definition of done)

- [ ] WCAG 2.2 AA: contrast in both themes, visible focus, full keyboard use, skip link, landmarks, alt text, reduced motion, no auto-advancing content
- [ ] Lighthouse ≥ 95 (Performance, Accessibility, Best Practices, SEO) on mobile for every page
- [ ] LCP < 2s · CLS < 0.05 · INP < 200ms · Home JS < 100 KB gzipped
- [ ] Unique title and description on every page · canonical URLs · OG/Twitter images · sitemap · robots.txt · JSON-LD · 404 page · old-URL redirects
- [ ] Layout verified at 360, 768, 1024, 1440, 1920 px; no horizontal scroll
- [ ] CI green: check, lint, format, build, unit tests, e2e + axe
- [ ] Production build works from a clean clone using the chosen deploy approach; clean URLs, 404, and old-URL redirects work on the live server

### Assets Kyle will supply (placeholders until then)
- [ ] Pitchfire logo (SVG preferred) and 2–4 product screenshots
- [ ] Updated headshot (optional; the current `Headshot.jpg` is used otherwise)
- [ ] Replacement screenshots (flagged in Phase 2): **Pynacle Games** (current image is only a Snake game-over screen), **Sport Classification** and **Chess Openings & Elo** (current images are paper title pages; a chart from each analysis would be better)
- [ ] Confirm dates and one-line summaries for the four archive projects (marked `TODO(kyle)`)

---

## Appendix: Draft CLAUDE.md (created in Phase 0)

```markdown
# Kyle Tranfaglia — Portfolio

Astro + TypeScript static site. React only for interactive islands. Tailwind v4 with CSS-variable tokens.
Node 26 (`nvm use`), pnpm. See PLAN.md for decisions and phases.

## Commands
- `pnpm dev` — local dev server
- `pnpm build` / `pnpm preview` — production build and local preview
- `pnpm verify` — check + lint + format check + build + unit + e2e (run before every commit)

## Content rules
- All copy lives in `src/content/` and `src/site.config.ts`. Never hard-code copy in components.
- Schema changes go through `src/content.config.ts`.
- Missing images use `<ImagePlaceholder>` and get a `TODO(kyle)` comment.

## Conventions
- `.astro` components by default; React only in `src/components/islands/`, hydrated with the lightest `client:*` directive that works.
- Style with Tailwind utilities that reference design tokens; no raw hex values in components.
- Pure logic goes in `src/lib/` with Vitest tests.

## Guardrails
- Home page JS budget: < 100 KB gzipped. Check accessibility in both themes; respect `prefers-reduced-motion`.
- Pitchfire: no outbound link while `showLink: false`; never name the acquiring LLC.
- No phone number on web pages. Don't commit secrets or `*:Zone.Identifier` files.
- The build must stay a plain static `dist/`. When routes change, update the redirects and the files in `deploy/` (see DEPLOY.md).

## Workflow
- Work on `redesign` (or feature branches off it). Never push to `main` without Kyle's approval.
```
