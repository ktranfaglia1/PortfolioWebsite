/** Project helpers that don't depend on Astro, so they can be unit-tested. */

export const categoryLabels = {
  software: "Software",
  "ai-ml": "AI & ML",
  "data-science": "Data science",
  research: "Research",
  web: "Web",
} as const;

export type Category = keyof typeof categoryLabels;

/**
 * Technologies used by at least `min` projects, most common first (ties
 * alphabetical). Feeds the tech filter, so one-off tools don't clutter it.
 */
export function techOptions(
  projects: { stack: readonly string[] }[],
  min = 2,
): string[] {
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const t of new Set(p.stack)) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, n]) => n >= min)
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([t]) => t);
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
