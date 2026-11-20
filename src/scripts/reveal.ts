/**
 * Scroll reveal. The inline head script adds `reveal` to <html> only when JS
 * runs and the visitor hasn't asked for reduced motion; CSS hides
 * [data-reveal] elements only under that class. This script marks them
 * visible as they enter the viewport. Without JS, nothing is ever hidden.
 */
export function initReveal(): void {
  const root = document.documentElement;
  if (!root.classList.contains("reveal")) return;

  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    root.classList.remove("reveal");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  items.forEach((el) => observer.observe(el));
}
