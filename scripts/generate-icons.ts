/**
 * Generates the favicon set in public/ from the "KT" monogram:
 * favicon.svg, favicon.ico (32px PNG inside an ICO container), and
 * apple-touch-icon.png (180px). Run with `pnpm icons` after changing the mark.
 */
import { readFile, writeFile } from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";

const mono = await readFile(
  "node_modules/@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff",
);

async function monogramSvg(size: number, radius: number): Promise<string> {
  return satori(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
          backgroundColor: "#15171b",
          color: "#b49cfb",
          fontFamily: "Geist Mono",
          fontSize: size * 0.44,
          letterSpacing: -size * 0.02,
        },
        children: "KT",
      },
    } as never,
    {
      width: size,
      height: size,
      fonts: [{ name: "Geist Mono", data: mono, weight: 500 }],
    },
  );
}

/** Wrap one PNG in an ICO container (PNG-in-ICO is supported everywhere). */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

const svg = await monogramSvg(64, 14);
await writeFile("public/favicon.svg", svg);

const png32 = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer();
await writeFile("public/favicon.ico", pngToIco(png32, 32));

// iOS masks its own rounded corners, so the touch icon is a full square.
const touch = await monogramSvg(180, 0);
await sharp(Buffer.from(touch)).png().toFile("public/apple-touch-icon.png");

console.log("Wrote public/favicon.svg, favicon.ico, apple-touch-icon.png");
