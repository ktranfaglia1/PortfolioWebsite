import { describe, expect, it } from "vitest";
import { byOrderThenRecent, isCurrent } from "./sort";

const d = (iso: string) => new Date(iso);

describe("byOrderThenRecent", () => {
  it("sorts by order when both entries set it", () => {
    const items = [
      { id: "b", order: 2, start: d("2025-01-01") },
      { id: "a", order: 1, start: d("2020-01-01") },
    ];
    expect(items.sort(byOrderThenRecent).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("puts ordered entries before unordered ones", () => {
    const items = [
      { id: "recent", start: d("2025-01-01") },
      { id: "pinned", order: 5, start: d("2019-01-01") },
    ];
    expect(items.sort(byOrderThenRecent).map((i) => i.id)).toEqual([
      "pinned",
      "recent",
    ]);
  });

  it("falls back to most recent first, with ongoing entries on top", () => {
    const items = [
      { id: "old", start: d("2021-01-01"), end: d("2022-01-01") },
      { id: "now", start: d("2025-12-01"), end: "present" as const },
      { id: "newer", start: d("2024-01-01"), end: d("2024-06-01") },
    ];
    expect(items.sort(byOrderThenRecent).map((i) => i.id)).toEqual([
      "now",
      "newer",
      "old",
    ]);
  });

  it("uses dates to break ties in order", () => {
    const items = [
      { id: "older", order: 1, start: d("2021-01-01") },
      { id: "newer", order: 1, start: d("2024-01-01") },
    ];
    expect(items.sort(byOrderThenRecent).map((i) => i.id)).toEqual([
      "newer",
      "older",
    ]);
  });
});

describe("isCurrent", () => {
  it("is true only for end: present", () => {
    expect(isCurrent({ end: "present" })).toBe(true);
    expect(isCurrent({ end: d("2025-01-01") })).toBe(false);
    expect(isCurrent({})).toBe(false);
  });
});
