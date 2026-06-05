/**
 * Generates editorial grayscale SVG placeholders into /public/media.
 * These stand in for real photography during the static prototype.
 * They are intentionally tasteful (monochrome gradient + grain + label)
 * so the layout reads like a lookbook, with zero broken images.
 *
 * Swap-in path: replace <Media src> values with real .webp/.avif assets
 * of the same dimensions — the layout already reserves the box (no CLS).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "media");

/** deterministic hash → 0..1 */
function seed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function gray(l) {
  // warm-neutral grayscale ramp
  const v = Math.round(l * 255);
  const r = v;
  const g = Math.round(v * 0.985);
  const b = Math.round(v * 0.95);
  return `rgb(${r},${g},${b})`;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svg({ w, h, label = "", sub = "", tone, variant = 0 }) {
  const s = seed(label + variant);
  const base = tone ?? 0.34 + s * 0.42; // 0.34..0.76
  const top = Math.max(0.04, base - 0.16 - s * 0.1);
  const bottom = Math.min(0.96, base + 0.14);
  const angle = 90 + Math.round((s - 0.5) * 50);
  const id = `g${Math.round(s * 99999)}_${variant}`;
  const dark = base < 0.5;
  const fg = dark ? "rgba(243,241,236,0.92)" : "rgba(17,17,16,0.86)";
  const fgDim = dark ? "rgba(243,241,236,0.55)" : "rgba(17,17,16,0.5)";
  const cx = w / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="${id}" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${gray(top)}"/>
      <stop offset="0.55" stop-color="${gray(base)}"/>
      <stop offset="1" stop-color="${gray(bottom)}"/>
    </linearGradient>
    <filter id="n${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
  <rect width="${w}" height="${h}" filter="url(#n${id})"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="${fgDim}" stroke-width="1"/>
  ${
    label
      ? `<text x="${cx}" y="${h / 2 - 6}" text-anchor="middle" fill="${fg}" font-family="Georgia, serif" font-size="${Math.round(w * 0.052)}" font-style="italic" letter-spacing="0.5">${esc(label)}</text>`
      : ""
  }
  ${
    sub
      ? `<text x="${cx}" y="${h / 2 + Math.round(w * 0.05)}" text-anchor="middle" fill="${fgDim}" font-family="Arial, sans-serif" font-size="${Math.round(w * 0.022)}" letter-spacing="6" text-transform="uppercase">${esc(sub.toUpperCase())}</text>`
      : ""
  }
  <text x="${cx}" y="${h - 44}" text-anchor="middle" fill="${fgDim}" font-family="Arial, sans-serif" font-size="${Math.round(w * 0.02)}" letter-spacing="8">J A S P Ä R</text>
</svg>`;
}

function write(name, opts) {
  const file = join(OUT, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg(opts).trim());
}

mkdirSync(OUT, { recursive: true });

// --- Products: front (0) + alt (1) at 1200x1600 (3:4) -----------------
const products = [
  ["laced-salopette", "Laced Salopette"],
  ["raw-selvedge-wide-jean", "Raw Selvedge Wide"],
  ["deconstructed-trucker", "Deconstructed Trucker"],
  ["fourmis-tee", "Fourmis"],
  ["coeur-tee", "Cœur"],
  ["sculpted-denim-corset", "Sculpted Corset"],
  ["atelier-carpenter-trouser", "Carpenter Trouser"],
  ["bleached-panel-shirt", "Bleached Panel"],
  ["indigo-cocoon-coat", "Indigo Cocoon"],
  ["frayed-denim-maxi-skirt", "Frayed Maxi"],
  ["hand-painted-canvas-jacket", "Painted Canvas"],
  ["riveted-mesh-top", "Riveted Mesh"],
];
for (const [slug, label] of products) {
  write(`products/${slug}-1.svg`, { w: 1200, h: 1600, label, sub: "Saison Trois", variant: 0 });
  write(`products/${slug}-2.svg`, { w: 1200, h: 1600, label, sub: "Detail", variant: 1 });
}

// --- Hero / campaign (wide) -------------------------------------------
write("campaign/hero.svg", { w: 2400, h: 1500, label: "Saison Trois", sub: "Acquire", tone: 0.22 });
write("campaign/manifesto.svg", { w: 2000, h: 1400, label: "Made to order", sub: "Atelier · Paris", tone: 0.3 });

// --- Lookbook rail -----------------------------------------------------
for (let i = 1; i <= 6; i++) {
  write(`lookbook/look-${i}.svg`, { w: 1200, h: 1600, label: `Look ${String(i).padStart(2, "0")}`, sub: "Saison Trois", variant: i });
}

// --- Collections covers -----------------------------------------------
write("collections/saison-trois.svg", { w: 2400, h: 1500, label: "Saison Trois", sub: "Collection", tone: 0.25 });
write("collections/capsule-1-1-edito.svg", { w: 2400, h: 1500, label: "Capsule 1·1", sub: "Edito", tone: 0.6 });

// --- Auction lots ------------------------------------------------------
const lots = [
  ["monolith", "Monolith"],
  ["rivet-coat", "Rivet Coat"],
  ["salt-archive", "Salt Archive"],
  ["cast-bronze", "Cast Bronze"],
];
for (const [slug, label] of lots) {
  write(`auction/${slug}.svg`, { w: 1400, h: 1750, label, sub: "1 of 1", variant: 3 });
}
write("auction/cover.svg", { w: 2400, h: 1350, label: "Auction", sub: "Unique pieces · live sales", tone: 0.18 });

// --- About / atelier ---------------------------------------------------
write("about/atelier.svg", { w: 2000, h: 1400, label: "Atelier", sub: "Paris XI", tone: 0.4 });
write("about/founder.svg", { w: 1400, h: 1750, label: "The Studio", sub: "Manifesto", tone: 0.5 });

console.log("✓ media generated in public/media");
