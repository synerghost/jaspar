"use client";

import Image from "next/image";

/**
 * Hero — reproduction fidèle de j4spar.com :
 *   • fond métallique plein cadre (cover, cadrage haut-centre desktop /
 *     centre mobile) + léger voile sombre (#32323233 ≈ rgba(50,50,50,.2)).
 *   • signature bronze centrée, posée sur le métal.
 *
 * L'ancienne animation (signature fixe sous le contenu + rayures gravées au
 * scroll) est conservée dans la branche GitHub `hero-animation`.
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
    <section
      aria-label="Hero"
      className="relative -mt-14 flex h-[100dvh] items-center justify-center overflow-hidden"
    >
      {/* Fond métallique */}
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

      {/* Signature bronze centrée */}
      <div className="relative z-10 flex w-full items-center justify-center px-6">
        <Image
          src={sigSrc}
          alt="JASPÄR"
          width={927}
          height={492}
          priority
          sizes="(min-width:768px) 46vw, 80vw"
          className="h-auto w-[80vw] max-w-[700px] object-contain md:w-[46vw]"
        />
      </div>
    </section>
  );
}
