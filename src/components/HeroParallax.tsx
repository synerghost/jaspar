"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — stage épinglé (sticky) + signature centrée + effet de plongée.
 *
 * POURQUOI sticky : sur iOS `100svh` ≠ `window.innerHeight` (barre d'adresse),
 * ce qui cassait l'ancien centrage JS (signature décalée, « deux hero »,
 * scroll saccadé). Ici le stage est `position: sticky; height: 100dvh` et la
 * signature est centrée en pur CSS (flex) → toujours parfaitement au milieu,
 * desktop comme mobile.
 *
 * EFFET : pendant que le stage est épinglé, l'image MONTE et zoome légèrement
 * derrière la signature fixe → elle paraît « plonger » dans l'image.
 *
 * La section mesure 150dvh : ~50dvh de scroll épinglé pour dérouler l'effet,
 * puis on relâche vers la suite. Tout est piloté par la progression réelle de
 * la section (indépendant des unités de viewport).
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
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight; // distance épinglée
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      // Base scale 1.16 → l'image reste couvrante même translatée vers le haut.
      img.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}%, 0) scale(${(1.16 + p * 0.06).toFixed(3)})`;
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
    <section ref={sectionRef} aria-label="Hero" className="relative -mt-14" style={{ height: "150dvh" }}>
      {/* Stage épinglé — remplit toujours le viewport réel */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
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

        {/* Signature — centrée en CSS, toujours au milieu */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <SignatureFX mobileSigSrc={mobileSigSrc} />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SignatureFX — signature « rotten » + traces de friction +
   étincelles aux extrémités réelles du glyphe.

   Le SVG partage le viewBox intrinsèque du PNG (1701×936) et se
   superpose pixel-perfect à l'image → les ancres tombent juste.

   - Filtre `sig-rough` (turbulence + displacement) : strokes
     irréguliers, non linéaires = traces de friction grattées.
   - Étincelles : grappes de rayons + cœur lumineux qui scintillent
     sur les pointes (gauche, bas-gauche, pic central, haut-droite,
     arc bas-droite) + particules qui s'envolent.
   ============================================================ */

// Extrémités détectées via le canal alpha du PNG (viewBox 1701×936)
const SPARKS: { x: number; y: number; delay: number; scale: number }[] = [
  { x: 12, y: 386, delay: 0.0, scale: 1.0 }, // pointe gauche (longue diagonale)
  { x: 270, y: 448, delay: 0.9, scale: 0.85 }, // bas-gauche
  { x: 844, y: 58, delay: 1.5, scale: 0.8 }, // pic central (T)
  { x: 1188, y: 20, delay: 0.5, scale: 0.9 }, // points haut-droite
  { x: 1680, y: 786, delay: 1.2, scale: 1.05 }, // arc bas-droite
];

// Particules qui s'envolent (tx/ty = trajectoire en unités viewBox)
const PARTICLES: { x: number; y: number; tx: number; ty: number; delay: number; r: number }[] = [
  { x: 1680, y: 786, tx: 70, ty: 60, delay: 0.2, r: 5 },
  { x: 1680, y: 786, tx: 30, ty: 90, delay: 1.1, r: 4 },
  { x: 270, y: 448, tx: -80, ty: 50, delay: 0.6, r: 5 },
  { x: 12, y: 386, tx: -90, ty: 20, delay: 1.4, r: 4 },
  { x: 844, y: 58, tx: 10, ty: -70, delay: 1.9, r: 4 },
];

// Rayons d'une étincelle (dx, dy depuis la pointe)
const RAYS: [number, number][] = [
  [0, -46],
  [34, -26],
  [44, 8],
  [-40, -18],
  [-28, 30],
  [16, 40],
];

function Spark({ x, y, delay, scale }: { x: number; y: number; delay: number; scale: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className="sig-spark"
      style={{ animationDelay: `${delay}s` }}
    >
      {RAYS.map(([dx, dy], i) => (
        <line key={i} x1={0} y1={0} x2={dx} y2={dy} stroke="#ffdca6" strokeWidth={4.5} strokeLinecap="round" />
      ))}
      <circle r={13} fill="#f4b25e" opacity={0.45} />
      <circle r={6} fill="#fff7e8" />
    </g>
  );
}

function SignatureFX({ mobileSigSrc }: { mobileSigSrc?: string }) {
  const sig = mobileSigSrc ?? "/brand/signature-rotten.png";
  return (
    <div className="relative w-[82vw] max-w-[760px] md:w-[50vw]">
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
        src={sig}
        alt="JASPÄR"
        width={1701}
        height={936}
        priority
        sizes="82vw"
        className="block h-auto w-full object-contain md:hidden"
        style={{ filter: "drop-shadow(0 2px 18px rgba(0,0,0,0.55))" }}
      />

      {/* Overlay friction + étincelles — calé sur l'image */}
      <svg
        viewBox="0 0 1701 936"
        className="absolute inset-0 h-full w-full"
        style={{ overflow: "visible" }}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="sig-rough" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.026" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={11} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Traces de friction — strokes irréguliers grattés sur le fond */}
        <g
          className="sig-friction"
          fill="none"
          stroke="#d9b483"
          strokeWidth={3.2}
          strokeLinecap="round"
          filter="url(#sig-rough)"
          style={{ filter: "url(#sig-rough)" }}
        >
          {/* sous la pointe gauche, vers l'extérieur */}
          <path d="M40 392 C -40 404, -110 416, -170 410" opacity={0.7} />
          {/* bas-gauche, grattage descendant */}
          <path d="M290 452 C 210 500, 150 540, 96 612" opacity={0.6} />
          {/* arc bas-droite, étincelles de friction */}
          <path d="M1660 792 C 1716 836, 1758 876, 1792 932" opacity={0.7} />
          <path d="M1610 800 C 1648 854, 1672 892, 1684 940" opacity={0.45} />
          {/* ligne de grattage le long de la base */}
          <path d="M360 720 C 720 770, 1080 772, 1420 716" opacity={0.28} strokeWidth={2.2} />
        </g>

        {/* Particules qui s'envolent */}
        <g
          style={{
            filter: "drop-shadow(0 0 4px rgba(255,200,120,0.9)) drop-shadow(0 0 10px rgba(214,120,40,0.5))",
          }}
        >
          {PARTICLES.map((p, i) => (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <circle
                className="sig-particle"
                cx={0}
                cy={0}
                r={p.r}
                fill="#ffe6b8"
                style={{ ["--tx" as string]: `${p.tx}px`, ["--ty" as string]: `${p.ty}px`, animationDelay: `${p.delay}s` }}
              />
            </g>
          ))}
        </g>

        {/* Étincelles aux extrémités */}
        <g
          style={{
            filter: "drop-shadow(0 0 5px rgba(255,205,130,0.95)) drop-shadow(0 0 13px rgba(214,120,40,0.55))",
          }}
        >
          {SPARKS.map((s, i) => (
            <Spark key={i} {...s} />
          ))}
        </g>
      </svg>
    </div>
  );
}
