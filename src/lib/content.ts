/**
 * Typed access to the content collections. Pages call these instead of
 * getCollection directly, so filtering (drafts) and sorting live in one place.
 */
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { projectTiers, type experienceGroups } from "../content.config";
import { byOrderThenRecent, isCurrent } from "./sort";

export type Project = CollectionEntry<"projects">;
export type Experience = CollectionEntry<"experience">;
export type ProjectTier = (typeof projectTiers)[number];
export type ExperienceGroup = (typeof experienceGroups)[number];

/** Drafts show in `pnpm dev` but never in the production build. */
const isPublished = (entry: { data: { draft: boolean } }) =>
  import.meta.env.DEV || !entry.data.draft;

const sortEntries = <
  T extends { data: Parameters<typeof byOrderThenRecent>[0] },
>(
  entries: T[],
) => entries.sort((a, b) => byOrderThenRecent(a.data, b.data));

/** Projects sorted by tier (featured, standard, archive), then order/date. */
export async function getProjects(tier?: ProjectTier): Promise<Project[]> {
  const all = await getCollection(
    "projects",
    (p) => isPublished(p) && (!tier || p.data.tier === tier),
  );
  const tierRank = (p: Project) => projectTiers.indexOf(p.data.tier);
  return all.sort(
    (a, b) => tierRank(a) - tierRank(b) || byOrderThenRecent(a.data, b.data),
  );
}

/** Featured and standard projects: the ones with a case-study page. */
export async function getProjectsWithPages(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.data.tier !== "archive");
}

export async function getExperience(
  group?: ExperienceGroup,
): Promise<Experience[]> {
  const all = await getCollection(
    "experience",
    (e) => isPublished(e) && (!group || e.data.group === group),
  );
  return sortEntries(all);
}

/** The current professional role, for the home page "Now" card. */
export async function getCurrentRole(): Promise<Experience | undefined> {
  const professional = await getExperience("professional");
  return professional.find((e) => isCurrent(e.data));
}

export async function getEducation() {
  return getCollection("education");
}

export async function getSkillGroups() {
  const groups = await getCollection("skills");
  return groups.sort((a, b) => a.data.order - b.data.order);
}

/** Copy for one page from pages.yaml. Throws if the id is missing. */
export async function getPage(id: string) {
  const page = await getEntry("pages", id);
  if (!page) throw new Error(`No entry "${id}" in src/content/pages.yaml`);
  return page.data;
}
