/**
 * Minimal toast: one polite live region, reused. Used by the command palette
 * (copy email) and the easter egg.
 */
let region: HTMLElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(message: string, ms = 3000): void {
  if (!region) {
    region = document.createElement("div");
    region.setAttribute("role", "status");
    region.className =
      "toast pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-fg shadow-card opacity-0 transition-opacity duration-200";
    document.body.append(region);
  }
  region.textContent = message;
  region.classList.remove("opacity-0");
  clearTimeout(timer);
  timer = setTimeout(() => region?.classList.add("opacity-0"), ms);
}
