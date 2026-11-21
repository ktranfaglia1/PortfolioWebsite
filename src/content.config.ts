/**
 * Content schemas. Every file in src/content/ is validated against these at
 * build time, so a typo or missing field fails `pnpm build` with a message
 * naming the file and field.
 */
import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { isIconSlug } from "./lib/skill-icons";

/* -------------------------------------------------------------------------- */
/* Shared field types                                                         */
/* -------------------------------------------------------------------------- */

/** A date written as YAML `2025-02-01` (or any string Date can parse). */
const date = z.coerce.date();

/** An end date, or the literal `present` for ongoing work. */
const endDate = z.union([z.literal("present"), date]).optional();

/** An absolute URL, or a site-relative path like `/resume/file.pdf`. */
const href = z.string().refine((s) => s.startsWith("/") || URL.canParse(s), {
  message: "Must be an absolute URL or a path starting with /",
});

function endsAfterStart(d: { start: Date; end?: Date | "present" }) {
  return d.end === undefined || d.end === "present" || d.end >= d.start;
}
const endsAfterStartError = {
  message: "`end` is before `start`",
  path: ["end"],
};

/* -------------------------------------------------------------------------- */
/* Projects: src/content/projects/*.mdx (featured, standard) or *.md (archive)  */
/* The file name is the URL slug: projects/music-painter.mdx → /projects/music-painter */
/* -------------------------------------------------------------------------- */

export const projectCategories = [
  "software",
  "ai-ml",
  "data-science",
  "research",
  "web",
] as const;

export const projectTiers = ["featured", "standard", "archive"] as const;

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) => {
    const figure = z.object({ src: image(), alt: z.string().min(1) });
    return z
      .object({
        title: z.string(),
        /** One sentence for cards and meta descriptions. */
        summary: z.string().max(160),
        tier: z.enum(projectTiers),
        categories: z.array(z.enum(projectCategories)).min(1),
        stack: z.array(z.string()).min(1),
        /** Kyle's role, e.g. "Team lead & front-end developer". */
        role: z.string(),
        /** Team size including Kyle. Omit for solo work. */
        team: z.number().int().min(2).optional(),
        /** Overrides the team label on the case study, e.g. "Sole engineer". */
        teamLabel: z.string().optional(),
        /** Where it came from, e.g. "COSC 425/426 · Software Engineering". */
        context: z.string().optional(),
        start: date,
        end: endDate,
        links: z
          .object({
            live: href.optional(),
            repo: href.optional(),
            paper: href.optional(),
          })
          .default({}),
        cover: figure.optional(),
        gallery: z.array(figure).default([]),
        /** Conferences, publications, awards. */
        recognition: z.array(z.string()).default([]),
        /** Up to four headline figures for case-study teasers, e.g. { value: "13", label: "visualization algorithms" }. Facts only. */
        outcomes: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .max(4)
          .default([]),
        /** Lower numbers sort first within a tier; ties sort by date. */
        order: z.number().optional(),
        draft: z.boolean().default(false),
      })
      .refine(endsAfterStart, endsAfterStartError);
  },
});

/* -------------------------------------------------------------------------- */
/* Experience: src/content/experience/<group>/*.md                            */
/* -------------------------------------------------------------------------- */

export const experienceGroups = [
  "professional",
  "teaching",
  "leadership",
  "volunteer",
  "other",
] as const;

const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z
      .object({
        org: z.string(),
        /** Short description shown after the org name. */
        orgDescription: z.string().optional(),
        orgUrl: z.url().optional(),
        /** Set false to hide the org link (Pitchfire, for now). */
        showLink: z.boolean().default(true),
        /** `srcDark` is an optional variant shown in the dark theme. */
        orgLogo: z
          .object({
            src: image(),
            srcDark: image().optional(),
            alt: z.string(),
          })
          .optional(),
        /** Label for the logo placeholder while the logo is missing. */
        logoPlaceholder: z.string().optional(),
        role: z.string(),
        group: z.enum(experienceGroups),
        location: z.string().optional(),
        start: date,
        end: endDate,
        /** Overrides the formatted date range, e.g. "Mar 2024 & Apr 2025". */
        dateLabel: z.string().optional(),
        summary: z.string(),
        highlights: z.array(z.string()).default([]),
        skills: z.array(z.string()).default([]),
        /** Role progression within one employer, oldest first. */
        positions: z
          .array(
            z.object({
              role: z.string(),
              detail: z.string().optional(),
              start: date.optional(),
              end: endDate,
            }),
          )
          .default([]),
        /** Case study that came out of this role. */
        project: reference("projects").optional(),
        order: z.number().optional(),
        draft: z.boolean().default(false),
      })
      .refine(endsAfterStart, endsAfterStartError),
});

/* -------------------------------------------------------------------------- */
/* Education: src/content/education.yaml                                      */
/* -------------------------------------------------------------------------- */

const education = defineCollection({
  loader: file("./src/content/education.yaml"),
  schema: z
    .object({
      school: z.string(),
      location: z.string().optional(),
      start: date,
      end: date,
      degrees: z
        .array(z.object({ name: z.string(), tracks: z.array(z.string()) }))
        .min(1),
      minors: z.array(z.string()).default([]),
      gpa: z.number().min(0).max(4),
      /** Latin honors, e.g. "Summa Cum Laude". */
      distinction: z.string().optional(),
      honors: z
        .array(
          z.object({
            title: z.string(),
            /** Free text, e.g. "Spring 2025" or "All semesters, 2021–2025". */
            when: z.string().optional(),
            detail: z.string().optional(),
          }),
        )
        .default([]),
    })
    .refine((d) => d.end >= d.start, endsAfterStartError),
});

/* -------------------------------------------------------------------------- */
/* Skills: src/content/skills.yaml                                            */
/* -------------------------------------------------------------------------- */

const skills = defineCollection({
  loader: file("./src/content/skills.yaml"),
  schema: z.object({
    label: z.string(),
    order: z.number(),
    items: z
      .array(
        z.object({
          name: z.string(),
          /** Simple Icons slug (simpleicons.org). Omit to show a text badge. */
          icon: z
            .string()
            .refine(isIconSlug, { message: "Unknown Simple Icons slug" })
            .optional(),
        }),
      )
      .min(1),
  }),
});

/* -------------------------------------------------------------------------- */
/* Page copy: src/content/pages.yaml (titles, meta descriptions, intros)      */
/* -------------------------------------------------------------------------- */

const pages = defineCollection({
  loader: file("./src/content/pages.yaml"),
  schema: z.object({
    /** Browser tab / OG title (the site name is appended). */
    title: z.string(),
    /** Meta description. */
    description: z.string().max(160),
    heading: z.string(),
    intro: z.string(),
    /** Optional display headline; wrap one phrase in *asterisks* for the serif-italic accent. */
    headline: z.string().optional(),
    /** Optional long-form paragraphs (the home page About section). */
    about: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, experience, education, skills, pages };
