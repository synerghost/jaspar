"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — stage épinglé (sticky, hauteurs CSS dvh) + plongée parallax du logo.
 *
 * Hauteurs en `dvh` (PAS de recalcul JS depuis innerHeight) : sur iOS la barre
 * d'adresse fait varier innerHeight pendant le scroll ; recalculer les hauteurs
 * à chaque resize rendait le scroll saccadé. En `dvh` le layout est stable et
 * le scroll reste fluide ; la progression est lue via getBoundingClientRect.
 *
 * Au scroll épinglé :
 *   · l'image monte + zoome (parallaxe de fond) ;
 *   · le logo DESCEND du centre jusqu'en bas et s'enfonce (scale↓ + fade)
 *     → plongée dans l'image ;
 *   · des rayures verticales se gravent du haut jusqu'en bas, suivant la
 *     descente (traînée de scratch réaliste).
 *
 * `--scratch` (0→1) est posé sur le stage à chaque frame.
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const img = imgRef.current;
    const logo = logoRef.current;
    if (!section || !stage || !img || !logo) return;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight; // distance épinglée
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const stageH = stage.clientHeight || window.innerHeight;

      // Image : monte + zoome (couvrante grâce au scale de base 1.16)
      img.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}%, 0) scale(${(1.16 + p * 0.07).toFixed(3)})`;

      // Logo : descend jusqu'en bas, puis plonge (scale↓ + fade)
      const ty = p * stageH * 0.5;
      const scale = 1 - p * 0.22;
      const op = p < 0.85 ? 1 : Math.max(0.18, 1 - ((p - 0.85) / 0.15) * 0.82);
      logo.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      logo.style.opacity = op.toFixed(3);

      stage.style.setProperty("--scratch", p.toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="Hero" className="relative -mt-14" style={{ height: "165dvh" }}>
      {/* Stage épinglé */}
      <div ref={stageRef} className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* Image (monte + zoome) */}
        <div
          ref={imgRef}
          className="absolute inset-0 will-change-transform"
          style={{ transform: "scale(1.16)", transformOrigin: "center 35%" }}
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

        {/* Rayures gravées sur le fond, derrière le logo */}
        <ScratchTrail />

        {/* Logo — descend et plonge */}
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
   ScratchTrail — rayures verticales gravées dans la matière.

   Réalisme (repris de la V1) :
   · filtre `sig-rough` (feTurbulence + feDisplacementMap) → bords
     effilochés, jamais des lignes nettes de machine ;
   · double trait par rayure : sillon SOMBRE (creux) + arête CLAIRE
     (métal mis à nu) → profondeur 3D ;
   · léger jitter Bézier dans le tracé → rayures non parfaitement
     droites mais globalement verticales ;
   · teinte brune par endroits via un dégradé vertical ;
   · clusters de 2-3 rayures rapprochées (aspect naturel) ;
   · tracé révélé du haut vers le bas via stroke-dashoffset + --scratch.

   viewBox 0 0 100 100, preserveAspectRatio="none" (coords = % du stage),
   vector-effect non-scaling-stroke (épaisseur px constante).
   ============================================================ */

const Y0 = 26; // départ (haut, près du logo)
const Y1 = 100; // jusqu'en bas

type Line = { d: string; w: number; color: string; o: number; dark?: number };

// Tracé vertical avec un léger jitter (waver) maîtrisé autour de x.
function v(x: number, a: number, b: number, c: number) {
  return `M ${x} ${Y0} C ${(x + a).toFixed(2)} 45, ${(x + b).toFixed(2)} 72, ${(x + c).toFixed(2)} ${Y1}`;
}

const CLUSTERS: { lines: Line[] }[] = [
  {
    lines: [
      { d: v(38.4, 0.5, -0.5, 0.3), w: 1.1, color: "#d7cab1", o: 0.5 },
      { d: v(40.0, -0.4, 0.6, -0.2), w: 1.8, color: "url(#scratch-grad)", o: 0.78, dark: 0.42 },
      { d: v(42.0, 0.6, -0.3, 0.5), w: 1.2, color: "#5e4633", o: 0.6 },
    ],
  },
  {
    lines: [
      { d: v(48.0, -0.5, 0.4, -0.4), w: 1.3, color: "#6e5238", o: 0.58 },
      { d: v(50.0, 0.4, -0.6, 0.3), w: 2.2, color: "url(#scratch-grad)", o: 0.9, dark: 0.46 },
      { d: v(52.4, -0.3, 0.5, -0.2), w: 1.2, color: "#efe9dc", o: 0.62 },
    ],
  },
  {
    lines: [
      { d: v(58.6, 0.5, -0.4, 0.4), w: 1.2, color: "#efe9dc", o: 0.55 },
      { d: v(60.6, -0.5, 0.5, -0.3), w: 1.7, color: "url(#scratch-grad)", o: 0.74, dark: 0.4 },
      { d: v(62.4, 0.4, -0.5, 0.5), w: 1.1, color: "#5e4633", o: 0.5 },
    ],
  },
];

function ScratchTrail() {
  const reveal = { strokeDashoffset: "calc(1 - var(--scratch, 0))" };
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ overflow: "visible" }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="sig-rough" x="-20%" y="-10%" width="140%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.12" numOctaves={2} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* clair → brun → clair → brun : teinte brune par endroits */}
        <linearGradient id="scratch-grad" x1="0" y1={Y0} x2="0" y2={Y1} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9e2d4" />
          <stop offset="24%" stopColor="#6e5238" />
          <stop offset="46%" stopColor="#ddd0b8" />
          <stop offset="68%" stopColor="#5c4530" />
          <stop offset="100%" stopColor="#e3dac9" />
        </linearGradient>
      </defs>

      <g fill="none" strokeLinecap="round" filter="url(#sig-rough)">
        {CLUSTERS.map((c, ci) =>
          c.lines.map((l, li) => (
            <g key={`${ci}-${li}`} style={{ opacity: `calc(var(--scratch, 0) * ${l.o})` }}>
              {/* sillon creusé (sombre) */}
              <path
                d={l.d}
                stroke="#1a1410"
                strokeOpacity={l.dark ?? 0.3}
                strokeWidth={l.w + 1.4}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                style={reveal}
              />
              {/* arête éclaircie (métal / teinte) */}
              <path
                d={l.d}
                stroke={l.color}
                strokeWidth={l.w}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                style={reveal}
              />
            </g>
          )),
        )}
      </g>
    </svg>
  );
}
