# Portfolio Redesign Plan

> **Status: APPROVED · Phases 0–5 done · Redesign detour (Phase 5.5): R1–R6 done 2026-11-21 (Kyle picked A, with B's commit graph on /experience). Phase 6 done 2026-11-21 apart from the items Kyle owes. Phase 7 (launch) next.** Deploy approach (§7) is pending the server admin's answers.
> Branch: `redesign` · Legacy site preserved on `legacy` · Production: `main` → https://kyletranfaglia.top
> Last updated: 2026-11-21

---

## 1. Goals

- Present Kyle clearly as a **software engineer and data scientist**, with enough depth that a recruiter, an engineer, or someone reading his resume can learn his full educational and professional background.
- A modern, polished, organized, interactive UI that stays restrained.
- Content lives in data files, so updating the site never requires touching component code.
- Simple local dev, automated checks, and a deploy that's easy to hand off to the server admin.

**Audience:** recruiters and hiring managers, other engineers, and people following up on a resume.
**Positioning:** "Software Engineer" is the identity (decided 2026-11-20, Phase 5.5). Data science stays visible through the dual degree, the Data & ML project category and the case studies, not the title. Co-founder of Pitchfire is the current role, not the identity.
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
| `/` | **Hero:** name, "Software Engineer", a one-line value statement, CTAs (Projects, Resume, Contact). **Bento grid:** Now (Pitchfire), 2–3 featured projects, tech stack, education snapshot, GitHub activity, location, contact card. |
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
stack: string[], role, team?: number (incl. Kyle), teamLabel?: string (overrides the team label), context?: string (course, client, internship),
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

**Either way (server requirements, written up in the README):**
- Serve `dist/` as-is with clean URLs: `/projects` → `dist/projects/index.html` **without** a trailing-slash redirect (nginx: `try_files $uri $uri/index.html =404;`). Canonicals and the sitemap use no trailing slash.
- Serve `dist/404.html` with status 404 for unknown paths (it also forwards old `.html` URLs).
- 301s from `src/lib/redirects.ts`: `/projects.html` → `/projects`, `/resume.html` → `/resume`, `/contact.html` → `/contact`, `/CarMart/*` → `/projects/carmart`.
- Cache headers: `/_astro/*` is content-hashed (cache 1 year, immutable); HTML, `/og/*`, and PDFs short or revalidate.
- Optional `GITHUB_TOKEN` (read-only) for the contribution heatmap: a build secret wherever the build runs. Without it, the build still succeeds and the heatmap is hidden.
- Cloudflare: DNS and proxy stay as they are. Purge the cache once after cutover. Web Analytics is already on with automatic setup (Cloudflare injects the beacon into proxied HTML), so `cloudflareAnalyticsToken` stays empty. This needs the record proxied (orange cloud) and HTML served without `Cache-Control: no-transform`.
- Rollback: redeploy the previous build, or as a last resort the `legacy` branch.

**Decided 2026-11-22:** the admin asked for a detailed README instead of answering the questions above. The README's "Running it on a server" section is the handoff: requirements, build commands (host or Docker), `scripts/deploy.sh` (fetch → build into `.build-tmp/` → swap into `dist/`, keeping `dist.prev/` for `rollback`; no-op when `main` hasn't changed; `flock` guards overlapping runs), Apache and nginx configs for the requirements above, post-deploy curl checks, and the cutover order. Tested on a fresh clone; the Apache/nginx configs couldn't be tested locally (neither is installed).

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

**Phase 5.5: Redesign detour ★** (approved 2026-11-20; runs before Phase 6)

Kyle's review of Phases 1–5: the design lacks character, looks templated and too corporate, and uses space oddly. It reads as a phone layout scaled up rather than one that uses large screens. **Priority viewports:** laptops and monitors from 12" to 30" (about 1,280–2,560 CSS px) and phones (about 390px).

Diagnosis:
- Every page sits in a 1,152px column (`max-w-6xl`), which fills only 45–60% of a 1080p or 1440p monitor.
- Every element is the same bordered card with the same mono label, so nothing stands out.
- Nothing in the visual language is specific to Kyle.
- The "KT kyle.tranfaglia" header wordmark reads as an account badge.

- **R1. Identity.**
  - Header: the full name replaces the KT chip and handle (KT stays as the favicon).
  - Headline: **"Software Engineer"** (decided 2026-11-20). Data science shows through the degree, the Data & ML category and the case studies.
