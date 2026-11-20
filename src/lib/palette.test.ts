import { describe, expect, it } from "vitest";
import { buildPaletteItems } from "./palette";

const input = {
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
  ],
  extraPages: [{ label: "Other experience", href: "/experience/other" }],
  projects: [
    {
      id: "celite",
      title: "Celite",
      stack: ["JavaScript", "HTML", "CSS", "Extra"],
    },
  ],
  email: "me@example.com",
  resume: "/resume.pdf",
  transcript: "/transcript.pdf",
  socials: {
    github: "https://github.com/x",
    linkedin: "https://linkedin.com/in/x",
  },
};

describe("buildPaletteItems", () => {
  const items = buildPaletteItems(input);

  it("includes nav pages, extra pages, projects, actions, and external links", () => {
    expect(items.map((i) => i.group)).toEqual([
      "Pages",
      "Pages",
      "Pages",
      "Projects",
      "Actions",
      "Actions",
      "Actions",
      "Actions",
      "Elsewhere",
      "Elsewhere",
    ]);
  });

  it("links projects to their case study and indexes the stack", () => {
    const celite = items.find((i) => i.id === "project:celite")!;
    expect(celite.action).toEqual({ type: "link", href: "/projects/celite" });
    expect(celite.hint).toBe("JavaScript · HTML · CSS");
    expect(celite.keywords).toContain("Extra");
  });

  it("has unique ids", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("marks social links external", () => {
    expect(items.find((i) => i.id === "link:github")?.action).toEqual({
      type: "link",
      href: "https://github.com/x",
      external: true,
    });
  });
});
