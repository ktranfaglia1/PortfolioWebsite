/**
 * Highlights the case-study contents link for the section being read.
 * Links are `[data-toc] a[href^="#"]`; the active one gets aria-current.
 */
export function initToc(): void {
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]'),
  ];
  const targets = links
    .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
    .filter((el): el is HTMLElement => el !== null);
  if (targets.length === 0) return;

  const setActive = (id: string) => {
    for (const a of links) {
      if (a.hash.slice(1) === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  };

  // The active section is the last heading above a line ~30% down the screen.
  const update = () => {
    const line = window.innerHeight * 0.3;
    let current = targets[0];
    for (const t of targets) {
      if (t.getBoundingClientRect().top <= line) current = t;
    }
    setActive(current.id);
  };

  let queued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true },
  );
  update();
}
