"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Hero plein-écran avec :
 * - Parallax : l'image glisse à 35% de la vitesse de scroll (vers le bas)
 * - Signature : overlay transparent qui se révèle à l'entrée de la page
 *   puis monte légèrement et s'efface en scrollant — effet artistique éditorial
 * - Image responsive : desktop (paysage) / mobile (portrait)
 *
 * Aucun texte ni bouton dans le composant — conformément au brief.
 */

interface HeroProps {
  /** Image desktop (paysage) */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Image mobile optionnelle (portrait). Si absente = src */
  mobileSrc?: string;
  mobileWidth?: number;
  mobileHeight?: number;
  minHeight?: string;
}

export function HeroParallax({
  src,
  alt,
  width,
  height,
  mobileSrc,
  mobileWidth,
  mobileHeight,
  minHeight = "100svh",
}: HeroProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Reveal de la signature à l'entrée (légère montée + fade-in)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Parallax image + signature qui remonte au scroll
  useEffect(() => {
    if (prefersReduced) return;
    const img = imgRef.current;
    const sig = sigRef.current;
    if (!img) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          // Image : glisse vers le bas (reste "derrière")
          img.style.transform = `translateY(${y * 0.32}px)`;
          // Signature : monte légèrement et s'efface
          if (sig) {
            const progress = Math.min(1, y / (window.innerHeight * 0.6));
            sig.style.transform = `translateY(${-progress * 48}px)`;
            sig.style.opacity = String(Math.max(0, 1 - progress * 1.4));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReduced]);

  return (
    <section
      className="relative -mt-14 overflow-hidden"
      style={{ minHeight }}
      aria-label="Hero"
    >
      {/* ── Image parallax — desktop ── */}
      <div
        ref={imgRef}
        className="absolute inset-0 hidden will-change-transform md:block"
        style={{ top: "-20%", height: "140%" }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      </div>

      {/* ── Image mobile (portrait) — sans parallax pour éviter les artefacts ── */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={mobileSrc ?? src}
          alt={alt}
          width={mobileWidth ?? width}
          height={mobileHeight ?? height}
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-top"
        />
      </div>

      {/* Gradient bas → noir, sobre */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

      {/* ── Signature — centrée, révélée à l'entrée, efface au scroll ── */}
      <div
        ref={sigRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-700 ease-out"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1s ease, transform 1s ease",
          willChange: "opacity, transform",
        }}
      >
        <Image
          src="/brand/signature.webp"
          alt="JASPÄR"
          width={2560}
          height={1369}
          sizes="(min-width: 768px) 60vw, 88vw"
          className="w-[min(72vw,860px)] object-contain opacity-90 md:w-[min(58vw,860px)]"
          priority
        />
      </div>
    </section>
  );
}
