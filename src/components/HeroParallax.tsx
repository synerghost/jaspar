"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero plein-écran avec effet de plongée.
 *
 * LAYER 1 — Image de fond
 *   L'image monte légèrement plus vite que le scroll naturel
 *   (translateY négatif) → elle "remonte" sous la signature.
 *
 * LAYER 2 — Signature
 *   Reste visuellement FIXE au centre du viewport.
 *   Dans le repère de la section, on compense le scroll :
 *   sigTranslateY = scrollY → la section monte, la signature descend
 *   de la même valeur → net : elle ne bouge pas à l'écran.
 *
 *   Résultat : l'image monte par-dessous la signature qui paraît
 *   plonger à l'intérieur de la photo.
 *
 * mix-blend-mode : multiply → fond blanc de la signature devient
 * transparent, les tons cuivre/bronze se fondent dans l'image.
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

export function HeroParallax({
  src,
  alt,
  mobileSrc,
  mobileSigSrc,
}: HeroProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const img = imgRef.current;
    const sig = sigRef.current;
    const section = sectionRef.current;
    if (!img || !sig || !section) return;

    let raf = 0;

    const tick = () => {
      const y = window.scrollY;
      const rect = section.getBoundingClientRect();
      const sectionTop = y + rect.top; // position absolue du haut de la section

      // Image : monte légèrement plus vite (rise effect)
      img.style.transform = `translateY(${-y * 0.15}px)`;

      // Signature : reste fixe dans le viewport au centre
      // La section monte de y → on compense en descendant sig de y
      // Point d'ancrage : top:50% de la section = center
      sig.style.transform = `translateY(calc(-50% + ${y - sectionTop - window.innerHeight * 0.5 + section.offsetHeight * 0.5}px))`;

      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Init
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-14 overflow-hidden"
      style={{ height: "100svh" }}
      aria-label="Hero"
    >
      {/* ── Image desktop ── */}
      <div
        ref={imgRef}
        className="absolute inset-x-0 hidden will-change-transform md:block"
        style={{ top: "-10%", height: "120%" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* ── Image mobile ── */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={mobileSrc ?? src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Gradient subtil en bas */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

      {/* ── Signature — fixe au centre du viewport ── */}
      <div
        ref={sigRef}
        className="pointer-events-none absolute inset-x-0 flex items-center justify-center px-8 will-change-transform"
        style={{ top: "50%" }}
      >
        {/* Mobile — signature bronze (fond déjà transparent, blend normal) */}
        <Image
          src={mobileSigSrc ?? "/brand/signature-rotten.png"}
          alt="JASPÄR"
          width={1701}
          height={936}
          priority
          sizes="88vw"
          className="block w-[80vw] object-contain md:hidden"
          style={{ filter: "drop-shadow(0 2px 18px rgba(0,0,0,0.55))" }}
        />
        {/* Desktop — signature bronze */}
        <Image
          src="/brand/signature-rotten.png"
          alt="JASPÄR"
          width={1701}
          height={936}
          priority
          sizes="54vw"
          className="hidden w-[50vw] max-w-[760px] object-contain md:block"
          style={{ filter: "drop-shadow(0 2px 22px rgba(0,0,0,0.5))" }}
        />
      </div>
    </section>
  );
}
