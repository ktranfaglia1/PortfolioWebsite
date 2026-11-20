import { describe, expect, it } from "vitest";
import { laneSegments, shortHash } from "./career-graph";

describe("shortHash", () => {
  it("is stable, seven hex characters", () => {
    expect(shortHash("pitchfire")).toMatch(/^[0-9a-f]{7}$/);
    expect(shortHash("pitchfire")).toBe(shortHash("pitchfire"));
    expect(shortHash("pitchfire")).not.toBe(shortHash("celite"));
  });
});

describe("laneSegments", () => {
  const d = (s: string) => new Date(s);
  const events = [
    { id: "a", lane: 0, date: d("2025-12-01") },
    { id: "b", lane: 1, date: d("2025-05-01") },
    { id: "c", lane: 0, date: d("2025-02-01") },
    { id: "d", lane: 1, date: d("2022-09-01") },
  ];

  it("draws each lane from its newest to its oldest event", () => {
    expect(laneSegments(events, 2)).toEqual([
      ["bottom", "none"],
      ["full", "bottom"],
      ["top", "full"],
      ["none", "top"],
    ]);
  });

  it("extends open-top lanes above their newest event", () => {
    expect(laneSegments(events, 2, [0])[0]).toEqual(["full", "none"]);
  });

  it("marks a lane with a single event as dot-only", () => {
    expect(laneSegments([events[0]!], 1)).toEqual([["dot-only"]]);
  });
});
