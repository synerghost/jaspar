/**
 * Converts GIF product images → WebP (first frame, max 1200px, q85).
 * Also generates a 600px thumbnail (-thumb) for product card hover.
 * Fix for audit P0 #1: GIF → modern format, massive size reduction.
 */
import { createRequire } from "node:module";
import { readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("/Applications/MAMP/htdocs/jaspar/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", ".scrape", "gifs");
const OUT = join(__dirname, "..", "public", "media", "products");
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith(".gif"));
let converted = 0, skipped = 0;

for (const file of files) {
  const stem = basename(file, ".gif");
  const full = join(OUT, `${stem}.webp`);
  const thumb = join(OUT, `${stem}-thumb.webp`);

  try {
    const src = join(SRC, file);

    if (!existsSync(full)) {
      await sharp(src, { pages: 1 }) // first frame only — static, no animation
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(full);
    }

    if (!existsSync(thumb)) {
      await sharp(src, { pages: 1 })
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toFile(thumb);
    }

    const size = (await import("node:fs")).statSync(full).size;
    const gifSize = (await import("node:fs")).statSync(src).size;
    const ratio = Math.round((1 - size / gifSize) * 100);
    console.log(`✓ ${stem} → ${Math.round(size / 1024)}KB webp (was ${Math.round(gifSize / 1024)}KB gif, −${ratio}%)`);
    converted++;
  } catch (e) {
    console.error(`✗ ${file}: ${e.message}`);
    skipped++;
  }
}
console.log(`\nDone: ${converted} converted, ${skipped} errors`);
