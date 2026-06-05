"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero plein-écran avec deux couches parallax.
 *
 * LAYER 1 — Image de fond
 *   translateY = +scrollY × 0.28 → reste "derrière" pendant le scroll
 *
 * LAYER 2 — Signature
 *   Position initiale : bas du hero (juste visible, 50% de hauteur en dehors)
 *   Au scroll elle monte : sigY = 38vh − scroll × 100/heroH
 *   → scroll=0    : bottom du hero, à peine visible
 *   → scroll=38%  : centrée dans le cadre
 *   → scroll=80%  : sort par le haut
 *
 *   overflow:hidden sur la section → clipping propre en haut et en bas.
 *   mix-blend-mode: difference → blanc inversé sur l'image = très lisible.
 *
 * Hero height = 120svh pour laisser le temps de voir l'animation complète.
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
  width,
  height,
  mobileSrc,
  mobileWidth,
  mobileHeight,
  mobileSigSrc,
}: HeroProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const img = imgRef.current;
    const sig = sigRef.current;
    if (!img || !sig) return;

    let raf = 0;

    const tick = () => {
      const y   = window.scrollY;
      const vh  = window.innerHeight;
      const heroH = vh * 1.2; // 120svh

      // Image : glisse vers le bas (parallax fond)
      img.style.transform = `translateY(${y * 0.28}px)`;

      // Signature : monte de bas en haut sur la durée du hero
      // sigY en vh : 38vh → 0 (centré) → -42vh
      const sigY = 38 - (y / heroH) * 80;
      sig.style.transform = `translateY(${sigY}vh)`;

      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="relative -mt-14 overflow-hidden"
      style={{ height: "120svh" }}
      aria-label="Hero"
    >
      {/* ── Image desktop (surdimensionnée pour le parallax) ── */}
      <div
        ref={imgRef}
        className="absolute inset-x-0 hidden will-change-transform md:block"
        style={{ top: "-16%", height: "132%" }}
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

      {/* ── Image mobile portrait (sans parallax) ── */}
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />

      {/* ── Signature ── */}
      <div
        ref={sigRef}
        className="pointer-events-none absolute inset-x-0 flex items-center justify-center px-8 will-change-transform"
        style={{ top: "50%", transform: "translateY(38vh)" }}
      >
        {/* Mobile */}
        <Image
          src={mobileSigSrc ?? "/brand/signature.webp"}
          alt="JASPÄR"
          width={2560}
          height={1369}
          priority
          sizes="88vw"
          className="block w-[82vw] object-contain md:hidden"
          style={{ mixBlendMode: "difference", filter: "brightness(1.2)" }}
        />
        {/* Desktop */}
        <Image
          src="/brand/signature.webp"
          alt="JASPÄR"
          width={2560}
          height={1369}
          priority
          sizes="54vw"
          className="hidden w-[52vw] max-w-[800px] object-contain md:block"
          style={{ mixBlendMode: "difference", filter: "brightness(1.15)" }}
        />
      </div>
    </section>
  );
}