- **R2. Design direction ★.**
  - Kyle wants a modern, less corporate look with subtle character and colour. Reference: Folitox's free developer templates (inspiration only; no copying of a specific template, its layout or its assets).
  - Shared by both prototypes:
    - The violet accent stays, with a warm secondary glow (amber or ember) behind the hero.
    - Display headlines with one serif-italic accent word.
    - Numbered sections (01, 02, …).
    - Fewer bordered boxes; hierarchy comes from layout, size and spacing.
    - No heavy 3D or WebGL: the JS budget and Lighthouse targets still apply.
  - **Prototype A: "Editorial."**
    - A wide asymmetric hero with a warm glow.
    - Numbered sections.
    - Case-study teasers in the Casebook style: a typographic cover, an outcome strip of real figures, a link to a long-form page with a sticky table of contents.
  - **Prototype B: "Commit log."**
    - Experience drawn as a git branch graph: roles are commits on a coloured branch, and education merges in from its own branch.
    - Skills shown as a contribution-style grid.
    - Mono annotations, while staying readable for recruiters.
  - Both live on a noindex scratch route (`/lab/a`, `/lab/b`), using real content, screenshotted at 1,280, 1,440, 1,920, 2,560 and 390px. Kyle picks one, or a mix; Casebook-style case-study pages (sticky table of contents, outcome strip) carry over to R4 whichever wins.
- **R3. Layout system.** ✅ Done 2026-11-20 (wide container by default; overflow checks at five widths).
  - Content widens to about 1,440–1,600px with fluid gutters, and type scales fluidly from 1,280 to 2,560px.
  - Body text stays about 70ch wide; the extra width goes to layout (multi-column grids, sticky side columns).
  - Phones get a deliberately designed layout.
  - Add Playwright screenshot checks at the priority viewports.
- **R4. Apply.** ✅ Done 2026-11-20: A's editorial system on every page, B's commit graph on /experience, /lab removed, bento components retired.
  - Update tokens, components and `/styleguide` first.
  - Then the pages in order: Home, Projects, Case study, Experience, Resume, Contact, 404.
- **R5. Content depth and accuracy.** ✅ Done 2026-11-21.
  - Done:
    - New Pitchfire case study (`projects/pitchfire.mdx`, featured, first), written from LinkedIn and the Pitchfire docs in `reference/` (feature overview, security overview, tech stack, privacy review notes). It has no links and doesn't name the acquiring LLC. The experience entry links to it and is regrouped under LinkedIn's four engineering pillars.
    - Home intro and About narrative now tell the story: systems thinking, Pitchfire, the Salisbury research work and tutoring, then hospitality.
    - Teaching details from LinkedIn: Calculus SI pass rate up more than 10%, lab-assistant goal. The Clayton Theatre description was updated too.
  - Writing rules for Pitchfire, from the privacy review notes: no absolute claims (not "every AI write is confirmed", "no cross-firm leakage", or "all links expire"). Keep security high-level, with no thresholds or internal file paths.
  - Gap list (Kyle):
    - ~~Pitchfire screenshots and logo~~ and ~~origin wording~~: done in Phase 6.
    - Review the home About copy and page headlines (`pages.yaml`).
    - The resume PDF's Pitchfire section is unchanged. It already matched the site's figures.
  - Sources:
    - The repos, which now all have READMEs written from their code, papers and commit history (pushed 2026-11-20).
    - The `legacy` branch.
    - Both resumes.
    - Kyle's LinkedIn export in `reference/`: About text, detailed experience, projects. The export includes Kyle's home address and birthday; never publish them.
  - Produce a gap list for each entry, then expanded copy. Anything inferred gets `TODO(kyle): confirm`.
  - Add a short About narrative on the home page, built on LinkedIn's "a software engineer who thinks in systems" framing.
  - Expand Pitchfire from LinkedIn: the startup and investor workspaces and the engineering pillars (architecture, AI systems, reliability, connected workflows). No outbound link; never name the acquiring LLC.
  - Expand the tutoring, teaching and hospitality entries from the LinkedIn descriptions:
    - Math Emporium: more than 1,000 students.
    - Calculus SI: course pass rate up more than 10%.
    - Clubhouse at Baywood: about 200 weddings.
  - **Factual corrections found while writing the READMEs** (fix early; they are errors, not style):
    - Chess Openings: adding opening, event and time-control features *lowered* accuracy (random forest 60.2% cross-validated, against 64.9% for Elo-only logistic regression). Elo difference is the dominant predictor.
    - Pynacle Games:
      - Connect Four: alpha-beta minimax with memoization and phase-based depth (up to 4 plies on Hard, 6 on Master). Not iterative deepening.
      - 15-puzzle: A\* with a Manhattan heuristic.
      - 2048: a heuristic AI whose weights were tuned by grid search, then simulated annealing.
      - Tic-Tac-Toe: rule-based bots.
      - Chess: two-player on python-chess, no AI.
    - Transformer Chess Bot:
      - About 91% validation accuracy at predicting game *outcomes* (win/draw/loss), not 92% move prediction.
      - Estimated playing strength about 400 Elo.
      - It was the COSC 490 (Large Language Models) final project, with Dustin O'Brien.
    - Music Painter:
      - Built on PySide2, NumPy FFT, SciPy and PyAudio (no sounddevice).
      - Co-authors: Luke Zolenski, and Dr. Don Spickler (faculty mentor).
    - Sport Classification:
      - The paper PDF is in the repo; link it directly.
      - Team: Dustin O'Brien, Dylan Johnson; advisor Dr. Kyle Teller.
      - 332 participants; free-text answers parsed with gpt-4o-mini through LangChain.
    - Celite: team Timothy McKirgan and Dustin O'Brien; directed by Dr. Michael Bardzell.
    - Archive dates:
      - spell checker: Nov 2022 (COSC 120)
      - arbitrary-length integer calculator: Oct 2023 (COSC 320)
      - hill-climb decryption: Nov 2023 (COSC 320)
      - parallel query parser: Nov–Dec 2024 (COSC 420, five-person team)
  - **Papers are the source of truth** (Kyle, 2026-11-20). Where a paper and other sources disagree, follow the paper.
    - Done:
      - The four paper-backed pages (Laridae, Sport Classification, Transformer Chess Bot, Chess Openings) were rewritten from their papers.
      - The Laridae journal PDF is in `reference/`; Kyle's article is on pages 63–67.
    - Transformer Chess Bot: the report never says the ~91% was measured on grandmaster games. The final dataset mixed GM and mid-Elo games, so don't say "grandmaster" for that figure.
    - Resume PDF (`public/resume/`):
      - It is ReportLab output with no source file anywhere.
      - Edit it by replacing whole text lines in the content stream; ASCII glyphs are all in the font subsets. This keeps the design byte-identical.
      - Fixed so far:
        - Music Painter stack: now PySide2, NumPy.
        - Pynacle: the "iterative deepening" claim is gone.
        - Chess bot: "92% on grandmaster games" is now "about 91% validation accuracy predicting game outcomes".
