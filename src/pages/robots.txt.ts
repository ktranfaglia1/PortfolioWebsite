import type { APIRoute } from "astro";
import { site } from "../site.config";

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /styleguide
Disallow: /lab/

Sitemap: ${new URL("/sitemap-index.xml", site.url).href}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
