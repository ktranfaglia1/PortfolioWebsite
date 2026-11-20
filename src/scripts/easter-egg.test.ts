import { describe, expect, it, vi } from "vitest";
import { KONAMI, sequenceMatcher } from "./easter-egg";

describe("sequenceMatcher", () => {
  it("fires after the full Konami code", () => {
    const onMatch = vi.fn();
    const press = sequenceMatcher(KONAMI, onMatch);
    KONAMI.forEach(press);
    expect(onMatch).toHaveBeenCalledOnce();
  });

  it("matches after extra keys, e.g. an extra Up before the code", () => {
    const onMatch = vi.fn();
    const press = sequenceMatcher(KONAMI, onMatch);
    ["x", "ArrowUp", ...KONAMI].forEach(press);
    expect(onMatch).toHaveBeenCalledOnce();
  });

  it("does not fire on a partial or broken sequence", () => {
    const onMatch = vi.fn();
    const press = sequenceMatcher(KONAMI, onMatch);
    [...KONAMI.slice(0, 5), "x", ...KONAMI.slice(5)].forEach(press);
    expect(onMatch).not.toHaveBeenCalled();
  });

  it("is case-insensitive for letters", () => {
    const onMatch = vi.fn();
    const press = sequenceMatcher(["b", "a"], onMatch);
    ["B", "A"].forEach(press);
    expect(onMatch).toHaveBeenCalledOnce();
  });
});
