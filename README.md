# kyletranfaglia.top

Source for my personal portfolio: **[kyletranfaglia.top](https://kyletranfaglia.top)**. It covers my projects, experience, resume and contact details.

It's a fast, accessible, fully static site. Pages ship almost no JavaScript, and everything works with JavaScript turned off.

- [Running it on a server](#running-it-on-a-server) — building, serving, updating, rollback
- [Switching over from the old site](#switching-over-from-the-old-site) — the one-time cutover
- [Local development](#local-development)

## Tech stack

- **[Astro](https://astro.build)** with **TypeScript** (strict). Static output, with content kept in typed content collections (Zod schemas) instead of being hard-coded into pages.
- **Tailwind CSS v4**, with every color, size and shadow defined as a design token in CSS variables. Light and dark themes follow the OS setting and can be switched manually.
- **React**, used for a single island: a ⌘K command palette built on `cmdk` and loaded only on first use.
- **Small vanilla scripts** for progressive enhancement: project filtering, the contact form (Formspree), theme switching, scroll reveals.
- **Build-time generation:** an Open Graph share image for every page (Satori → sharp), the favicon set, the sitemap, robots.txt and JSON-LD structured data.

---

## Running it on a server

### What's different from the old site

The old site was plain HTML files: pull the repo, serve the folder. **This version has to be built first.** `pnpm build` turns the source into a folder of plain static files, `dist/`, and **only `dist/` gets served**. Serving the repo root would publish source code and no working pages.

Once built, there's nothing to run: no Node process, no database, no app server, no environment variables. Any web server that can serve static files works, and the contact form posts straight to Formspree from the browser.

### Requirements (build machine only)

| | Version | Notes |
|---|---|---|
| Node.js | **26 or newer** | Pinned in `.nvmrc`. Only needed to build, not to serve. |
| pnpm | **12.21.0** | Pinned in `package.json`. Node 26 no longer ships Corepack, so install it with `npm install -g pnpm@12.21.0`. |
| git, bash, `flock` | any | `flock` is in util-linux (standard on Debian/Ubuntu). Used by `scripts/deploy.sh`. |

- Disk: ~600 MB for `node_modules`, ~15 MB for `dist/`.
- Network: needed only for `pnpm install` (npm registry) and `git fetch` (GitHub). The build itself makes no network requests.
- A build takes about 10 seconds, plus the install on the first run.

### Build by hand

```bash
git clone https://github.com/ktranfaglia1/PortfolioWebsite.git
cd PortfolioWebsite
pnpm install --frozen-lockfile
pnpm build                # writes the site to dist/
```

If you'd rather not install Node on the host, the same two commands run in the official image:

```bash
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app \
  node:26 sh -c "npx -y pnpm@12.21.0 install --frozen-lockfile && npx -y pnpm@12.21.0 build"
```

### Updates: `scripts/deploy.sh`

This replaces the old daily `git pull`. Point the daily job at it instead:

```bash
./scripts/deploy.sh             # deploy origin/main if it changed since the last run
FORCE=1 ./scripts/deploy.sh     # rebuild even if nothing changed
./scripts/deploy.sh rollback    # put the previous build back
```

What it does, in order:

1. Fetches `origin/main`. If that commit is already built and `dist/` exists, it exits without doing anything.
2. Fast-forwards the checkout, runs `pnpm install --frozen-lockfile`, and builds into a temporary folder (`.build-tmp/`).
3. Only if the build succeeded: renames the current `dist/` to `dist.prev/` and the new build to `dist/`.

So a failed build never touches the live site, the site is never half-built, and the last good build is always one command away. It uses a lock file, so overlapping runs are skipped. It logs one timestamped line per step to stdout.

Example cron entry (daily at 4am, same as before; any schedule works since it no-ops when nothing changed):

```cron
0 4 * * * cd /srv/PortfolioWebsite && ./scripts/deploy.sh >> /var/log/portfolio-deploy.log 2>&1
```

Cron's `PATH` usually won't include Node from nvm. Either install Node system-wide, or put `PATH=/home/<user>/.nvm/versions/node/v26.x.x/bin:/usr/bin:/bin` at the top of the crontab.

Options (environment variables):

- `DEPLOY_BRANCH`: branch to deploy (default `main`). Use `redesign` to try the new site before cutover.
- `GITHUB_TOKEN`: optional. Only used if the home-page GitHub activity card is turned on in `src/site.config.ts` (it's currently off). Any read-only token works; without one, the build still succeeds and the card is hidden. Never commit it.

The checkout must stay clean: `deploy.sh` only fast-forwards, so local edits on the server make it stop with a git error instead of overwriting them.

### Web server configuration

Point the document root at **`<repo>/dist`**. `deploy.sh` swaps the folder by renaming, so the path stays the same and no reload is needed after a deploy.

The server needs to do five things. Example configs for Apache and nginx follow.

1. **Clean URLs with no trailing slash.** A request for `/projects` serves `dist/projects/index.html` directly, **without** redirecting to `/projects/`. Canonical tags and the sitemap use the no-slash form. Requests that do end in a slash get a 301 to the version without one (except the home page `/`).
2. **404s:** serve `dist/404.html` with status 404.
3. **Old-site URLs:** 301 redirects so existing links and search results keep working:
   - `/projects.html` → `/projects`
   - `/resume.html` → `/resume`
   - `/contact.html` → `/contact`
   - `/CarMart` and anything under it → `/projects/carmart`

   (`/index.html` needs nothing; it's the new home page's file.) The 404 page also forwards these in the browser as a fallback, but real 301s are better for search engines.
4. **Cache headers:**
   - `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`. File names there contain a content hash, so they never change.
   - Everything else (HTML, `/og/*` share images, the resume PDFs): `Cache-Control: public, max-age=0, must-revalidate`, so updates show up right away.
5. **Never send `Cache-Control: no-transform`.** Cloudflare Web Analytics is set up automatically: Cloudflare inserts its script into the HTML as it passes through, and `no-transform` stops that.

#### Apache

Needs `mod_rewrite` and `mod_headers` (`a2enmod rewrite headers`).

```apache
<VirtualHost *:80>
    ServerName kyletranfaglia.top
    ServerAlias www.kyletranfaglia.top
    DocumentRoot /srv/PortfolioWebsite/dist

    <Directory /srv/PortfolioWebsite/dist>
        Options -Indexes
        AllowOverride None
        Require all granted
        # Don't redirect /projects to /projects/
        DirectorySlash Off
    </Directory>

    RewriteEngine On

    # Old-site URLs
    RewriteRule ^/(projects|resume|contact)\.html$ /$1 [R=301,L]
    RewriteRule ^/CarMart(/.*)?$ /projects/carmart [R=301,L]

    # Drop trailing slashes (the home page "/" is unaffected)
    RewriteRule ^/(.+)/$ /$1 [R=301,L]

    # Clean URLs: /projects -> /projects/index.html
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI}/index.html -f
    RewriteRule ^/(.+)$ /$1/index.html [L]

    ErrorDocument 404 /404.html

    Header set Cache-Control "public, max-age=0, must-revalidate"
    <LocationMatch "^/_astro/">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>
</VirtualHost>
```

#### nginx

```nginx
server {
    listen 80;
    server_name kyletranfaglia.top www.kyletranfaglia.top;
    root /srv/PortfolioWebsite/dist;
    absolute_redirect off;

    # Old-site URLs
    location ~ ^/(projects|resume|contact)\.html$ { return 301 /$1; }
    location ~ ^/CarMart(/|$)                    { return 301 /projects/carmart; }

    # Drop trailing slashes (the home page "/" is unaffected)
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

#### Cloudflare

DNS and proxy settings stay as they are. The `kyletranfaglia.top` record must stay **Proxied** (orange cloud); with "DNS only", Web Analytics stops counting visits. No analytics token or extra script is needed on the server.

### Check it after a deploy

```bash
H=https://kyletranfaglia.top
curl -sI $H/                 | head -1   # 200
curl -sI $H/projects         | head -1   # 200, not a 301
curl -sI $H/projects/        | grep -i -E '^HTTP|^location'   # 301 -> /projects
curl -sI $H/projects.html    | grep -i -E '^HTTP|^location'   # 301 -> /projects
curl -sI $H/CarMart/         | grep -i -E '^HTTP|^location'   # 301 -> /projects/carmart
curl -sI $H/does-not-exist   | head -1   # 404
curl -s  $H/does-not-exist   | grep -c "Kyle Tranfaglia"      # > 0: the site's own 404 page
curl -sI $H/resume/Kyle_Tranfaglia_Resume.pdf | head -1       # 200
curl -s  $H/ | grep -c cloudflareinsights                     # > 0 once Cloudflare injects analytics
```

Pick any file name from `dist/_astro/` and check that it returns the one-year `Cache-Control`.

### Rollback

- **Last build:** `./scripts/deploy.sh rollback` swaps `dist.prev/` back in, and the build it replaced moves to `dist.failed/`. The next scheduled run rebuilds from `main` as usual, so if the problem is in the code, I'll revert it on `main`.
- **Old site:** the previous site is preserved on the `legacy` branch as plain HTML. In an emergency, check it out in a separate folder and point the document root at that folder (not `dist/`).

---

## Switching over from the old site

This is a one-time step. Today the server pulls `main` and serves the repo root. As soon as I merge the new site into `main`, that would publish source code, so the server change and the merge need to happen together:

1. **Before the merge (optional):** clone the repo into a separate folder and run `DEPLOY_BRANCH=redesign ./scripts/deploy.sh` to try the build. You can serve that `dist/` on a test hostname or port to check the config.
2. **Agree on a time.** I merge `redesign` into `main`.
3. **Run:** `./scripts/deploy.sh` in the live checkout. Point the document root at `<repo>/dist` with the config above and reload the web server. Switch the daily job from `git pull` to `deploy.sh`.
4. **Purge the Cloudflare cache once** (Caching → Configuration → Purge Everything), so visitors don't get the old pages.
5. Run the checks in [Check it after a deploy](#check-it-after-a-deploy).

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

The previous version of the site is kept on the `legacy` branch.

## Author

**[Kyle Tranfaglia](https://github.com/ktranfaglia1)**: Software Engineer · [LinkedIn](https://www.linkedin.com/in/kyletranfaglia)
