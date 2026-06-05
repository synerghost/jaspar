"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero — stage épinglé (sticky) + signature centrée + plongée parallax.
 *
 * POURQUOI sticky : sur iOS `100svh` ≠ `window.innerHeight` (barre d'adresse),
 * ce qui cassait l'ancien centrage JS. Ici le stage est `sticky; height:100dvh`
 * et la signature est centrée en pur CSS (flex) → toujours au milieu, partout.
 *
 * EFFET : pendant que le stage est épinglé, l'image MONTE et zoome derrière la
 * signature fixe → elle paraît « plonger » dans l'image. Au scroll, des
 * traînées de scratch (rugueuses, métalliques) se gravent sur le fond comme si
 * la signature raclait la matière en s'enfonçant.
 *
 * `--scratch` (0→1) est posé sur le stage à chaque frame et pilote l'apparition
 * et la longueur des scratchs (stroke-dashoffset + opacity).
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!section || !stage || !img) return;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight; // distance épinglée
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      // Base scale 1.16 → l'image reste couvrante même translatée vers le haut.
      img.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}%, 0) scale(${(1.16 + p * 0.07).toFixed(3)})`;
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
    <section ref={sectionRef} aria-label="Hero" className="relative -mt-14" style={{ height: "150dvh" }}>
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

        {/* Signature — centrée en CSS, toujours au milieu */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <SignatureFX mobileSigSrc={mobileSigSrc} />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SignatureFX — signature « rotten » + traînées de scratch.

   Le SVG partage le viewBox intrinsèque du PNG (1701×936) et se
   superpose pixel-perfect → les scratchs partent des points réels.

   - Filtre `sig-rough` (turbulence + displacement) : strokes
     irréguliers, non linéaires = scratch gravé dans la matière.
   - Les scratchs montent au-dessus du glyphe (traînée de la
     « plongée ») et grattent sous les pointes basses. Leur longueur
     et leur opacité suivent `--scratch` (0→1) piloté par le scroll.
   ============================================================ */

// Traînées de scratch : [d, largeur, opacité max]. Coordonnées viewBox 1701×936.
// Au-dessus du glyphe = traînée de plongée ; en dessous = grattage des pointes.
const SCRATCHES: { d: string; w: number; o: number }[] = [
  { d: "M486 150 C 470 -40, 476 -180, 458 -360", w: 3.4, o: 0.8 }, // au-dessus, gauche-centre
  { d: "M846 62 C 852 -120, 844 -300, 858 -460", w: 4, o: 0.92 }, // T central, traînée la plus longue
  { d: "M1032 70 C 1044 -90, 1036 -240, 1052 -380", w: 3.2, o: 0.8 }, // au-dessus, droite
  { d: "M1300 120 C 1316 -20, 1306 -150, 1322 -300", w: 2.8, o: 0.65 }, // au-dessus, points
  { d: "M268 452 C 214 520, 168 580, 120 668", w: 3, o: 0.7 }, // grattage bas-gauche
  { d: "M1672 792 C 1716 852, 1742 902, 1772 968", w: 3.4, o: 0.78 }, // grattage arc bas-droite
];

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

      {/* Overlay scratch — calé sur l'image, piloté par --scratch */}
      <svg
        viewBox="0 0 1701 936"
        className="absolute inset-0 h-full w-full"
        style={{ overflow: "visible" }}
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="sig-rough" x="-40%" y="-60%" width="180%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.05" numOctaves={2} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Traînées de scratch (gravées sur le fond) */}
        <g fill="none" strokeLinecap="round" filter="url(#sig-rough)">
          {SCRATCHES.map((s, i) => (
            <g key={i} style={{ opacity: `calc(var(--scratch, 0) * ${s.o})` }}>
              {/* ombre creusée (sombre) */}
              <path
                d={s.d}
                stroke="#000"
                strokeOpacity={0.4}
                strokeWidth={s.w + 1.6}
                pathLength={1}
                strokeDasharray={1}
                style={{ strokeDashoffset: "calc(1 - var(--scratch, 0))" }}
              />
              {/* arête éclaircie (métal mis à nu) */}
              <path
                d={s.d}
                stroke="#efe9dc"
                strokeWidth={s.w}
                pathLength={1}
                strokeDasharray={1}
                style={{ strokeDashoffset: "calc(1 - var(--scratch, 0))" }}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
