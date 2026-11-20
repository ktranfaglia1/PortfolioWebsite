/**
 * Project filter state for /projects. State lives in the URL
 * (?category=ai-ml&tech=Python) so filtered views can be shared and survive
 * reloads. The pure functions are unit-tested; applyFilter touches the DOM.
 */

export interface FilterState {
  category: string;
  tech: string;
}

export function parseFilter(search: string): FilterState {
  const params = new URLSearchParams(search);
  return {
    category: params.get("category") ?? "",
    tech: params.get("tech") ?? "",
  };
}

/** "?category=ai-ml&tech=Python", or "" when nothing is filtered. */
export function serializeFilter(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  if (state.tech) params.set("tech", state.tech);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function matches(
  item: { categories: string[]; stack: string[] },
  state: FilterState,
): boolean {
  return (
    (!state.category || item.categories.includes(state.category)) &&
    (!state.tech || item.stack.includes(state.tech))
  );
}

/**
 * Show or hide each `[data-project]` element, and hide sections left with no
 * visible items. Returns how many items are visible.
 */
export function applyFilter(
  items: HTMLElement[],
  sections: HTMLElement[],
  state: FilterState,
): number {
  let shown = 0;
  for (const el of items) {
    const visible = matches(
      {
        categories: (el.dataset.categories ?? "").split(" ").filter(Boolean),
        stack: JSON.parse(el.dataset.stack ?? "[]") as string[],
      },
      state,
    );
    el.hidden = !visible;
    if (visible) shown++;
  }
  for (const section of sections) {
    section.hidden = !section.querySelector("[data-project]:not([hidden])");
  }
  return shown;
}
