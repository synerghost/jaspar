"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — signature FIXE centrée, sous le contenu (z-10), sur l'image (z-0).
 * + Traînée de rayures gravée dans le métal du hero.
 *
 * La signature est fixe au centre du viewport ; l'image du hero défile
 * (scroll natif) vers le haut. Relativement, la signature « grave » le métal
 * qui défile : la traînée vit DANS le hero (donc elle monte avec le métal),
 * son bord bas (point de gravure le plus récent) reste au centre, derrière la
 * signature ; elle s'allonge vers le haut au fil du scroll.
 *
 *   z : hero+traînée (z-0)  <  signature fixe (z-10)  <  contenu (z-20)
 */

interface Props {
  src: string;
  alt: string;
  mobileSrc?: string;
  sigSrc?: string;
}

export function HeroSignature({ src, alt, mobileSrc, sigSrc = "/brand/signature-rotten.png" }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = heroRef.current;
    const trail = trailRef.current;
    if (!hero || !trail) return;

    let heroDocTop = 0; // position document du haut du hero (constant)
    let raf = 0;

    const measure = () => {
      heroDocTop = hero.getBoundingClientRect().top + window.scrollY;
    };

    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      // Haut de la traînée (coord locale hero) — recalculé chaque frame (robuste
      // aux variations d'innerHeight) : place le contact initial au centre écran.
      trail.style.top = `${(vh / 2 - heroDocTop).toFixed(1)}px`;
      // Hauteur = distance scrollée → le bord bas reste pile au centre (la signature).
      trail.style.height = `${Math.max(0, Math.min(window.scrollY, vh)).toFixed(1)}px`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Signature — FIXE, centrée, SOUS le contenu (z-10) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-6">
        <Image
          src={sigSrc}
          alt=""
          width={1701}
          height={936}
          priority
          sizes="(min-width:768px) 46vw, 80vw"
          className="h-auto w-[80vw] max-w-[700px] object-contain md:w-[46vw]"
        />
      </div>

      {/* Hero — image métallique, SOUS la signature (z-0) */}
      <section ref={heroRef} aria-label="Hero" className="relative z-0 -mt-14 h-[100dvh] overflow-hidden">
        <Image src={src} alt={alt} fill priority sizes="100vw" className="hidden object-cover md:block" />
        <Image
          src={mobileSrc ?? src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center md:hidden"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

        {/* Traînée — gravée dans le métal, derrière la signature ; bord bas au centre */}
        <div
          ref={trailRef}
          className="pointer-events-none absolute inset-x-0 mx-auto w-[80vw] max-w-[700px] overflow-hidden md:w-[46vw]"
          style={{ top: 0, height: 0, willChange: "height", contain: "layout paint" }}
        >
          <ScratchLines />
        </div>
      </section>
    </>
  );
}

/* ============================================================
   ScratchLines — sillons verticaux en rubans pleins (épaisseur continue),
   tons métal/brun en mix-blend-mode overlay (intégrés à la matière).
   3 groupements espacés + rayures isolées. Tracés statiques pré-calculés.
   ============================================================ */

const SVG_H = 820;
const RW = 0.42; // largeur visée → unités x du viewBox (x étiré)

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function jaggedPoints(x: number, sy: number, jitter: number, rand: () => number) {
  const pts: [number, number][] = [[x, sy]];
  let y = sy;
  let cx = x;
  while (y < SVG_H) {
    y += 7 + rand() * 13;
    if (y > SVG_H) y = SVG_H;
    cx += (rand() * 2 - 1) * jitter * 0.6;
    cx = Math.max(x - jitter * 1.6, Math.min(x + jitter * 1.6, cx));
    pts.push([cx, y]);
  }
  return pts;
}

function widthProfile(n: number, baseW: number, rand: () => number) {
  const ws: number[] = [];
  let w = baseW * (0.7 + rand() * 0.4);
  for (let i = 0; i < n; i++) {
    w += (rand() * 2 - 1) * baseW * 0.1;
    w = Math.max(baseW * 0.45, Math.min(baseW * 1.4, w));
    const t = n > 1 ? i / (n - 1) : 0;
    const taper = Math.min(1, Math.min(t, 1 - t) / 0.12) * 0.7 + 0.3;
    ws.push(w * taper);
  }
  return ws;
}

function ribbon(pts: [number, number][], ws: number[]) {
  let d = `M ${(pts[0][0] - ws[0] / 2).toFixed(2)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${(pts[i][0] - ws[i] / 2).toFixed(2)} ${pts[i][1].toFixed(1)}`;
  for (let i = pts.length - 1; i >= 0; i--) d += ` L ${(pts[i][0] + ws[i] / 2).toFixed(2)} ${pts[i][1].toFixed(1)}`;
  return d + " Z";
}

type SL = { x: number; sy: number; w: number; color: string; o: number; jit: number };
const LINES: SL[] = [
  // groupe gauche (~x16)
  { x: 13, sy: 30, w: 1.0, color: "#94794f", o: 0.85, jit: 0.8 },
  { x: 16, sy: 0, w: 1.8, color: "#cdb78c", o: 1.0, jit: 0.5 },
  { x: 19, sy: 48, w: 1.3, color: "#7a5a36", o: 0.92, jit: 0.7 },
  // groupe centre (~x45)
  { x: 42, sy: 34, w: 1.1, color: "#94794f", o: 0.88, jit: 0.8 },
  { x: 45, sy: 0, w: 2.0, color: "#d6c193", o: 1.0, jit: 0.45 },
  { x: 48, sy: 22, w: 1.4, color: "#6b4d2f", o: 0.95, jit: 0.6 },
  // groupe droite (~x82)
  { x: 78, sy: 40, w: 1.7, color: "#a88f5e", o: 0.95, jit: 0.7 },
  { x: 82, sy: 6, w: 2.3, color: "#cdb78c", o: 1.0, jit: 0.5 },
  { x: 86, sy: 52, w: 1.7, color: "#7a5a36", o: 0.92, jit: 0.8 },
  // isolées étalées
  { x: 6, sy: 150, w: 0.8, color: "#94794f", o: 0.6, jit: 1.1 },
  { x: 31, sy: 205, w: 0.9, color: "#a88f5e", o: 0.58, jit: 1.1 },
  { x: 62, sy: 120, w: 1.0, color: "#6b4d2f", o: 0.7, jit: 0.9 },
  { x: 93, sy: 172, w: 0.85, color: "#94794f", o: 0.6, jit: 1.0 },
];

const SCRATCHES = LINES.map((l, i) => {
  const pts = jaggedPoints(l.x, l.sy, l.jit, rng(i * 131 + 7));
  const ws = widthProfile(pts.length, l.w * RW, rng(i * 977 + 3));
  return {
    light: ribbon(pts, ws),
    groove: ribbon(
      pts,
      ws.map((w) => w + 0.4),
    ),
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
          <path d={s.groove} fill="#0d0905" fillOpacity={0.55} />
          <path d={s.light} fill={s.color} />
        </g>
      ))}
    </svg>
  );
}
