/**
 * Cursor spotlight on cards: sets --spot-x/--spot-y on [data-spotlight]
 * elements so CSS can draw a soft radial highlight under the pointer.
 * Mouse/pen only; touch has no hover.
 */
export function initSpotlight(): void {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-spotlight]",
      );
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    },
    { passive: true },
  );
}
