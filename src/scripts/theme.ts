/**
 * Theme state shared by the header toggle and (Phase 4) the command palette.
 * The initial theme is applied by an inline script in BaseLayout before first
 * paint, so there is no flash; this module only handles changes.
 *
 * Until the visitor uses the toggle, the theme follows the OS setting (and
 * updates live if it changes). Once they choose, the choice is saved and wins.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "themechange";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.dispatchEvent(
    new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }),
  );
}

/** Apply and remember an explicit choice. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the
    // theme still applies for this page view.
  }
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/** Track OS theme changes for visitors who haven't chosen a theme. */
export function followSystemTheme(): void {
  window.matchMedia(LIGHT_QUERY).addEventListener("change", (e) => {
    if (readSavedTheme() === null) applyTheme(e.matches ? "light" : "dark");
  });
}
