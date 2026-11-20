import { site } from "../site.config";

/** "Projects" → "Projects | Kyle Tranfaglia". Titles that already name Kyle are kept. */
export function formatTitle(title: string, name: string = site.name): string {
  return title.includes(name) ? title : `${title} | ${name}`;
}
