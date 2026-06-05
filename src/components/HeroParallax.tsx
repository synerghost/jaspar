"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Full-bleed hero avec effet parallax au scroll.
 * L'image se translate vers le bas à 35% de la vitesse de scroll,
 * donnant l'effet artistique de l'ancien j4spar.com.
 * Respecte prefers-reduced-motion.
 */
export function HeroParallax({
  src,
  alt,
  width,
  height,
  children,
  minHeight = "100vh",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  children?: React.ReactNode;
  minHeight?: string;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (reducedMotion) return;
    const el = imgRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Translate the image downward at 35% the scroll speed → image "stays behind"
          el.style.transform = `translateY(${scrollY * 0.35}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return (
    <section
      className="relative -mt-14 overflow-hidden"
      style={{ minHeight }}
    >
      {/* Parallax image container — taller than viewport so it has room to move */}
      <div
        ref={imgRef}
        className="absolute inset-0 will-change-transform"
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

      {/* Gradient overlay — bottom-up, subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />

      {/* Content */}
      {children && (
        <div className="relative flex h-full flex-col" style={{ minHeight }}>
          {children}
        </div>
      )}
    </section>
  );
}
