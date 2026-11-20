import { describe, expect, it } from "vitest";
import { matches, parseFilter, serializeFilter } from "./project-filter";

describe("parseFilter / serializeFilter", () => {
  it("round-trips through the query string", () => {
    const state = { category: "ai-ml", tech: "C++" };
    expect(parseFilter(serializeFilter(state))).toEqual(state);
  });

  it("serializes an empty filter to an empty string", () => {
    expect(serializeFilter({ category: "", tech: "" })).toBe("");
    expect(parseFilter("")).toEqual({ category: "", tech: "" });
  });
});

describe("matches", () => {
  const item = {
    categories: ["software", "ai-ml"],
    stack: ["Python", "PyQt5"],
  };

  it("matches everything when no filter is set", () => {
    expect(matches(item, { category: "", tech: "" })).toBe(true);
  });

  it("requires both the category and the tech to match", () => {
    expect(matches(item, { category: "ai-ml", tech: "Python" })).toBe(true);
    expect(matches(item, { category: "ai-ml", tech: "C++" })).toBe(false);
    expect(matches(item, { category: "web", tech: "" })).toBe(false);
  });
});
