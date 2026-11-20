/**
 * Open Graph image rendering (1200×630 PNG) with Satori → SVG → sharp → PNG.
 * Runs at build time only. Satori can't read CSS variables, so the colors
 * below mirror the dark-theme tokens in src/styles/global.css as hex.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

export const OG_SIZE = { width: 1200, height: 630 } as const;
const PADDING = 72;
const CONTENT_WIDTH = OG_SIZE.width - PADDING * 2;

const color = {
  canvas: "#0b0c0f",
  surface: "#15171b",
  line: "#2a2d33",
  fg: "#f2f3f5",
  muted: "#b3b7bf",
  subtle: "#959aa3",
  accent: "#b49cfb",
};

/** "/" → "/og/home.png"; "/projects/celite" → "/og/projects/celite.png". */
export function ogImagePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "").replace(/^\/+/, "");
  return `/og/${clean || "home"}.png`;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (
  type: string,
  style: Record<string, unknown>,
  ...children: (Node | string | false | undefined)[]
): Node => ({
  type,
  props: {
    style,
    children: children.filter((c) => c !== false && c !== undefined),
  },
});

let fonts:
  | Promise<{ name: string; data: Buffer; weight: 400 | 500 | 600 }[]>
  | undefined;
function loadFonts() {
  const dir = (pkg: string) =>
    join(process.cwd(), "node_modules", "@fontsource", pkg, "files");
  fonts ??= Promise.all([
    readFile(join(dir("geist"), "geist-latin-400-normal.woff")),
    readFile(join(dir("geist"), "geist-latin-600-normal.woff")),
    readFile(join(dir("geist-mono"), "geist-mono-latin-500-normal.woff")),
  ]).then(([regular, semibold, mono]) => [
    { name: "Geist", data: regular, weight: 400 },
    { name: "Geist", data: semibold, weight: 600 },
    { name: "Geist Mono", data: mono, weight: 500 },
  ]);
  return fonts;
}

export interface OgInput {
  eyebrow: string;
  title: string;
  description?: string;
  /** Footer line, e.g. "Kyle Tranfaglia · Software Engineer". */
  footer: string;
  domain: string;
}

export async function renderOgImage(input: OgInput): Promise<Buffer> {
  const titleSize =
    input.title.length > 48 ? 56 : input.title.length > 28 ? 68 : 84;

  const tree = h(
    "div",
    {
      // Satori sizes boxes content-box style: padding is added to these.
      width: CONTENT_WIDTH,
      height: OG_SIZE.height - PADDING * 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: PADDING,
      backgroundColor: color.canvas,
      backgroundImage: `radial-gradient(circle at 85% 0%, rgba(180, 156, 251, 0.22), transparent 55%)`,
      fontFamily: "Geist",
      color: color.fg,
    },
    h(
      "div",
      { display: "flex", alignItems: "center", gap: 20 },
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: 16,
          border: `2px solid ${color.line}`,
          backgroundColor: color.surface,
          color: color.accent,
          fontFamily: "Geist Mono",
          fontSize: 26,
        },
        "KT",
      ),
      h(
        "div",
        { fontFamily: "Geist Mono", fontSize: 26, color: color.muted },
        input.domain,
      ),
    ),
    h(
      "div",
      { display: "flex", flexDirection: "column", width: CONTENT_WIDTH },
      h(
        "div",
        {
          fontFamily: "Geist Mono",
          fontSize: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: color.accent,
        },
        input.eyebrow,
      ),
      h(
        "div",
        {
          marginTop: 20,
          width: CONTENT_WIDTH,
          fontSize: titleSize,
          fontWeight: 600,
          letterSpacing: -2,
          lineHeight: 1.05,
        },
        input.title,
      ),
      input.description &&
        h(
          "div",
          {
            marginTop: 28,
            width: CONTENT_WIDTH,
            fontSize: 30,
            lineHeight: 1.4,
            color: color.muted,
            display: "block",
            lineClamp: 2,
          },
          input.description,
        ),
    ),
    h(
      "div",
      {
        display: "flex",
        width: CONTENT_WIDTH,
        borderTop: `2px solid ${color.line}`,
        paddingTop: 28,
        fontSize: 24,
        color: color.subtle,
      },
      input.footer,
    ),
  );

  const svg = await satori(tree as never, {
    ...OG_SIZE,
    fonts: await loadFonts(),
  });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
