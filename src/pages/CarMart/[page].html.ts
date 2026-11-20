/** Static redirect pages for the old CarMart app (see src/lib/redirects.ts). */
import type { APIRoute, GetStaticPaths } from "astro";
import { redirectPage, staticRedirects } from "../../lib/redirects";
import { site } from "../../site.config";

export const getStaticPaths = (() =>
  staticRedirects().map(([from, to]) => ({
    params: { page: from.replace(/^\/CarMart\//, "").replace(/\.html$/, "") },
    props: { to },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(redirectPage((props as { to: string }).to, site.url), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
