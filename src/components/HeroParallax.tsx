"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — stage épinglé (sticky) + plongée parallax du logo.
 *
 * Le stage est `sticky; height:100dvh` (robuste iOS, contrairement à `svh`).
 * Pendant le scroll épinglé :
 *   · l'image MONTE légèrement + zoome (parallaxe de fond) ;
 *   · le logo DESCEND du centre jusqu'en bas et s'enfonce (scale↓ + fade)
 *     → impression de plongée DANS l'image ;
 *   · des rayures verticales se gravent depuis le point de départ jusqu'en bas,
 *     suivant la descente du logo (traînée de scratch).
 *
 * `--scratch` (0→1) est posé sur le stage à chaque frame et pilote le tracé
 * des rayures (stroke-dashoffset).
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
    const section = sectionRef.current;
    const stage = stageRef.current;
    const img = imgRef.current;
    const logo = logoRef.current;
    if (!section || !stage || !img || !logo) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hauteurs pilotées depuis innerHeight (= viewport réel partout, y compris
    // là où `dvh` ≠ innerHeight) → stage plein écran, jamais de gap, pin stable.
    const setSizes = () => {
      const vh = window.innerHeight;
      section.style.height = `${Math.round(vh * 1.7)}px`;
      stage.style.height = `${vh}px`;
    };
    setSizes();

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight; // distance épinglée
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      const stageH = stage.clientHeight || window.innerHeight;

      // Image : monte + zoome (reste couvrante grâce au scale de base 1.16)
      img.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}%, 0) scale(${(1.16 + p * 0.07).toFixed(3)})`;

      // Logo : descend du centre jusqu'en bas, puis plonge (scale↓ + fade)
      const ty = p * stageH * 0.5;
      const scale = 1 - p * 0.22;
      const op = p < 0.85 ? 1 : Math.max(0.2, 1 - ((p - 0.85) / 0.15) * 0.8);
      logo.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      logo.style.opacity = op.toFixed(3);

      stage.style.setProperty("--scratch", p.toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      setSizes();
      onScroll();
    };

    window.addEventListener("resize", onResize);
    if (!reduce) {
      tick();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="Hero" className="relative -mt-14" style={{ height: "170dvh" }}>
      {/* Stage épinglé — remplit toujours le viewport réel */}
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

        {/* Dégradé bas pour ancrer la composition */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

        {/* Rayures verticales — gravées sur le fond, derrière le logo */}
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
   ScratchTrail — rayures STRICTEMENT verticales, en clusters de
   2-3 lignes rapprochées (aspect naturel), teintées de brun par
   endroits via un dégradé vertical. Tracé piloté par `--scratch`.

   viewBox 0 0 100 100 + preserveAspectRatio="none" → coordonnées en
   % du stage ; `vector-effect: non-scaling-stroke` garde une épaisseur
   constante en px malgré l'étirement.
   ============================================================ */

const Y_TOP = 22;
const Y_BOT = 99;

// Clusters de 2-3 rayures rapprochées (x en % de largeur du stage)
const CLUSTERS: { cx: number; lines: { dx: number; w: number; color: string; o: number }[] }[] = [
  {
    cx: 40,
    lines: [
      { dx: -2.4, w: 1.3, color: "#d7cab1", o: 0.5 },
      { dx: -0.4, w: 2, color: "url(#scratch-grad)", o: 0.75 },
      { dx: 2.2, w: 1.4, color: "#5e4633", o: 0.6 },
    ],
  },
  {
    cx: 50,
    lines: [
      { dx: -2.6, w: 1.5, color: "#6b513c", o: 0.6 },
      { dx: 0.0, w: 2.6, color: "url(#scratch-grad)", o: 0.88 },
      { dx: 2.4, w: 1.3, color: "#e7e0d2", o: 0.62 },
    ],
  },
  {
    cx: 60,
    lines: [
      { dx: -2.2, w: 1.3, color: "#e7e0d2", o: 0.55 },
      { dx: 0.5, w: 2, color: "url(#scratch-grad)", o: 0.72 },
      { dx: 2.6, w: 1.5, color: "#5e4633", o: 0.58 },
    ],
  },
];

function ScratchTrail() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* dégradé vertical : métal clair → brun → clair (brun par endroits) */}
        <linearGradient id="scratch-grad" x1="0" y1={Y_TOP} x2="0" y2={Y_BOT} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9e2d4" />
          <stop offset="26%" stopColor="#7a5c43" />
          <stop offset="48%" stopColor="#ded1b9" />
          <stop offset="70%" stopColor="#684d39" />
          <stop offset="100%" stopColor="#e3dac9" />
        </linearGradient>
      </defs>

      {/* scaleY piloté par --scratch : les rayures se gravent du haut vers le bas */}
      <g
        style={{
          transform: "scaleY(var(--scratch, 0))",
          transformBox: "view-box",
          transformOrigin: `0% ${Y_TOP}%`,
        }}
      >
        {CLUSTERS.map((c, ci) =>
          c.lines.map((l, li) => (
            <line
              key={`${ci}-${li}`}
              x1={c.cx + l.dx}
              y1={Y_TOP}
              x2={c.cx + l.dx}
              y2={Y_BOT}
              stroke={l.color}
              strokeWidth={l.w}
              strokeOpacity={l.o}
              strokeLinecap="butt"
              vectorEffect="non-scaling-stroke"
            />
          )),
        )}
      </g>
    </svg>
  );
}
