import { site } from "../site.config";

/** "Projects" → "Projects | Kyle Tranfaglia". Titles that already name Kyle are kept. */
export function formatTitle(title: string, name: string = site.name): string {
  return title.includes(name) ? title : `${title} | ${name}`;
}

/**
 * Absolute canonical URL without a trailing slash (the site's URL style),
 * e.g. ("/projects/", "https://x.top") → "https://x.top/projects".
 */
export function canonicalUrl(
  pathname: string,
  base: string = site.url,
): string {
  const path =
    pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
  return new URL(path, base).href;
}

interface PersonInput {
  name: string;
  url: string;
  jobTitle: string;
  description: string;
  email: string;
  image?: string;
  sameAs: string[];
  /** Omit to publish only the region (e.g. a metro area, not a city). */
  locality?: string;
  region: string;
  alumniOf?: string;
  worksFor?: string;
  knowsAbout: string[];
}

/** schema.org Person + WebSite graph for the home page. */
export function personJsonLd(p: PersonInput): Record<string, unknown> {
  const person = {
    "@type": "Person",
    "@id": `${p.url}/#person`,
    name: p.name,
    url: p.url,
    jobTitle: p.jobTitle,
    description: p.description,
    email: `mailto:${p.email}`,
    ...(p.image && { image: p.image }),
    sameAs: p.sameAs,
    address: {
      "@type": "PostalAddress",
      ...(p.locality && { addressLocality: p.locality }),
      addressRegion: p.region,
      addressCountry: "US",
    },
    ...(p.alumniOf && {
      alumniOf: { "@type": "CollegeOrUniversity", name: p.alumniOf },
    }),
    ...(p.worksFor && {
      worksFor: { "@type": "Organization", name: p.worksFor },
    }),
    knowsAbout: p.knowsAbout,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${p.url}/#website`,
        url: p.url,
        name: p.name,
        author: { "@id": `${p.url}/#person` },
      },
    ],
  };
}
