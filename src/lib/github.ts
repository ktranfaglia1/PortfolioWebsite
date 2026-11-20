/**
 * Build-time GitHub contribution calendar. Needs a read-only token in
 * GITHUB_TOKEN (any token works; no scopes are required for public data).
 * Without a token, or if GitHub is unreachable, this returns null and the
 * activity card is simply not rendered. The build never fails because of it.
 */

export type Level = 0 | 1 | 2 | 3 | 4;

export interface Calendar {
  total: number;
  weeks: { date: string; count: number; level: Level }[][];
}

const LEVELS: Record<string, Level> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface ApiResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
}

/** Convert the GraphQL response into a compact calendar, or null if malformed. */
export function parseCalendar(body: unknown): Calendar | null {
  const cal = (body as ApiResponse)?.data?.user?.contributionsCollection
    ?.contributionCalendar;
  if (!cal || !Array.isArray(cal.weeks)) return null;
  return {
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      })),
    ),
  };
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

let cached: Promise<Calendar | null> | undefined;

export function getContributionCalendar(
  login: string,
): Promise<Calendar | null> {
  cached ??= (async () => {
    const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
    if (!token) {
      console.info(
        "[github] GITHUB_TOKEN not set; skipping the activity card.",
      );
      return null;
    }
    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "portfolio-build",
        },
        body: JSON.stringify({ query: QUERY, variables: { login } }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const calendar = parseCalendar(await response.json());
      if (!calendar) throw new Error("unexpected response shape");
      return calendar;
    } catch (error) {
      console.warn(
        `[github] Couldn't load contributions (${String(error)}); skipping the card.`,
      );
      return null;
    }
  })();
  return cached;
}
