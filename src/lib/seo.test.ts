import { describe, expect, it } from "vitest";
import { canonicalUrl, formatTitle, personJsonLd } from "./seo";

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

describe("canonicalUrl", () => {
  it("drops trailing slashes and index.html, keeping the root", () => {
    expect(canonicalUrl("/", "https://x.top")).toBe("https://x.top/");
    expect(canonicalUrl("/projects/", "https://x.top")).toBe(
      "https://x.top/projects",
    );
    expect(canonicalUrl("/projects/celite/index.html", "https://x.top")).toBe(
      "https://x.top/projects/celite",
    );
  });
});

describe("personJsonLd", () => {
  it("links the WebSite author to the Person", () => {
    const ld = personJsonLd({
      name: "A",
      url: "https://x.top",
      jobTitle: "Engineer",
      description: "d",
      email: "a@x.top",
      sameAs: [],
      locality: "Durham",
      region: "NC",
      knowsAbout: ["TypeScript"],
    }) as { "@graph": Record<string, unknown>[] };
    const [person, website] = ld["@graph"];
    expect(person?.["@id"]).toBe("https://x.top/#person");
    expect(website?.author).toEqual({ "@id": "https://x.top/#person" });
    expect(person?.email).toBe("mailto:a@x.top");
  });
});
