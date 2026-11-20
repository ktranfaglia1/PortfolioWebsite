import { describe, expect, it } from "vitest";
import { neighbors, techOptions } from "./projects";

describe("techOptions", () => {
  it("keeps tech used by 2+ projects, most common first, then A–Z", () => {
    const projects = [
      { stack: ["Python", "PyTorch"] },
      { stack: ["Python", "C++"] },
      { stack: ["C++", "Python", "Python"] }, // duplicates count once
      { stack: ["Go"] },
    ];
    expect(techOptions(projects)).toEqual(["Python", "C++"]);
  });
});

describe("neighbors", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("returns the items on either side", () => {
    expect(neighbors(items, "b")).toEqual({
      prev: { id: "a" },
      next: { id: "c" },
    });
  });

  it("wraps around at the ends", () => {
    expect(neighbors(items, "a")?.prev).toEqual({ id: "c" });
    expect(neighbors(items, "c")?.next).toEqual({ id: "a" });
  });

  it("returns undefined for unknown ids or single-item lists", () => {
    expect(neighbors(items, "z")).toBeUndefined();
    expect(neighbors([{ id: "a" }], "a")).toBeUndefined();
  });
});
