import * as simpleIcons from "simple-icons";
import type { BrandMark } from "../icons/brands";

type SimpleIcon = { slug: string; title: string; path: string };

const bySlug = new Map<string, SimpleIcon>(
  Object.values(simpleIcons as Record<string, unknown>)
    .filter(
      (v): v is SimpleIcon =>
        typeof v === "object" && v !== null && "slug" in v && "path" in v,
    )
    .map((icon) => [icon.slug, icon]),
);

/** True when `slug` is a Simple Icons slug (https://simpleicons.org). */
export function isIconSlug(slug: string): boolean {
  return bySlug.has(slug);
}

/** Look up a Simple Icons mark by slug, e.g. "typescript". */
export function getSkillIcon(slug: string): BrandMark | undefined {
  const icon = bySlug.get(slug);
  return icon && { title: icon.title, path: icon.path };
}
