/**
 * Lazy loader for the command palette. Listens for ⌘K / Ctrl+K and clicks on
 * [data-palette-trigger]; on first use it imports React + the palette and
 * mounts it. Opening re-renders with a new `openSignal`, which is reliable
 * even if React hasn't finished mounting. After mounting, the palette owns ⌘K.
 */
import type { PaletteItem } from "../lib/palette";

let render: ((openSignal: number) => void) | null = null;
let loading: Promise<void> | null = null;
let signal = 0;

function readItems(): PaletteItem[] {
  const el = document.getElementById("palette-data");
  try {
    return el?.textContent ? (JSON.parse(el.textContent) as PaletteItem[]) : [];
  } catch {
    return [];
  }
}

function load(): Promise<void> {
  loading ??= (async () => {
    const [{ createElement }, { createRoot }, mod] = await Promise.all([
      import("react"),
      import("react-dom/client"),
      import("../components/islands/CommandPalette"),
    ]);
    const host = document.createElement("div");
    host.id = "command-palette";
    document.body.append(host);
    const root = createRoot(host);
    const items = readItems();
    render = (openSignal) =>
      root.render(createElement(mod.default, { items, openSignal }));
    render(signal);
    document.removeEventListener("keydown", onKey);
  })();
  return loading;
}

function openPalette() {
  signal += 1;
  if (render) render(signal);
  else void load();
}

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette();
  }
}

export function initCommandPalette(): void {
  document.addEventListener("keydown", onKey);
  // Show "Ctrl" instead of "⌘" outside Apple platforms.
  if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    document
      .querySelectorAll("[data-shortcut-mod]")
      .forEach((el) => (el.textContent = "Ctrl "));
  }
  for (const trigger of document.querySelectorAll<HTMLElement>(
    "[data-palette-trigger]",
  )) {
    trigger.addEventListener("click", openPalette);
    // Warm the chunk when the visitor shows intent.
    trigger.addEventListener("pointerenter", () => void load(), { once: true });
    trigger.addEventListener("focus", () => void load(), { once: true });
  }
}
