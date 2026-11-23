import * as simpleIcons from "simple-icons";
import { aws, openai, type BrandMark } from "../icons/brands";

type SimpleIcon = { slug: string; title: string; path: string };

const bySlug = new Map<string, SimpleIcon>(
  Object.values(simpleIcons as Record<string, unknown>)
    .filter(
      (v): v is SimpleIcon =>
        typeof v === "object" && v !== null && "slug" in v && "path" in v,
    )
    .map((icon) => [icon.slug, icon]),
);

/** Marks no longer in Simple Icons, kept in src/icons/brands.ts. */
const custom: Record<string, BrandMark> = { openai, aws };

/** True when `slug` is a Simple Icons slug (https://simpleicons.org) or a custom mark. */
export function isIconSlug(slug: string): boolean {
  return slug in custom || bySlug.has(slug);
}

/** Look up a mark by slug, e.g. "typescript". */
export function getSkillIcon(slug: string): BrandMark | undefined {
  if (slug in custom) return custom[slug];
  const icon = bySlug.get(slug);
  return icon && { title: icon.title, path: icon.path };
}
