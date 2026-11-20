/**
 * Career graph helpers for /experience: the history is drawn like a
 * `git log --graph`, one lane per kind of entry.
 */

/** A stable seven-character hex "commit hash" for an id (FNV-1a, 32-bit). */
export function shortHash(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 7);
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
