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
    let logoTop = (stageH - logo.offsetHeight) / 2; // haut de la signature (centrée)

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
      // Bord bas du sillon = haut de la signature (point de gravure courant) ;
      // il s'allonge vers le haut au fil du défilement.
      inner.style.top = `${logoTop.toFixed(1)}px`;
      inner.style.height = `${slide.toFixed(1)}px`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const remeasure = () => {
      stageH = stage.clientHeight || window.innerHeight;
      total = section.offsetHeight - window.innerHeight;
      logoTop = (stageH - logo.offsetHeight) / 2;
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

// Tracé vertical irrégulier : pas de longueur aléatoire + dérive latérale.
function jagged(x: number, sy: number, jitter: number, rand: () => number) {
  let d = `M ${x.toFixed(2)} ${sy}`;
  let y = sy;
  let cx = x;
  while (y < SVG_H) {
    y += 14 + rand() * 26; // segments de longueur variable
    if (y > SVG_H) y = SVG_H;
    cx += (rand() * 2 - 1) * jitter; // dérive latérale (pas un retour systématique)
    cx = Math.max(x - jitter * 2.2, Math.min(x + jitter * 2.2, cx));
    d += ` L ${cx.toFixed(2)} ${y.toFixed(1)}`;
  }
  return d;
}

type SL = { x: number; sy: number; w: number; color: string; o: number; jit: number };
// tons métal/brun (jamais blanc) ; intégrés via mix-blend-mode overlay
const LINES: SL[] = [
  // groupe gauche (~x21)
  { x: 18, sy: 22, w: 1.2, color: "#7a5c3f", o: 0.85, jit: 1.0 },
  { x: 21, sy: 0, w: 1.7, color: "#b8a684", o: 0.95, jit: 0.7 },
  { x: 24, sy: 40, w: 1.0, color: "#8a7152", o: 0.7, jit: 1.2 },
  // groupe centre (~x50)
  { x: 47, sy: 28, w: 1.2, color: "#8a7152", o: 0.78, jit: 1.1 },
  { x: 50, sy: 0, w: 1.9, color: "#c2b08c", o: 1.0, jit: 0.6 },
  { x: 53, sy: 22, w: 1.3, color: "#6b4f37", o: 0.82, jit: 0.9 },
  // groupe droite (~x78)
  { x: 75, sy: 46, w: 1.0, color: "#9c8662", o: 0.7, jit: 1.2 },
  { x: 78, sy: 8, w: 1.6, color: "#7a5c3f", o: 0.9, jit: 0.8 },
  { x: 81, sy: 58, w: 0.9, color: "#8a7152", o: 0.62, jit: 1.3 },
  // rayures isolées étalées
  { x: 9, sy: 150, w: 0.8, color: "#8a7152", o: 0.55, jit: 1.4 },
  { x: 35, sy: 188, w: 0.8, color: "#9c8662", o: 0.5, jit: 1.5 },
  { x: 64, sy: 128, w: 0.9, color: "#6b4f37", o: 0.6, jit: 1.3 },
  { x: 92, sy: 168, w: 0.8, color: "#8a7152", o: 0.52, jit: 1.4 },
];

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
        {LINES.map((l, i) => {
          const d = jagged(l.x, l.sy, l.jit, rng(i * 131 + 7));
          return (
            <g key={i} style={{ opacity: l.o }}>
              {/* sillon creusé (sombre) */}
              <path d={d} stroke="#0f0a06" strokeOpacity={0.55} strokeWidth={l.w + 1.2} vectorEffect="non-scaling-stroke" />
              {/* arête (ton métal/brun, pas de blanc) */}
              <path d={d} stroke={l.color} strokeWidth={l.w} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
