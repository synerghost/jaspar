"use client";

import Image from "next/image";

/**
 * Hero — signature FIXE centrée, SOUS le contenu (z-10), SUR le fond (z-0).
 *
 *   z : hero/fond (z-0)  <  signature fixe (z-10)  <  contenu (z-20)
 *
 * Au repos la signature est posée sur le fond métallique. Au scroll, le fond
 * défile et le contenu opaque (z-20) remonte PAR-DESSUS la signature → elle
 * « passe sous tout le site » dès qu'elle dépasse son background de hero.
 * Scroll natif, position: fixed → toujours parfaitement centrée (robuste iOS).
 *
 * (L'ancienne traînée de rayures gravées au scroll est conservée dans la
 *  branche GitHub `hero-animation`.)
 */

interface Props {
  src: string; // fond métallique desktop
  alt: string;
  mobileSrc?: string; // fond métallique mobile (cadrage différent)
  sigSrc?: string;
}

export function HeroSignature({
  src,
  alt,
  mobileSrc,
  sigSrc = "/brand/signature-metal.webp",
}: Props) {
  return (
    <>
      {/* Signature — FIXE, centrée, SOUS le contenu (z-10) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-6"
      >
        <Image
          src={sigSrc}
          alt=""
          width={927}
          height={492}
          priority
          sizes="(min-width:768px) 46vw, 80vw"
          className="h-auto w-[80vw] max-w-[700px] object-contain md:w-[46vw]"
        />
      </div>

      {/* Hero — fond métallique (z-0) */}
      <section
        aria-label="Hero"
        className="relative z-0 -mt-14 h-[100dvh] overflow-hidden"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-top md:block"
        />
        <Image
          src={mobileSrc ?? src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center md:hidden"
        />
        {/* Voile sombre léger (comme l'overlay Elementor du site) */}
        <div className="pointer-events-none absolute inset-0 bg-[#323232]/20" />
      </section>
    </>
  );
}
