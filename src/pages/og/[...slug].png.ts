/**
 * Build-time Open Graph images: one PNG per page at /og/<route>.png.
 * BaseLayout points og:image at these via ogImagePath().
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getPage, getProjectsWithPages } from "../../lib/content";
import { renderOgImage, type OgInput } from "../../lib/og";
import { categoryLabels } from "../../lib/projects";
import { site } from "../../site.config";

type Card = Pick<OgInput, "eyebrow" | "title" | "description">;

export const getStaticPaths = (async () => {
  const pageRoutes: [slug: string, pageId: string][] = [
    ["projects", "projects"],
    ["experience", "experience"],
    ["experience/other", "experience-other"],
    ["resume", "resume"],
    ["contact", "contact"],
  ];

  const home = await getPage("home");
  const cards: { slug: string; card: Card }[] = [
    {
      slug: "home",
      card: {
        eyebrow: site.headline,
        title: site.name,
        description: home.intro,
      },
    },
  ];

  for (const [slug, id] of pageRoutes) {
    const page = await getPage(id);
    cards.push({
      slug,
      card: {
        eyebrow: site.name,
        title: page.heading,
        description: page.intro,
      },
    });
  }

  for (const p of await getProjectsWithPages()) {
    cards.push({
      slug: `projects/${p.id}`,
      card: {
        eyebrow: `Case study · ${p.data.categories.map((c) => categoryLabels[c]).join(" · ")}`,
        title: p.data.title,
        description: p.data.summary,
      },
    });
  }

  return cards.map(({ slug, card }) => ({ params: { slug }, props: card }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage({
    ...(props as Card),
    footer: `${site.name} · ${site.headline}`,
    domain: new URL(site.url).host,
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