- **R6. Verify.** ✅ Done 2026-11-21. `pnpm verify` green (187 e2e including axe in both themes and the viewport checks; 46 unit). Lighthouse is 100 in every category on all audited pages (the Pitchfire case study is now in the audit list). Screenshots were reviewed at 390 and 1440 in both themes.

**Phase 6: Final content pass** ✅ Done 2026-11-21, except the items Kyle owes.
- Pitchfire:
  - Origin wording confirmed: "an internal Python/AWS deal-flow management and opportunity analysis tool".
  - User figures generalized to 150+ users across 100+ firms. "Firms" includes startups, so never say "VC and PE firms" for the count. Updated on the site and in the resume PDF.
  - Logo added (with a dark-theme variant), plus the case-study cover and a six-image gallery.
  - Screenshots use demo accounts only ("Pitchfire Demo", "Sample Ventures"). Kyle's older screenshots showed real deal names and emails and were not used. The source folder was removed from `reference/`; Kyle keeps a local copy.
- Links: no broken internal links in 20 built pages. Every external link returns 200; LinkedIn returns 999 to bots, which is expected.
- Proofreading: a mechanical scan of the rendered text (doubled words, spacing, punctuation, rare words) found nothing.
- Still owed by Kyle (`grep -rn "TODO(kyle)" src`):
  - Review of the `pages.yaml` copy, including the About section.
- Follow-ups done 2026-11-21:
  - Calculus SI uses the resume's wording (Kyle: it's the accurate one): "a program SU data shows raises class averages by over 10%".
  - New covers and galleries:
    - Chess Openings: charts from the notebook outputs.
    - Sport Classification: charts from the repo's `Plots/`.
    - Pynacle Games: pynaclegames.org pages plus the site's six game images, captured at 2×.
    - Charts are composed onto white 16:10 (cover) or 4:3 (gallery) panels so card crops don't cut them.
  - Resume PDF: removed double spaces before the italic text on the Pitchfire and City of Cambridge header lines.
  - pynaclegames.org bug (Kyle's server): client-side routes such as /games return Apache 404 on direct load or refresh. It needs an SPA fallback, e.g. `FallbackResource /index.html`.

**Phase 7: Launch ★**
- Done: deploy handoff in the README plus `scripts/deploy.sh` (see §7).
- Kyle pushes `redesign` and sends the admin the README. Optional: the admin test-builds `redesign`.
- At an agreed time: merge `redesign` → `main`; the admin runs `deploy.sh`, points the document root at `dist/`, and switches the daily job.
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
- The build must stay a plain static `dist/`. When routes change, update the redirects and the server configs in README.md.

## Workflow
- Work on `redesign` (or feature branches off it). Never push to `main` without Kyle's approval.
```
