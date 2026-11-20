import { describe, expect, it } from "vitest";
import { ogImagePath } from "./og";

describe("ogImagePath", () => {
  it("maps the home page to /og/home.png", () => {
    expect(ogImagePath("/")).toBe("/og/home.png");
  });

  it("maps nested routes and ignores trailing slashes", () => {
    expect(ogImagePath("/projects/celite")).toBe("/og/projects/celite.png");
    expect(ogImagePath("/experience/other/")).toBe("/og/experience/other.png");
  });
});
