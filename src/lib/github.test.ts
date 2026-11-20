import { describe, expect, it } from "vitest";
import { parseCalendar } from "./github";

describe("parseCalendar", () => {
  it("maps the GraphQL calendar to weeks of days with numeric levels", () => {
    const body = {
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: 7,
              weeks: [
                {
                  contributionDays: [
                    {
                      date: "2026-01-04",
                      contributionCount: 0,
                      contributionLevel: "NONE",
                    },
                    {
                      date: "2026-01-05",
                      contributionCount: 7,
                      contributionLevel: "FOURTH_QUARTILE",
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    };
    expect(parseCalendar(body)).toEqual({
      total: 7,
      weeks: [
        [
          { date: "2026-01-04", count: 0, level: 0 },
          { date: "2026-01-05", count: 7, level: 4 },
        ],
      ],
    });
  });

  it("returns null for errors or unexpected shapes", () => {
    expect(
      parseCalendar({ errors: [{ message: "Bad credentials" }] }),
    ).toBeNull();
    expect(parseCalendar({ data: { user: null } })).toBeNull();
    expect(parseCalendar(null)).toBeNull();
  });
});
