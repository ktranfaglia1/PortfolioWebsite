import { describe, expect, it } from "vitest";
import { formatTitle } from "./seo";

describe("formatTitle", () => {
  it("appends the site name", () => {
    expect(formatTitle("Projects", "Kyle Tranfaglia")).toBe(
      "Projects | Kyle Tranfaglia",
    );
  });

  it("leaves titles that already include the name alone", () => {
    expect(
      formatTitle("Kyle Tranfaglia | Software Engineer", "Kyle Tranfaglia"),
    ).toBe("Kyle Tranfaglia | Software Engineer");
  });
});
