/** Project helpers that don't depend on Astro, so they can be unit-tested. */

export const categoryLabels = {
  software: "Software",
  "ai-ml": "AI & ML",
  "data-science": "Data science",
  research: "Research",
  web: "Web",
} as const;

export type Category = keyof typeof categoryLabels;

/** Programming languages shown as filter chips, in display order. */
export const languages = [
  "TypeScript",
  "JavaScript",
  "Python",
  "C++",
  "C",
  "Java",
  "PHP",
  "R",
] as const;

/**
 * Languages used by at least one project, with how many use each, most
 * common first (ties keep the order of `languages`).
 */
export function languageOptions(
  projects: { stack: readonly string[] }[],
): { name: string; count: number }[] {
  return languages
    .map((name) => ({
      name,
      count: projects.filter((p) => p.stack.includes(name)).length,
    }))
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** How many projects carry each category, for the filter chips. */
export function categoryCounts(
  projects: { categories: readonly string[] }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of projects)
    for (const c of p.categories) counts[c] = (counts[c] ?? 0) + 1;
  return counts;
}

/** Previous and next items around `id`, wrapping at the ends. */
export function neighbors<T extends { id: string }>(
  items: readonly T[],
  id: string,
): { prev: T; next: T } | undefined {
  const i = items.findIndex((item) => item.id === id);
  if (i === -1 || items.length < 2) return undefined;
  return {
    prev: items[(i - 1 + items.length) % items.length]!,
    next: items[(i + 1) % items.length]!,
  };
}
