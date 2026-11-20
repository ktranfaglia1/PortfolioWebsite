import { byMostRecent, type EndDate } from "./dates";

export interface Sortable {
  start: Date;
  end?: EndDate;
  /** Manual position; lower sorts first. */
  order?: number;
}

/**
 * Sort comparator for content entries. Entries that both set `order` sort by
 * it; everything else falls back to most recent first (see `byMostRecent`).
 * Entries with an `order` come before entries without one.
 */
export function byOrderThenRecent(a: Sortable, b: Sortable): number {
  if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
    return a.order - b.order;
  }
  if (a.order !== undefined && b.order === undefined) return -1;
  if (a.order === undefined && b.order !== undefined) return 1;
  return byMostRecent(a, b);
}

/** True for ongoing entries (`end: present`). */
export function isCurrent(entry: { end?: EndDate }): boolean {
  return entry.end === "present";
}
