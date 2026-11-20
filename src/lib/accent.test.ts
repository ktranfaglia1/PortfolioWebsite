import { describe, expect, it } from "vitest";
import { splitAccent } from "./accent";

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
