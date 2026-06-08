"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — signature FIXE centrée, sous le contenu (z-10), sur l'image (z-0).
 * + Traînée de rayures gravée dans le métal, ANCRÉE au contour réel du glyphe.
 *
 * Scroll inchangé : signature fixe au centre, le contenu (z-20) la recouvre.
 *
 * Rayures : chaque rayure DÉBUTE exactement sur le bord supérieur du glyphe à
 * son x (contour échantillonné depuis l'alpha du PNG) → aucun décalage. La
 * gravure se révèle par rayure (stroke-dashoffset piloté par `--reveal`) depuis
 * ce point d'ancrage, vers le haut, à mesure que le métal défile.
 */

interface Props {
  src: string;
  alt: string;
  mobileSrc?: string;
  sigSrc?: string;
}

const SIG_RATIO = 936 / 1701; // hauteur/largeur du glyphe
const LEN = 185; // longueur des rayures en unités viewBox (x:0-100)

export function HeroSignature({ src, alt, mobileSrc, sigSrc = "/brand/signature-rotten.png" }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = heroRef.current;
    const trail = trailRef.current;
    if (!hero || !trail) return;

    let heroDocTop = 0;
    let raf = 0;

    const measure = () => {
      heroDocTop = hero.getBoundingClientRect().top + window.scrollY;
      const boxW = trail.offsetWidth;
      const boxH = boxW * SIG_RATIO;
      // La traînée recouvre EXACTEMENT la boîte de la signature (centrée) à
      // scroll 0 → le contour SVG tombe pile sur le glyphe.
      trail.style.top = `${(window.innerHeight / 2 - boxH / 2).toFixed(1)}px`;
      trail.style.height = `${boxH.toFixed(1)}px`;
    };

    const tick = () => {
      raf = 0;
      const boxW = trail.offsetWidth || 1;
      const lenPx = (LEN * boxW) / 100; // longueur d'une rayure à l'écran
      const reveal = Math.max(0, Math.min(1, (window.scrollY - heroDocTop) / lenPx));
      // Posé sur la racine → rayures (dans le hero) ET poussière (couche fixe)
      // en héritent toutes les deux.
      document.documentElement.style.setProperty("--reveal", reveal.toFixed(4));
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
      {/* Poussière — le métal s'effrite au point de gravure (fixe, sous la signature) */}
      <Dust />

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

        {/* Traînée — boîte calée sur la signature ; rayures ancrées au contour du glyphe */}
        <div
          ref={trailRef}
          className="pointer-events-none absolute inset-x-0 mx-auto w-[80vw] max-w-[700px] md:w-[46vw]"
          style={{ top: 0, height: 0 }}
        >
          <ScratchLines />
        </div>
      </section>
    </>
  );
}

/* ============================================================
   Dust — poussière qui se détache au point de gravure (centre écran).
   Couche fixe (comme la signature), opacité pilotée par --reveal → la poussière
   « monte » avec le scroll (le mur s'effrite), puis recouverte par le contenu.
   Particules animées en CSS (transform/opacity) → GPU, perf mobile ok.
   ============================================================ */

const DUST = Array.from({ length: 38 }, (_, i) => {
  const r = rng(i * 73 + 11);
  return {
    left: +(r() * 100).toFixed(1),
    // concentré vers le centre vertical (la zone de gravure)
    top: +(20 + r() * 60).toFixed(1),
    size: +(2 + r() * 3.4).toFixed(2),
    delay: +(r() * 5).toFixed(2),
    dur: +(3 + r() * 4).toFixed(2),
    dx: +((r() * 2 - 1) * 22).toFixed(1),
    dy: +(30 + r() * 60).toFixed(1),
    peak: +(0.6 + r() * 0.4).toFixed(2),
    brown: r() > 0.5,
  };
});

function Dust() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[15] flex items-center justify-center">
      <div
        className="relative h-[62vh] w-[92vw] max-w-[820px] md:w-[56vw]"
        style={{ opacity: "var(--reveal, 0)" }}
      >
        {DUST.map((d, i) => (
          <span
            key={i}
            className="dust-mote"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              background: d.brown ? "rgba(166,134,88,0.95)" : "rgba(228,212,178,0.98)",
              boxShadow: d.brown ? "0 0 2px rgba(166,134,88,0.6)" : "0 0 3px rgba(228,212,178,0.7)",
              ["--dur" as string]: `${d.dur}s`,
              ["--delay" as string]: `${d.delay}s`,
              ["--dx" as string]: `${d.dx}px`,
              ["--dy" as string]: `${d.dy}px`,
              ["--peak" as string]: d.peak,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ScratchLines — chaque rayure démarre PILE sur le contour supérieur du glyphe
   (échantillonné), puis descend (= monte à l'écran une fois le métal défilé).
   Révélée depuis son ancrage via stroke-dashoffset = 1 − var(--reveal).
   Tons métal/brun en mix-blend-mode overlay (intégrés à la matière).
   viewBox 0 0 100 55 (aspect du glyphe) ; overflow visible.
   ============================================================ */

const VB_H = 55; // 100 × (936/1701) ≈ 55 → mapping uniforme

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Rayure : part de (x, syVB) — le contour du glyphe — et DESCEND de LEN (viewBox),
// avec une légère dérive latérale. (Descendre en viewBox = monter à l'écran.)
function jaggedDown(x: number, syVB: number, jitter: number, rand: () => number, lm = 1) {
  const pts: [number, number][] = [[x, syVB]];
  const end = syVB + LEN * lm;
  let y = syVB;
  let cx = x;
  while (y < end) {
    y += 6 + rand() * 10;
    if (y > end) y = end;
    cx += (rand() * 2 - 1) * jitter * 0.5;
    cx = Math.max(x - jitter, Math.min(x + jitter, cx));
    pts.push([cx, y]);
  }
  return pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
}

// fy = fraction du contour SUPÉRIEUR du glyphe (échantillonné depuis l'alpha).
// w = épaisseur en UNITÉS viewBox (pas de non-scaling-stroke → reveal OK sur Safari).
type SL = { x: number; fy: number; w: number; color: string; o: number; jit: number; lm?: number };
const LINES: SL[] = [
  // groupe gauche (bras montant)
  { x: 13, fy: 0.447, w: 0.34, color: "#94794f", o: 0.85, jit: 1.4 },
  { x: 18, fy: 0.347, w: 0.5, color: "#cdb78c", o: 1.0, jit: 1.2 },
  // groupe centre (pic / T)
  { x: 42, fy: 0.082, w: 0.42, color: "#94794f", o: 0.9, jit: 1.0 },
  { x: 45, fy: 0.071, w: 0.66, color: "#d6c193", o: 1.0, jit: 0.8 },
  { x: 50, fy: 0.062, w: 0.48, color: "#6b4d2f", o: 0.95, jit: 0.9 },
  { x: 55, fy: 0.104, w: 0.42, color: "#cdb78c", o: 0.9, jit: 1.0 },
  // groupe droite (pics droite)
  { x: 62, fy: 0.075, w: 0.58, color: "#a88f5e", o: 0.95, jit: 0.9 },
  { x: 78, fy: 0.19, w: 0.52, color: "#7a5a36", o: 0.92, jit: 1.2 },
  // isolées (extrémités du glyphe)
  { x: 6, fy: 0.378, w: 0.28, color: "#94794f", o: 0.6, jit: 1.6 },
  { x: 31, fy: 0.159, w: 0.3, color: "#a88f5e", o: 0.62, jit: 1.4 },
  { x: 86, fy: 0.306, w: 0.3, color: "#6b4d2f", o: 0.68, jit: 1.4 },
  { x: 93, fy: 0.471, w: 0.28, color: "#94794f", o: 0.58, jit: 1.6 },
  // égratinures (scuffs) — plus courtes que les traînées, dispersées, visibles
  { x: 24, fy: 0.3, w: 0.42, color: "#cdb78c", o: 0.85, jit: 2.2, lm: 0.5 },
  { x: 37, fy: 0.1, w: 0.46, color: "#d6c193", o: 0.9, jit: 1.9, lm: 0.6 },
  { x: 58, fy: 0.09, w: 0.4, color: "#a88f5e", o: 0.85, jit: 2.0, lm: 0.52 },
  { x: 70, fy: 0.13, w: 0.44, color: "#cdb78c", o: 0.85, jit: 2.2, lm: 0.58 },
  { x: 34, fy: 0.12, w: 0.36, color: "#6b4d2f", o: 0.8, jit: 1.8, lm: 0.44 },
  { x: 66, fy: 0.085, w: 0.34, color: "#6b4d2f", o: 0.8, jit: 1.9, lm: 0.46 },
];

const SCRATCHES = LINES.map((l, i) => ({
  d: jaggedDown(l.x, l.fy * VB_H, l.jit, rng(i * 131 + 7), l.lm ?? 1),
  w: l.w,
  color: l.color,
  o: l.o,
}));

function ScratchLines() {
  const reveal = { strokeDashoffset: "calc(1 - var(--reveal, 0))" } as const;
  return (
    <svg
      className="absolute left-0 top-0 h-full w-full"
      style={{ overflow: "visible", mixBlendMode: "overlay" }}
      viewBox={`0 0 100 ${VB_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {SCRATCHES.map((s, i) => (
          <g key={i} style={{ opacity: s.o }}>
            {/* sillon creusé (sombre) — épaisseur en unités viewBox, pas de non-scaling */}
            <path
              d={s.d}
              stroke="#0d0905"
              strokeOpacity={0.55}
              strokeWidth={s.w + 0.28}
              pathLength={1}
              strokeDasharray="1 1"
              style={reveal}
            />
            {/* arête (ton métal / brun) */}
            <path d={s.d} stroke={s.color} strokeWidth={s.w} pathLength={1} strokeDasharray="1 1" style={reveal} />
          </g>
        ))}
      </g>
    </svg>
  );
}
