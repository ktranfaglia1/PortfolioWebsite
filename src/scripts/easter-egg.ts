/**
 * Easter egg: the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) cycles the accent color
 * for the rest of the visit. Plus a hello in the console for curious engineers.
 */
import { toast } from "./toast";

export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Returns a key handler that calls `onMatch` whenever the last keys typed
 * equal `sequence` (case-insensitive for letters).
 */
export function sequenceMatcher(sequence: string[], onMatch: () => void) {
  const recent: string[] = [];
  return (key: string) => {
    recent.push(key.length === 1 ? key.toLowerCase() : key);
    if (recent.length > sequence.length) recent.shift();
    if (
      recent.length === sequence.length &&
      recent.every((k, i) => k === sequence[i])
    ) {
      recent.length = 0;
      onMatch();
    }
  };
}

/** Hues (OKLCH) at the same lightness/chroma as the default violet. */
export const ACCENTS = [
  { name: "mint", hue: 165 },
  { name: "amber", hue: 75 },
  { name: "rose", hue: 10 },
  { name: "sky", hue: 235 },
  { name: "violet", hue: 295 },
];

export function initEasterEgg(repoUrl: string): void {
  let index = -1;
  const onKey = sequenceMatcher(KONAMI, () => {
    index = (index + 1) % ACCENTS.length;
    const { name, hue } = ACCENTS[index]!;
    document.documentElement.style.setProperty("--accent-hue", String(hue));
    toast(`Achievement unlocked: ${name} accent. Do it again to cycle.`);
  });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    onKey(e.key);
  });

  console.log(
    "%cHey, curious engineer 👋",
    "font: 600 14px system-ui; color: oklch(0.78 0.13 295)",
    `\nThis site is open source: ${repoUrl}\nTry the Konami code, or press ⌘K / Ctrl+K.`,
  );
}
