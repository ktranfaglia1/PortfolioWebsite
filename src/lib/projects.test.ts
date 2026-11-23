import { describe, expect, it } from "vitest";
import { categoryCounts, languageOptions, neighbors } from "./projects";

describe("languageOptions", () => {
  it("counts each language, most common first, skipping unused ones", () => {
    const projects = [
      { stack: ["Python", "PyTorch"] },
      { stack: ["Python", "C++"] },
      { stack: ["TypeScript", "React"] },
      { stack: ["HTML", "CSS"] },
    ];
    expect(languageOptions(projects)).toEqual([
      { name: "Python", count: 2 },
      { name: "TypeScript", count: 1 },
      { name: "C++", count: 1 },
    ]);
  });
});

describe("categoryCounts", () => {
  it("counts every category a project carries", () => {
    expect(
      categoryCounts([
        { categories: ["web", "software"] },
        { categories: ["web"] },
      ]),
    ).toEqual({ web: 2, software: 1 });
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
