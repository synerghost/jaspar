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

const DESCENT = 0.22; // part de la hauteur de stage parcourue par la signature (se pose dans le cadre)

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
    let startTop = (stageH - logo.offsetHeight) / 2; // haut d'origine de la signature (centrée)

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const desc = p * stageH * DESCENT; // la signature DESCEND et se pose dans le cadre

      // Image quasi fixe (léger zoom) → couvre toujours, robuste
      img.style.transform = `scale(${(1.05 + p * 0.05).toFixed(3)})`;

      // Signature : descend, SANS fade ; se pose à l'intérieur du cadre
      logo.style.transform = `translate3d(0, ${desc.toFixed(1)}px, 0)`;

      // Sillon : du haut d'origine de la signature jusqu'à son haut courant
      // (bord bas = haut du logo qui descend → en contact, sans gap)
      inner.style.top = `${startTop.toFixed(1)}px`;
      inner.style.height = `${desc.toFixed(1)}px`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const remeasure = () => {
      stageH = stage.clientHeight || window.innerHeight;
      total = section.offsetHeight - window.innerHeight;
      startTop = (stageH - logo.offsetHeight) / 2;
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
        {/* Image — fixe (léger zoom), couvre toujours le cadre */}
        <div ref={imgRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: "center" }}>
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

        {/* Sillon gravé — sur l'image (fixe), derrière la signature */}
        <div ref={trailLayerRef} className="pointer-events-none absolute inset-0">
          <div
            ref={trailInnerRef}
            className="absolute inset-x-0 mx-auto w-[82vw] max-w-[760px] overflow-hidden md:w-[50vw]"
            style={{ top: 0, height: 0, willChange: "height", contain: "layout paint" }}
          >
            <ScratchLines />
          </div>
        </div>

        {/* Signature — descend et se pose dans le cadre, SANS ombre (collée au fond) */}
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

// Tracé vertical fin et peu dévié (sharp) : beaucoup de points rapprochés.
function jaggedPoints(x: number, sy: number, jitter: number, rand: () => number) {
  const pts: [number, number][] = [[x, sy]];
  let y = sy;
  let cx = x;
  while (y < SVG_H) {
    y += 7 + rand() * 13; // pas fins → transitions de largeur douces
    if (y > SVG_H) y = SVG_H;
    cx += (rand() * 2 - 1) * jitter * 0.6; // dérive faible → rayure plus droite
    cx = Math.max(x - jitter * 1.6, Math.min(x + jitter * 1.6, cx));
    pts.push([cx, y]);
  }
  return pts;
}

// Profil d'épaisseur CONTINU (marche aléatoire douce + effilage des bouts) :
// la largeur évolue point par point, jamais d'un coup.
function widthProfile(n: number, baseW: number, rand: () => number) {
  const ws: number[] = [];
  let w = baseW * (0.7 + rand() * 0.4);
  for (let i = 0; i < n; i++) {
    w += (rand() * 2 - 1) * baseW * 0.1; // pas doux
    w = Math.max(baseW * 0.45, Math.min(baseW * 1.4, w));
    const t = n > 1 ? i / (n - 1) : 0;
    const taper = Math.min(1, Math.min(t, 1 - t) / 0.12) * 0.7 + 0.3; // pointes effilées
    ws.push(w * taper);
  }
  return ws;
}

// Ruban plein (1 forme) à largeur variable : bord gauche descendant puis bord
// droit remontant → fill net, épaisseur continue.
function ribbon(pts: [number, number][], ws: number[]) {
  let d = `M ${(pts[0][0] - ws[0] / 2).toFixed(2)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${(pts[i][0] - ws[i] / 2).toFixed(2)} ${pts[i][1].toFixed(1)}`;
  for (let i = pts.length - 1; i >= 0; i--) d += ` L ${(pts[i][0] + ws[i] / 2).toFixed(2)} ${pts[i][1].toFixed(1)}`;
  return d + " Z";
}

type SL = { x: number; sy: number; w: number; color: string; o: number; jit: number };
// Espacement INÉGAL des 3 groupes + isolées réparties irrégulièrement.
// Tons métal/brun (jamais blanc), intégrés via mix-blend-mode overlay.
const LINES: SL[] = [
  // ── groupe gauche (~x16, serré) ──
  { x: 13, sy: 30, w: 1.0, color: "#94794f", o: 0.85, jit: 0.8 },
  { x: 16, sy: 0, w: 1.8, color: "#cdb78c", o: 1.0, jit: 0.5 },
  { x: 19, sy: 48, w: 1.3, color: "#7a5a36", o: 0.92, jit: 0.7 },
  // ── groupe centre (~x45, décalé) ──
  { x: 42, sy: 34, w: 1.1, color: "#94794f", o: 0.88, jit: 0.8 },
  { x: 45, sy: 0, w: 2.0, color: "#d6c193", o: 1.0, jit: 0.45 },
  { x: 48, sy: 22, w: 1.4, color: "#6b4d2f", o: 0.95, jit: 0.6 },
  // ── groupe droite (~x82, plus large) — ÉPAISSI ──
  { x: 78, sy: 40, w: 1.7, color: "#a88f5e", o: 0.95, jit: 0.7 },
  { x: 82, sy: 6, w: 2.3, color: "#cdb78c", o: 1.0, jit: 0.5 }, // épais
  { x: 86, sy: 52, w: 1.7, color: "#7a5a36", o: 0.92, jit: 0.8 }, // épaissi
  // ── rayures isolées, réparties irrégulièrement ──
  { x: 6, sy: 150, w: 0.8, color: "#94794f", o: 0.6, jit: 1.1 },
  { x: 31, sy: 205, w: 0.9, color: "#a88f5e", o: 0.58, jit: 1.1 },
  { x: 62, sy: 120, w: 1.0, color: "#6b4d2f", o: 0.7, jit: 0.9 },
  { x: 93, sy: 172, w: 0.85, color: "#94794f", o: 0.6, jit: 1.0 },
];

const RW = 0.42; // largeur (px visés) → unités x du viewBox (x étiré ~3×)

// Pré-calcul déterministe (même sortie SSR/client → pas de hydration mismatch).
const SCRATCHES = LINES.map((l, i) => {
  const pts = jaggedPoints(l.x, l.sy, l.jit, rng(i * 131 + 7));
  const ws = widthProfile(pts.length, l.w * RW, rng(i * 977 + 3));
  return {
    light: ribbon(pts, ws),
    groove: ribbon(
      pts,
      ws.map((w) => w + 0.4),
    ), // sillon sombre légèrement plus large (bord net)
    color: l.color,
    o: l.o,
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
      {SCRATCHES.map((s, i) => (
        <g key={i} style={{ opacity: s.o }}>
          {/* sillon creusé (sombre) — fin liseré net autour de l'arête */}
          <path d={s.groove} fill="#0d0905" fillOpacity={0.55} />
          {/* arête (ton métal/brun) — épaisseur continue */}
          <path d={s.light} fill={s.color} />
        </g>
      ))}
    </svg>
  );
}
