import { describe, expect, it } from "vitest";
import {
  intensity,
  laneSegments,
  shortHash,
  skillUsage,
  splitAccent,
} from "./lab";

describe("splitAccent", () => {
  it("splits plain and accent runs", () => {
    expect(splitAccent("Software engineer who *thinks in systems*.")).toEqual([
      { text: "Software engineer who ", accent: false },
      { text: "thinks in systems", accent: true },
      { text: ".", accent: false },
    ]);
  });

  it("returns one plain run without asterisks", () => {
    expect(splitAccent("Hello")).toEqual([{ text: "Hello", accent: false }]);
  });

  it("keeps an unmatched asterisk literal", () => {
    expect(splitAccent("A *b")).toEqual([{ text: "A *b", accent: false }]);
  });
});

describe("shortHash", () => {
  it("is stable, seven hex characters", () => {
    expect(shortHash("pitchfire")).toMatch(/^[0-9a-f]{7}$/);
    expect(shortHash("pitchfire")).toBe(shortHash("pitchfire"));
    expect(shortHash("pitchfire")).not.toBe(shortHash("celite"));
  });
});

describe("skillUsage and intensity", () => {
  it("counts entries mentioning each skill, case-insensitively", () => {
    const usage = skillUsage(
      ["Python", "Rust"],
      [["python", "C"], ["Python"], ["Java"]],
    );
    expect(usage.get("Python")).toBe(2);
    expect(usage.get("Rust")).toBe(0);
  });

  it("counts aliases as the same skill", () => {
    const usage = skillUsage(["SQL"], [["PostgreSQL"], ["MySQL"], ["Go"]], {
      SQL: ["PostgreSQL", "MySQL"],
    });
    expect(usage.get("SQL")).toBe(2);
  });

  it("maps counts to levels 0–4", () => {
    expect(intensity(0, 10)).toBe(0);
    expect(intensity(1, 10)).toBe(1);
    expect(intensity(10, 10)).toBe(4);
    expect(intensity(6, 10)).toBe(3);
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
