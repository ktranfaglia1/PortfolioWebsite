/**
 * Helpers for the Phase 5.5 design prototypes (/lab/a, /lab/b). Whatever
 * survives the design pick moves to a permanent module in R4.
 */

/** A run of headline text; `accent` runs render in the serif italic. */
export interface TextRun {
  text: string;
  accent: boolean;
}

/**
 * Splits "Software engineer who *thinks in systems*." into plain and accent
 * runs. Asterisks toggle the accent; an unmatched trailing asterisk is literal.
 */
export function splitAccent(input: string): TextRun[] {
  const parts = input.split("*");
  if (parts.length % 2 === 0) {
    // Odd number of asterisks: treat the last one as a literal character.
    const last = parts.pop() ?? "";
    parts[parts.length - 1] += `*${last}`;
  }
  return parts
    .map((text, i) => ({ text, accent: i % 2 === 1 }))
    .filter((run) => run.text.length > 0);
}

/** A stable seven-character hex "commit hash" for an id (FNV-1a, 32-bit). */
export function shortHash(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 7);
}

/**
 * Counts how many entries mention each skill (case-insensitive), so the skill
 * grid can shade by real usage. Returns a count for every skill in `skills`.
 */
export function skillUsage(
  skills: string[],
  entries: string[][],
  /** Other names that count as the same skill, e.g. SQL → ["PostgreSQL"]. */
  aliases: Record<string, string[]> = {},
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const skill of skills) {
    const names = [skill, ...(aliases[skill] ?? [])].map((n) =>
      n.toLowerCase(),
    );
    const n = entries.filter((list) =>
      list.some((s) => names.includes(s.toLowerCase())),
    ).length;
    counts.set(skill, n);
  }
  return counts;
}

/** Maps a count to a 0–4 intensity level, like a contribution graph. */
export function intensity(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  const level = Math.ceil((count / max) * 4);
  return Math.min(4, Math.max(1, level)) as 1 | 2 | 3 | 4;
}

/** One row of the commit-log graph. */
export interface GraphEvent {
  id: string;
  lane: number;
  date: Date;
}

/** What to draw for one lane on one row. */
export type LaneSegment = "none" | "full" | "top" | "bottom" | "dot-only";

/**
 * For events sorted newest first, works out how each lane's vertical line
 * passes through each row: a lane's line runs from its newest event (drawn
 * from the dot down) to its oldest (drawn from the top to the dot), and passes
 * straight through rows in between. `openTop` lanes (ongoing work) also extend
 * above their newest event.
 */
export function laneSegments(
  events: GraphEvent[],
  laneCount: number,
  openTop: number[] = [],
): LaneSegment[][] {
  const first = new Array<number>(laneCount).fill(-1);
  const last = new Array<number>(laneCount).fill(-1);
  events.forEach((e, i) => {
    if (first[e.lane] === -1) first[e.lane] = i;
    last[e.lane] = i;
  });

  return events.map((e, row) =>
    Array.from({ length: laneCount }, (_, lane): LaneSegment => {
      const start = openTop.includes(lane) ? 0 : first[lane];
      const end = last[lane];
      if (start === -1 || end === -1 || row < start || row > end) {
        return "none";
      }
      const hasDot = e.lane === lane;
      const above = row > start || (openTop.includes(lane) && row === 0);
      const below = row < end;
      if (!hasDot) return "full";
      if (above && below) return "full";
      if (above) return "top";
      if (below) return "bottom";
      return "dot-only";
    }),
  );
}
