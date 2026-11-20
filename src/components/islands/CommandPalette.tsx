/**
 * ⌘K command palette. Loaded on demand by src/scripts/command-palette.ts the
 * first time it's opened, so pages ship no React until someone uses it.
 */
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import type { PaletteItem } from "../../lib/palette";
import { toggleTheme } from "../../scripts/theme";
import { toast } from "../../scripts/toast";

const groups: PaletteItem["group"][] = [
  "Pages",
  "Projects",
  "Actions",
  "Elsewhere",
];

function run(item: PaletteItem) {
  const a = item.action;
  switch (a.type) {
    case "link":
      if (a.external) window.open(a.href, "_blank", "noopener,noreferrer");
      else window.location.assign(a.href);
      break;
    case "download": {
      const link = Object.assign(document.createElement("a"), {
        href: a.href,
        download: "",
      });
      link.click();
      break;
    }
    case "copy":
      navigator.clipboard
        .writeText(a.text)
        .then(() => toast(`${a.label} copied`))
        .catch(() => toast(`Couldn't copy. ${a.text}`));
      break;
    case "theme":
      toggleTheme();
      break;
  }
}

export default function CommandPalette({
  items,
  openSignal,
}: {
  items: PaletteItem[];
  /** Incremented by the loader each time a trigger asks to open. */
  openSignal: number;
}) {
  const [open, setOpen] = useState(openSignal > 0);

  useEffect(() => {
    if (openSignal > 0) setOpen(true);
  }, [openSignal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      loop
      overlayClassName="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm"
      contentClassName="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
    >
      <Command.Input
        placeholder="Search pages, projects, actions…"
        className="h-14 w-full border-b border-line bg-transparent px-5 text-fg outline-none placeholder:text-fg-subtle"
      />
      <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-fg-muted">
          No results.
        </Command.Empty>
        {groups.map((group) => (
          <Command.Group
            key={group}
            heading={group}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-fg-subtle"
          >
            {items
              .filter((i) => i.group === group)
              .map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.id}`}
                  keywords={item.keywords}
                  onSelect={() => {
                    setOpen(false);
                    run(item);
                  }}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm text-fg-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg"
                >
                  <span className="truncate">{item.label}</span>
                  {item.hint && (
                    <span className="shrink-0 truncate font-mono text-xs text-fg-subtle">
                      {item.hint}
                    </span>
                  )}
                </Command.Item>
              ))}
          </Command.Group>
        ))}
      </Command.List>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-xs text-fg-subtle">
        <span>↑↓ to move · ↵ to open</span>
        <span>esc to close</span>
      </div>
    </Command.Dialog>
  );
}
