/**
 * Command palette items, built at build time from site config and content and
 * embedded in each page as JSON. Pure, so it can be unit-tested.
 */

export type PaletteAction =
  | { type: "link"; href: string; external?: boolean }
  | { type: "download"; href: string }
  | { type: "copy"; text: string; label: string }
  | { type: "theme" };

export interface PaletteItem {
  id: string;
  group: "Pages" | "Projects" | "Actions" | "Elsewhere";
  label: string;
  /** Secondary text shown on the right / used for search. */
  hint?: string;
  keywords?: string[];
  action: PaletteAction;
}

interface Input {
  nav: readonly { label: string; href: string }[];
  /** Extra pages that aren't in the main nav, e.g. Other experience. */
  extraPages?: { label: string; href: string; hint?: string }[];
  projects: { id: string; title: string; stack: string[] }[];
  email: string;
  resume: string;
  transcript: string;
  socials: { github: string; linkedin: string };
}

export function buildPaletteItems(input: Input): PaletteItem[] {
  const pages: PaletteItem[] = [
    ...input.nav.map((n) => ({
      label: n.label,
      href: n.href,
      hint: undefined,
    })),
    ...(input.extraPages ?? []),
  ].map((p) => ({
    id: `page:${p.href}`,
    group: "Pages",
    label: p.label,
    hint: p.hint,
    action: { type: "link", href: p.href },
  }));

  const projects: PaletteItem[] = input.projects.map((p) => ({
    id: `project:${p.id}`,
    group: "Projects",
    label: p.title,
    hint: p.stack.slice(0, 3).join(" · "),
    // A few headline techs only: long keyword lists make cmdk's fuzzy match
    // pick up unrelated queries (e.g. "copy email").
    keywords: p.stack.slice(0, 4),
    action: { type: "link", href: `/projects/${p.id}` },
  }));

  const actions: PaletteItem[] = [
    {
      id: "action:copy-email",
      group: "Actions",
      label: "Copy email address",
      hint: input.email,
      keywords: ["contact", "mail"],
      action: { type: "copy", text: input.email, label: "Email address" },
    },
    {
      id: "action:theme",
      group: "Actions",
      label: "Toggle light / dark theme",
      keywords: ["dark mode", "light mode", "appearance"],
      action: { type: "theme" },
    },
    {
      id: "action:resume",
      group: "Actions",
      label: "Download resume (PDF)",
      keywords: ["cv"],
      action: { type: "download", href: input.resume },
    },
    {
      id: "action:transcript",
      group: "Actions",
      label: "Download transcript (PDF)",
      keywords: ["grades", "gpa"],
      action: { type: "download", href: input.transcript },
    },
  ];

  const elsewhere: PaletteItem[] = [
    { id: "link:github", label: "GitHub", href: input.socials.github },
    { id: "link:linkedin", label: "LinkedIn", href: input.socials.linkedin },
  ].map((l) => ({
    id: l.id,
    group: "Elsewhere",
    label: l.label,
    action: { type: "link", href: l.href, external: true },
  }));

  return [...pages, ...projects, ...actions, ...elsewhere];
}
