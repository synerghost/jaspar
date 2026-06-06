"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — « pointe de lecture sur vinyle » (comme l'ancien site).
 *
 *  · La SIGNATURE reste FIXE, centrée dans le cadre (la pointe).
 *  · L'IMAGE GLISSE vers le haut au scroll (le disque qui défile).
 *  · La signature grave une TRAÎNÉE dans le métal qui défile : le sillon est
 *    ancré à l'image (il monte avec elle), son point de gravure le plus récent
 *    reste au niveau de la signature → on voit la matière se faire griffer.
 *  · Pas d'ombre sur la signature → elle paraît COLLÉE au fond (sinon elle ne
 *    pourrait pas le griffer).
 *
 * AUDIT iOS / perfs :
 *  · Hauteurs en `dvh` (CSS), aucune manip JS → pas de saut barre d'adresse.
 *  · Transform-only (GPU). Aucun filtre SVG. Mesures en cache. Listeners passifs.
 */

interface HeroProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  mobileSrc?: string;
  mobileWidth?: number;
  mobileHeight?: number;
  mobileSigSrc?: string;
}

const SLIDE = 0.34; // part de la hauteur de stage parcourue par l'image

export function HeroParallax({ src, alt, mobileSrc, mobileSigSrc }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const trailLayerRef = useRef<HTMLDivElement>(null);
  const trailInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const img = imgRef.current;
    const logo = logoRef.current;
    const layer = trailLayerRef.current;
    const inner = trailInnerRef.current;
    if (!section || !stage || !img || !logo || !layer || !inner) return;

    // Mesures en cache (relues au resize).
    let stageH = stage.clientHeight || window.innerHeight;
    let total = section.offsetHeight - window.innerHeight;
    // Point de gravure enfoncé dans le haut du glyphe (~22%) → AUCUN gap : les
    // rayures émergent de derrière le logo (placé au-dessus).
    let carveTop = (stageH - logo.offsetHeight) / 2 + logo.offsetHeight * 0.22;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const slide = p * stageH * SLIDE;

      // L'image glisse vers le haut (le métal défile)
      img.style.transform = `translate3d(0, ${(-slide).toFixed(1)}px, 0)`;

      // Le sillon est ancré à l'image (il monte avec elle)
      layer.style.transform = `translate3d(0, ${(-slide).toFixed(1)}px, 0)`;
      // Bord bas du sillon = point de gravure (dans le glyphe) ; il s'allonge
      // vers le haut au fil du défilement.
      inner.style.top = `${carveTop.toFixed(1)}px`;
      inner.style.height = `${slide.toFixed(1)}px`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const remeasure = () => {
      stageH = stage.clientHeight || window.innerHeight;
      total = section.offsetHeight - window.innerHeight;
      carveTop = (stageH - logo.offsetHeight) / 2 + logo.offsetHeight * 0.22;
      onScroll();
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    window.addEventListener("orientationchange", remeasure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("orientationchange", remeasure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="Hero" className="relative -mt-14" style={{ height: "150dvh" }}>
      <div ref={stageRef} className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* Image — glisse vers le haut (surdimensionnée pour ne jamais découvrir le bas) */}
        <div ref={imgRef} className="absolute inset-x-0 top-0 will-change-transform" style={{ height: "138%" }}>
          <Image src={src} alt={alt} fill priority sizes="100vw" className="hidden object-cover md:block" />
          <Image
            src={mobileSrc ?? src}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center md:hidden"
          />
        </div>

        {/* Dégradé bas */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

        {/* Sillon gravé — ancré à l'image (même translation), derrière la signature */}
        <div ref={trailLayerRef} className="pointer-events-none absolute inset-0 will-change-transform">
          <div
            ref={trailInnerRef}
            className="absolute inset-x-0 mx-auto w-[82vw] max-w-[760px] overflow-hidden md:w-[50vw]"
            style={{ top: 0, height: 0, willChange: "height", contain: "layout paint" }}
          >
            <ScratchLines />
          </div>
        </div>

        {/* Signature — FIXE, centrée, SANS ombre (collée au fond) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div ref={logoRef} className="w-[82vw] max-w-[760px] md:w-[50vw]">
            <Image
              src="/brand/signature-rotten.png"
              alt="JASPÄR"
              width={1701}
              height={936}
              priority
              sizes="(min-width:768px) 50vw, 82vw"
              className="hidden h-auto w-full object-contain md:block"
            />
            <Image
              src={mobileSigSrc ?? "/brand/signature-rotten.png"}
              alt="JASPÄR"
              width={1701}
              height={936}
              priority
              sizes="82vw"
              className="block h-auto w-full object-contain md:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ScratchLines — sillons verticaux gravés dans la matière.

   · Irréguliers : tracés en escalier avec jitter déterministe (PRNG seedé),
     amplitude variable → aucun trait droit de machine, pas de blanc pur.
   · Intégration au fond : mix-blend-mode `overlay` + tons métal/brun (pas de
     blanc) → le sillon réagit à la matière au lieu de flotter par-dessus.
   · Relief : sillon sombre (creux) + arête éclaircie, en deux passes.
   · 3 groupements espacés + rayures isolées étalées.
   ============================================================ */

const SVG_H = 820;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tracé vertical irrégulier (liste de points) : segments de longueur variable
// + dérive latérale (pas de retour systématique au centre).
function jaggedPoints(x: number, sy: number, jitter: number, rand: () => number) {
  const pts: [number, number][] = [[x, sy]];
  let y = sy;
  let cx = x;
  while (y < SVG_H) {
    y += 13 + rand() * 28;
    if (y > SVG_H) y = SVG_H;
    cx += (rand() * 2 - 1) * jitter;
    cx = Math.max(x - jitter * 2.4, Math.min(x + jitter * 2.4, cx));
    pts.push([cx, y]);
  }
  return pts;
}

function toPath(pts: [number, number][]) {
  return pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(1)}`).join(" ");
}

// Découpe le tracé en segments d'ÉPAISSEUR VARIABLE le long de la ligne.
function varySegments(pts: [number, number][], baseW: number, rand: () => number) {
  const segs: { d: string; w: number }[] = [];
  let i = 0;
  while (i < pts.length - 1) {
    const n = 2 + Math.floor(rand() * 3); // 2-4 points
    const chunk = pts.slice(i, Math.min(pts.length, i + n + 1));
    if (chunk.length < 2) break;
    segs.push({ d: toPath(chunk), w: +(baseW * (0.4 + rand() * 1.35)).toFixed(2) });
    i += n; // partage le point de jonction → pas de trou
  }
  return segs;
}

type SL = { x: number; sy: number; w: number; color: string; o: number; jit: number };
// Espacement INÉGAL des 3 groupes + isolées réparties irrégulièrement.
// Tons métal/brun (jamais blanc), intégrés via mix-blend-mode overlay.
const LINES: SL[] = [
  // ── groupe gauche (~x16, serré) ──
  { x: 13, sy: 30, w: 1.0, color: "#8a7152", o: 0.72, jit: 1.2 },
  { x: 16, sy: 0, w: 1.8, color: "#b8a684", o: 0.95, jit: 0.7 },
  { x: 19, sy: 48, w: 1.3, color: "#7a5c3f", o: 0.82, jit: 1.0 },
  // ── groupe centre (~x45, décalé) ──
  { x: 42, sy: 34, w: 1.1, color: "#8a7152", o: 0.76, jit: 1.2 },
  { x: 45, sy: 0, w: 2.0, color: "#c2b08c", o: 1.0, jit: 0.6 },
  { x: 48, sy: 22, w: 1.4, color: "#6b4f37", o: 0.86, jit: 0.9 },
  // ── groupe droite (~x82, plus large) — ÉPAISSI ──
  { x: 78, sy: 40, w: 1.7, color: "#9c8662", o: 0.88, jit: 1.0 },
  { x: 82, sy: 6, w: 2.3, color: "#b8a684", o: 1.0, jit: 0.7 }, // épais
  { x: 86, sy: 52, w: 1.6, color: "#7a5c3f", o: 0.85, jit: 1.1 }, // épaissi
  // ── rayures isolées, réparties irrégulièrement ──
  { x: 6, sy: 150, w: 0.8, color: "#8a7152", o: 0.55, jit: 1.5 },
  { x: 31, sy: 205, w: 0.9, color: "#9c8662", o: 0.5, jit: 1.5 },
  { x: 62, sy: 120, w: 1.0, color: "#6b4f37", o: 0.62, jit: 1.3 },
  { x: 93, sy: 172, w: 0.85, color: "#8a7152", o: 0.55, jit: 1.4 },
];

// Pré-calcul déterministe (même sortie SSR/client → pas de hydration mismatch).
const SCRATCHES = LINES.map((l, i) => {
  const pts = jaggedPoints(l.x, l.sy, l.jit, rng(i * 131 + 7));
  return {
    full: toPath(pts),
    segs: varySegments(pts, l.w, rng(i * 977 + 3)),
    color: l.color,
    o: l.o,
    gw: l.w * 1.5 + 1.0, // largeur du sillon sombre
  };
});

function ScratchLines() {
  return (
    <svg
      className="absolute left-0 top-0 w-full"
      style={{ height: SVG_H, mixBlendMode: "overlay" }}
      viewBox={`0 0 100 ${SVG_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {SCRATCHES.map((s, i) => (
          <g key={i} style={{ opacity: s.o }}>
            {/* sillon creusé (sombre), largeur constante */}
            <path d={s.full} stroke="#0f0a06" strokeOpacity={0.5} strokeWidth={s.gw} vectorEffect="non-scaling-stroke" />
            {/* arête : segments d'épaisseur variable */}
            {s.segs.map((seg, j) => (
              <path key={j} d={seg.d} stroke={s.color} strokeWidth={seg.w} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
