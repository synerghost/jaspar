"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — stage épinglé (sticky) + plongée du logo + traînée de scratch.
 *
 * AUDIT iOS / production :
 *  · Hauteurs en `dvh` (CSS), aucune manipulation JS → pas de saut, transition
 *    barre d'adresse native (validé sur device en V1).
 *  · AUCUN filtre SVG (feDisplacementMap tue les perfs sur Safari mobile). Le
 *    grain « scratch » est dessiné dans la géométrie (jitter déterministe).
 *  · Effets en transform/opacity uniquement (composités GPU). Mesures en cache.
 *  · La traînée est ANCRÉE au fond : son bord bas suit le haut du logo qui
 *    descend → la signature paraît griffer la matière en s'enfonçant.
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

export function HeroParallax({ src, alt, mobileSrc, mobileSigSrc }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const img = imgRef.current;
    const logo = logoRef.current;
    const trail = trailRef.current;
    if (!section || !stage || !img || !logo || !trail) return;

    // Mesures en cache (relues au resize) → pas de lecture de layout par frame.
    let stageH = stage.clientHeight || window.innerHeight;
    let total = section.offsetHeight - window.innerHeight;
    let logoH = logo.offsetHeight;
    let startTop = (stageH - logoH) / 2; // haut du logo, position initiale

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;

      // Image : monte + zoome (couvrante grâce au scale de base 1.14)
      img.style.transform = `translate3d(0, ${(-p * 5).toFixed(2)}%, 0) scale(${(1.14 + p * 0.06).toFixed(3)})`;

      // Logo : descend et RENTRE dans l'image (s'enfonce entièrement sous le
      // bas du stage = clippé par l'image), sans fondu. À p≈0.92 il a totalement
      // disparu sous le bord ; le travel garantit qu'il sort complètement quelle
      // que soit sa taille (mobile vs desktop).
      const travel = (stageH / 2 + logoH / 2 + 16) / 0.92;
      const ty = p * travel;
      const scale = 1 - p * 0.14;
      logo.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      logo.style.opacity = "1";

      // Traînée : ancrée au fond, bord bas = haut du logo (startTop → startTop+ty)
      trail.style.top = `${startTop.toFixed(1)}px`;
      trail.style.height = `${Math.max(0, ty).toFixed(1)}px`;
      trail.style.opacity = (0.25 + 0.75 * Math.min(1, p * 1.4)).toFixed(3);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const remeasure = () => {
      stageH = stage.clientHeight || window.innerHeight;
      total = section.offsetHeight - window.innerHeight;
      logoH = logo.offsetHeight;
      startTop = (stageH - logoH) / 2;
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
        {/* Image (monte + zoome) */}
        <div
          ref={imgRef}
          className="absolute inset-0 will-change-transform"
          style={{ transform: "scale(1.14)", transformOrigin: "center 35%" }}
        >
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

        {/* Traînée de scratch — ancrée au fond, hauteur pilotée (= descente du logo) */}
        <div
          ref={trailRef}
          className="pointer-events-none absolute inset-x-0 mx-auto w-[82vw] max-w-[760px] overflow-hidden md:w-[50vw]"
          style={{ top: 0, height: 0, willChange: "height", contain: "layout paint" }}
        >
          <ScratchLines />
        </div>

        {/* Logo — descend et se dissout */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div ref={logoRef} className="w-[82vw] max-w-[760px] will-change-transform md:w-[50vw]">
            <Image
              src="/brand/signature-rotten.png"
              alt="JASPÄR"
              width={1701}
              height={936}
              priority
              sizes="(min-width:768px) 50vw, 82vw"
              className="hidden h-auto w-full object-contain md:block"
              style={{ filter: "drop-shadow(0 2px 22px rgba(0,0,0,0.5))" }}
            />
            <Image
              src={mobileSigSrc ?? "/brand/signature-rotten.png"}
              alt="JASPÄR"
              width={1701}
              height={936}
              priority
              sizes="82vw"
              className="block h-auto w-full object-contain md:hidden"
              style={{ filter: "drop-shadow(0 2px 18px rgba(0,0,0,0.55))" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ScratchLines — rayures verticales organiques, SANS filtre SVG.
   Grain dessiné dans la géométrie (jitter déterministe = pas de hydration
   mismatch, pas de coût runtime). Posé en haut du conteneur (révélé par la
   hauteur du conteneur qui croît avec la descente). Double trait = relief.
   ============================================================ */

const SVG_H = 760; // hauteur de référence des tracés (px)

// PRNG déterministe (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tracé vertical légèrement irrégulier (jagged) de y=sy à y=SVG_H
function jagged(x: number, sy: number, jitter: number, rand: () => number) {
  const steps = 26;
  let d = `M ${x.toFixed(2)} ${sy}`;
  for (let i = 1; i <= steps; i++) {
    const y = sy + ((SVG_H - sy) * i) / steps;
    const dx = (rand() * 2 - 1) * jitter;
    d += ` L ${(x + dx).toFixed(2)} ${y.toFixed(1)}`;
  }
  return d;
}

type SL = { x: number; sy: number; w: number; color: string; o: number };
// 3 groupements espacés (gauche / centre / droite) + rayures isolées étalées.
// x = % de la largeur du logo (0 = bord gauche, 100 = bord droit).
const LINES: SL[] = [
  // ── Groupe gauche (~x21) ──
  { x: 18, sy: 22, w: 1.2, color: "#6e5238", o: 0.55 }, // brun
  { x: 21, sy: 0, w: 1.8, color: "#e9e1d2", o: 0.78 },
  { x: 24, sy: 40, w: 1.0, color: "#cdb79c", o: 0.5 },

  // ── Groupe centre (~x50), aligné sur le stem ──
  { x: 47, sy: 28, w: 1.2, color: "#cdb79c", o: 0.55 },
  { x: 50, sy: 0, w: 2.0, color: "#efe9dc", o: 0.88 }, // sillon principal
  { x: 53, sy: 22, w: 1.3, color: "#5c4530", o: 0.6 }, // brun

  // ── Groupe droite (~x78) ──
  { x: 75, sy: 46, w: 1.0, color: "#e3dac9", o: 0.5 },
  { x: 78, sy: 8, w: 1.6, color: "#6e5238", o: 0.62 }, // brun
  { x: 81, sy: 58, w: 0.9, color: "#cdb79c", o: 0.44 },

  // ── Rayures isolées, étalées sur le reste de la largeur ──
  { x: 9, sy: 150, w: 0.8, color: "#cdb79c", o: 0.34 },
  { x: 35, sy: 188, w: 0.8, color: "#e3dac9", o: 0.32 },
  { x: 64, sy: 128, w: 0.9, color: "#5c4530", o: 0.4 }, // brun
  { x: 92, sy: 168, w: 0.8, color: "#cdb79c", o: 0.34 },
];

function ScratchLines() {
  return (
    <svg
      className="absolute left-0 top-0 w-full"
      style={{ height: SVG_H }}
      viewBox={`0 0 100 ${SVG_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="round">
        {LINES.map((l, i) => {
          const rand = rng(i * 97 + 13);
          const d = jagged(l.x, l.sy, 0.7, rand);
          return (
            <g key={i} style={{ opacity: l.o }}>
              {/* sillon creusé (sombre) */}
              <path
                d={d}
                stroke="#161109"
                strokeOpacity={0.4}
                strokeWidth={l.w + 1.3}
                vectorEffect="non-scaling-stroke"
              />
              {/* arête éclaircie / teinte */}
              <path d={d} stroke={l.color} strokeWidth={l.w} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
