import { describe, expect, it } from "vitest";
import { legacyRedirects, redirectPage, staticRedirects } from "./redirects";

describe("redirectPage", () => {
  it("refreshes to the target and declares it canonical", () => {
    const html = redirectPage("/projects", "https://x.top");
    expect(html).toContain(
      '<meta http-equiv="refresh" content="0; url=/projects">',
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://x.top/projects">',
    );
    expect(html).toContain('content="noindex"');
  });
});

describe("legacyRedirects", () => {
  it("only points at new-style clean URLs", () => {
    for (const to of Object.values(legacyRedirects)) {
      expect(to).toMatch(/^\/[a-z/-]*$/);
    }
  });
});

describe("staticRedirects", () => {
  it("never emits root-level .html files that could shadow clean URLs", () => {
    const froms = staticRedirects().map(([from]) => from);
    expect(froms).toContain("/CarMart/index.html");
    expect(froms).not.toContain("/projects.html");
  });
});
