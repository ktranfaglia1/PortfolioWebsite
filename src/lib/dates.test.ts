import { describe, expect, it } from "vitest";
import { byMostRecent, formatDateRange, formatMonthYear } from "./dates";

const d = (iso: string) => new Date(iso); // ISO date-only strings parse as UTC

describe("formatMonthYear", () => {
  it("formats in UTC so the first of the month never shifts back", () => {
    expect(formatMonthYear(d("2025-02-01"))).toBe("Feb 2025");
  });
});

describe("formatDateRange", () => {
  it("formats a closed range", () => {
    expect(formatDateRange(d("2025-02-01"), d("2025-04-01"))).toBe(
      "Feb 2025 – Apr 2025",
    );
  });

  it("formats an ongoing range", () => {
    expect(formatDateRange(d("2025-12-01"), "present")).toBe(
      "Dec 2025 – Present",
    );
  });

  it("collapses a missing or same-month end to a single date", () => {
    expect(formatDateRange(d("2025-04-01"))).toBe("Apr 2025");
    expect(formatDateRange(d("2025-04-01"), d("2025-04-30"))).toBe("Apr 2025");
  });
});

describe("byMostRecent", () => {
  it("puts ongoing items first, then by most recent end, then start", () => {
    const items = [
      { id: "tutor", start: d("2022-09-01"), end: d("2025-05-01") },
      { id: "pitchfire", start: d("2025-12-01"), end: "present" as const },
      { id: "intern", start: d("2025-02-01"), end: d("2025-04-01") },
      { id: "lab", start: d("2024-09-01"), end: d("2025-05-01") },
    ];
    expect(items.sort(byMostRecent).map((i) => i.id)).toEqual([
      "pitchfire",
      "lab",
      "tutor",
      "intern",
    ]);
  });
});
