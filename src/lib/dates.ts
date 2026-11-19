/**
 * Date formatting for experience and project timelines.
 *
 * Content dates (YAML/frontmatter `2025-02-01`) parse as UTC midnight, so all
 * formatting is done in UTC to avoid off-by-one-month shifts in US time zones.
 */

export type EndDate = Date | "present" | undefined;

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Feb 2025" */
export function formatMonthYear(date: Date): string {
  return monthYear.format(date);
}

/**
 * "Feb 2025 – Apr 2025", "Dec 2025 – Present", or a single "Apr 2025" when
 * there is no end date or the range falls within one month.
 */
export function formatDateRange(start: Date, end?: EndDate): string {
  const from = formatMonthYear(start);
  if (end === "present") return `${from} – Present`;
  if (!end) return from;
  const to = formatMonthYear(end);
  return from === to ? from : `${from} – ${to}`;
}

/** Sort comparator: ongoing items first, then most recent end, then most recent start. */
export function byMostRecent(
  a: { start: Date; end?: EndDate },
  b: { start: Date; end?: EndDate },
): number {
  const endTime = (e: EndDate, start: Date) =>
    e === "present" ? Number.POSITIVE_INFINITY : (e ?? start).getTime();
  const diff = endTime(b.end, b.start) - endTime(a.end, a.start);
  if (diff !== 0) return diff;
  return b.start.getTime() - a.start.getTime();
}
