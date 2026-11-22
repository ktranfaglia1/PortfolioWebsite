# kyletranfaglia.top

Source for my personal portfolio: **[kyletranfaglia.top](https://kyletranfaglia.top)**. It covers my projects, experience, resume and contact details.

It's a fast, accessible, fully static site. Pages ship almost no JavaScript, and everything works with JavaScript turned off.

## Tech stack

- **[Astro](https://astro.build)** with **TypeScript** (strict). Static output, with content kept in typed content collections (Zod schemas) instead of being hard-coded into pages.
- **Tailwind CSS v4**, with every color, size and shadow defined as a design token in CSS variables. Light and dark themes follow the OS setting and can be switched manually.
- **React**, used for a single island: a ⌘K command palette built on `cmdk` and loaded only on first use.
- **Small vanilla scripts** for progressive enhancement: project filtering, the contact form (Formspree), theme switching, scroll reveals.
- **Build-time generation:** an Open Graph share image for every page (Satori → sharp), the favicon set, the sitemap, robots.txt and JSON-LD structured data.

---

## Local development

```bash
nvm use           # Node 26
pnpm install
pnpm dev          # dev server at http://localhost:4321
pnpm build        # static build to dist/
pnpm preview      # serve the build locally
pnpm verify       # type check, lint, format check, build, unit tests and e2e tests
```

The first `pnpm verify` needs Playwright's browser: `pnpm exec playwright install chromium`.

### Quality

- **Tests:** Vitest unit tests for all logic in `src/lib/`. Playwright end-to-end tests for every route, including **axe** accessibility scans in both themes, layout and overflow checks at five screen widths, SEO metadata, and redirects from old URLs.
- **CI:** type checking, ESLint, Prettier, build and tests on every push and pull request, plus a Lighthouse report covering performance, accessibility, best practices and SEO.

### Project structure

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
scripts/deploy.sh     # Server build-and-swap script (see above)
tests/e2e/            # Playwright suites
```

---

## Running it on a server

The site has to be built now. `pnpm build` writes plain static files to `dist/`, and **only `dist/` gets served** (the repo root is source). Nothing runs at serve time: no Node process, no env vars. The contact form posts straight to Formspree.

**Build requirements:** Node 26+ (`.nvmrc`), pnpm 12.21.0 (`npm i -g pnpm@12.21.0`; Node 26 has no Corepack), git, `flock`. About 600 MB for `node_modules`; a build takes about 10 seconds.

```bash
pnpm install --frozen-lockfile && pnpm build
```

### Deploying: `scripts/deploy.sh`

This replaces the daily `git pull`:

```bash
./scripts/deploy.sh             # fetch origin/main; build and swap into dist/ if it changed
FORCE=1 ./scripts/deploy.sh     # rebuild anyway
./scripts/deploy.sh rollback    # restore the previous build (dist.prev/)
```

It builds into `.build-tmp/` and renames it to `dist/` only if the build succeeds, so a failed build leaves the live site alone. It only fast-forwards, so local edits in the checkout make it stop rather than overwrite them. `DEPLOY_BRANCH` overrides the branch (default `main`). `GITHUB_TOKEN` is optional and unused unless the GitHub activity card is turned on in `src/site.config.ts`.

### Web server

Set the document root to `<repo>/dist`. It needs:

- **Clean URLs, no trailing slash:** `/projects` serves `projects/index.html` with no redirect to `/projects/`; `/foo/` gets a 301 to `/foo`.
- **404:** serve `404.html` with status 404.
- **301s for old URLs:** `/projects.html`, `/resume.html` and `/contact.html` go to the same path without `.html`, and `/CarMart/*` goes to `/projects/carmart`.
- **Cache headers:** `/_astro/*` is content-hashed (`public, max-age=31536000, immutable`); everything else gets `public, max-age=0, must-revalidate`.
- **No `Cache-Control: no-transform`.** Cloudflare's automatic Web Analytics injects its script into the HTML, and that header blocks it. The DNS record needs to stay proxied.

<details>
<summary>Apache</summary>

Needs `mod_rewrite` and `mod_headers`.

```apache
<VirtualHost *:80>
    ServerName kyletranfaglia.top
    ServerAlias www.kyletranfaglia.top
    DocumentRoot /srv/PortfolioWebsite/dist

    <Directory /srv/PortfolioWebsite/dist>
        Options -Indexes
        AllowOverride None
        Require all granted
        DirectorySlash Off
    </Directory>

    RewriteEngine On
    RewriteRule ^/(projects|resume|contact)\.html$ /$1 [R=301,L]
    RewriteRule ^/CarMart(/.*)?$ /projects/carmart [R=301,L]
    RewriteRule ^/(.+)/$ /$1 [R=301,L]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI}/index.html -f
    RewriteRule ^/(.+)$ /$1/index.html [L]

    ErrorDocument 404 /404.html

    Header set Cache-Control "public, max-age=0, must-revalidate"
    <LocationMatch "^/_astro/">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>
</VirtualHost>
```

</details>

<details>
<summary>nginx</summary>

```nginx
server {
    listen 80;
    server_name kyletranfaglia.top www.kyletranfaglia.top;
    root /srv/PortfolioWebsite/dist;
    absolute_redirect off;

    location ~ ^/(projects|resume|contact)\.html$ { return 301 /$1; }
    location ~ ^/CarMart(/|$)                    { return 301 /projects/carmart; }
    rewrite ^/(.+)/$ /$1 permanent;

    location / {
        try_files $uri $uri/index.html =404;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    location /_astro/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_page 404 /404.html;
}
```

</details>

Quick check: `/projects` returns 200, while `/projects/`, `/projects.html` and `/CarMart/` return 301s. An unknown path returns 404 with the site's own page.

### Cutover

As soon as the new site is merged into `main`, a plain `git pull` would start publishing source code, so the server switch and the merge happen together:

1. Optional: test-build first in a separate clone with `DEPLOY_BRANCH=redesign ./scripts/deploy.sh`.
2. Merge `redesign` → `main`, then run `deploy.sh`, point the document root at `dist/`, and swap the daily `git pull` for `deploy.sh`.
3. Purge the Cloudflare cache once.

The old site stays on the `legacy` branch (plain HTML) as a last-resort fallback.

## Author

**[Kyle Tranfaglia](https://github.com/ktranfaglia1)**: Software Engineer · [LinkedIn](https://www.linkedin.com/in/kyletranfaglia)
