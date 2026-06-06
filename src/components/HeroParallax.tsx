"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — stage épinglé (sticky) + plongée parallax du logo + traînée de scratch.
 *
 * AUDIT iOS / production :
 *  · Hauteurs en `dvh` (CSS), AUCUNE manipulation JS des hauteurs. Sur iOS la
 *    barre d'adresse change innerHeight pendant le scroll ; recalculer les
 *    hauteurs en JS provoquait des sauts. `dvh` est géré nativement et reste
 *    fluide (validé sur device).
 *  · La progression `p` est lue via getBoundingClientRect (robuste à toutes les
 *    unités de viewport).
 *  · Effets en transform/opacity uniquement (composités GPU) → pas de reflow.
 *  · Le grain « scratch » (filtre SVG coûteux) est rasterisé UNE fois sur des
 *    tracés statiques ; la révélation au scroll passe par un `clip-path` (cheap)
 *    → pas de recalcul de filtre par frame (sinon jank mobile).
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

    // Mesures mises en cache (relues seulement au resize) → pas de lecture de
    // layout par frame pendant le scroll.
    let stageH = stage.clientHeight || window.innerHeight;
    let total = section.offsetHeight - window.innerHeight;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;

      // Image : monte + zoome (couvrante grâce au scale de base 1.14)
      img.style.transform = `translate3d(0, ${(-p * 5).toFixed(2)}%, 0) scale(${(1.14 + p * 0.06).toFixed(3)})`;

      // Logo : descend jusqu'en bas puis plonge (scale↓ + fade)
      const ty = p * stageH * 0.5;
      const scale = 1 - p * 0.2;
      const op = p < 0.86 ? 1 : Math.max(0.15, 1 - ((p - 0.86) / 0.14) * 0.85);
      logo.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      logo.style.opacity = op.toFixed(3);

      // Reveal des rayures (consommé par le clip-path, cheap)
      stage.style.setProperty("--scratch", p.toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const remeasure = () => {
      stageH = stage.clientHeight || window.innerHeight;
      total = section.offsetHeight - window.innerHeight;
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
    <section ref={sectionRef} aria-label="Hero" className="relative -mt-14" style={{ height: "160dvh" }}>
      {/* Stage épinglé — dvh natif, fluide */}
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

        {/* Rayures gravées, derrière le logo */}
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

   PERF : le filtre rugueux (turbulence + displacement) est appliqué à des
   tracés STATIQUES (full-length) → rasterisé une seule fois. La révélation au
   scroll se fait par `clip-path: inset(...)` piloté par `--scratch`, qui se
   composite sur GPU sans relancer le filtre → fluide sur iPhone.

   Réalisme : double trait par rayure (sillon sombre + arête claire), léger
   jitter Bézier, teinte brune par endroits (dégradé), clusters de 2-3.
   ============================================================ */

const Y0 = 26;
const Y1 = 100;

type Line = { d: string; w: number; color: string; o: number; dark?: number };

function v(x: number, a: number, b: number, c: number) {
  return `M ${x} ${Y0} C ${(x + a).toFixed(2)} 45, ${(x + b).toFixed(2)} 72, ${(x + c).toFixed(2)} ${Y1}`;
}

const CLUSTERS: Line[] = [
  { d: v(38.4, 0.5, -0.5, 0.3), w: 1.1, color: "#d7cab1", o: 0.5 },
  { d: v(40.0, -0.4, 0.6, -0.2), w: 1.8, color: "url(#scratch-grad)", o: 0.8, dark: 0.42 },
  { d: v(42.0, 0.6, -0.3, 0.5), w: 1.2, color: "#5e4633", o: 0.6 },

  { d: v(48.0, -0.5, 0.4, -0.4), w: 1.3, color: "#6e5238", o: 0.58 },
  { d: v(50.0, 0.4, -0.6, 0.3), w: 2.2, color: "url(#scratch-grad)", o: 0.92, dark: 0.46 },
  { d: v(52.4, -0.3, 0.5, -0.2), w: 1.2, color: "#efe9dc", o: 0.62 },

  { d: v(58.6, 0.5, -0.4, 0.4), w: 1.2, color: "#efe9dc", o: 0.55 },
  { d: v(60.6, -0.5, 0.5, -0.3), w: 1.7, color: "url(#scratch-grad)", o: 0.76, dark: 0.4 },
  { d: v(62.4, 0.4, -0.5, 0.5), w: 1.1, color: "#5e4633", o: 0.5 },
];

function ScratchTrail() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        overflow: "visible",
        // Révélation haut→bas, composité GPU (ne relance pas le filtre)
        clipPath: "inset(0 0 calc((1 - var(--scratch, 0)) * 100%) 0)",
        WebkitClipPath: "inset(0 0 calc((1 - var(--scratch, 0)) * 100%) 0)",
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="sig-rough" x="-25%" y="-15%" width="150%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08 0.55" numOctaves={2} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.3} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="scratch-grad" x1="0" y1={Y0} x2="0" y2={Y1} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9e2d4" />
          <stop offset="24%" stopColor="#6e5238" />
          <stop offset="46%" stopColor="#ddd0b8" />
          <stop offset="68%" stopColor="#5c4530" />
          <stop offset="100%" stopColor="#e3dac9" />
        </linearGradient>
      </defs>

      {/* Tracés STATIQUES (full-length) → filtre rasterisé une fois */}
      <g fill="none" strokeLinecap="round" filter="url(#sig-rough)">
        {CLUSTERS.map((l, i) => (
          <g key={i} style={{ opacity: l.o }}>
            <path
              d={l.d}
              stroke="#1a1410"
              strokeOpacity={l.dark ?? 0.3}
              strokeWidth={l.w + 1.4}
              vectorEffect="non-scaling-stroke"
            />
            <path d={l.d} stroke={l.color} strokeWidth={l.w} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>
    </svg>
  );
}
