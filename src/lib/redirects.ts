/**
 * Old URLs from the legacy site and where they now live. The server config
 * should return real 301s for all of these (see README, "Web server configuration"). As host-agnostic
 * fallbacks:
 * - Paths in their own folder (/CarMart/...) get static redirect pages.
 * - Root .html paths can't: dist/projects.html would shadow
 *   dist/projects/index.html on servers that try "<path>.html" first. The
 *   404 page forwards those instead.
 * `/index.html` needs nothing: it's the new home page's own file.
 */
export const legacyRedirects = {
  "/projects.html": "/projects",
  "/resume.html": "/resume",
  "/contact.html": "/contact",
  "/CarMart/index.html": "/projects/carmart",
  "/CarMart/search.html": "/projects/carmart",
} as const;

/** Legacy paths that are safe to emit as static redirect files. */
export function staticRedirects(): [from: string, to: string][] {
  return Object.entries(legacyRedirects).filter(([from]) =>
    /^\/[^/]+\/.+\.html$/.test(from),
  );
}

const escape = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );

/** A tiny HTML page that sends visitors (and crawlers) to `to`. */
export function redirectPage(to: string, siteUrl: string): string {
  const url = escape(new URL(to, siteUrl).href);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${escape(to)}">
</head>
<body><p>This page has moved to <a href="${escape(to)}">${url}</a>.</p></body>
</html>
`;
}
