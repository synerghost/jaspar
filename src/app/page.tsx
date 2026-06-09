"use client";

import Link from "next/link";
import Image from "next/image";
import { getProduct } from "@/data/products";
import type { Product } from "@/data/types";
import { useLocale } from "@/lib/i18n";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Container, Section, SectionHead } from "@/components/Layout";
import { EmailForm } from "@/components/EmailForm";
import { HeroSignature } from "@/components/HeroSignature";

/**
 * Home — hiérarchie alignée sur j4spar.com :
 *  1. Hero (image métallique) + SIGNATURE fixe
 *  2. SAISON TROIS — grille produits
 *  3. CAPSULE 1·1 EDITO
 *  4. Manifeste « Our vision of fashion is established beyond clothing »
 *  5. F&F List
 *
 * Effet signature (demandé) : la signature est `position: fixed`, toujours
 * centrée à l'écran, à un z-index SOUS le contenu et AU-DESSUS du hero.
 *   z : hero (z-0)  <  signature fixe (z-10)  <  contenu (z-20)
 * → en haut elle est posée sur l'image du hero ; au scroll le hero défile et
 *   le contenu opaque remonte PAR-DESSUS elle → elle passe « sous tout le site »
 *   dès qu'elle dépasse son background de hero. Scroll natif, aucun pin.
 */

const GRID_ORDER = [
  "scarred-shirt-white",
  "boxer-capri-white",
  "tank-sweater-grey",
  "boxer-capri-selvedge",
  "tank-tee-white",
  "boxer-mini-skirt-selvedge",
  "layered-cardigan-grey",
  "farrier-pants-kaki-copy",
  "scarred-shirt-kaki",
  "chino-joggers-blue",
  "layered-cardigan-blue",
  "chino-joggers-grey",
];

export default function HomePage() {
  const { t, locale } = useLocale();
  const fr = locale === "fr";
  const grid = GRID_ORDER.map(getProduct).filter(Boolean) as Product[];

  return (
    <>
      {/* ── 1. Hero — image métallique + signature fixe + traînée (z-0 / z-10) ── */}
      <HeroSignature
        src="/media/campaign/hero.webp"
        alt="JASPÄR Saison Trois"
        mobileSrc="/media/campaign/hero-mobile.webp"
      />

      {/* ── Contenu — AU-DESSUS de la signature (z-20), fond opaque ── */}
      <div className="relative z-20 bg-paper">
        {/* 2. SAISON TROIS — grille produits */}
        <Section>
          <Container>
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-4 md:mb-14">
                <SectionHead eyebrow="Collection" title="Saison Trois" className="mb-0" />
                <Link href="/shop" className="label-caps link-underline whitespace-nowrap pb-1">
                  {fr ? "Tout voir" : "Shop all"} →
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
              {grid.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 4) * 50}>
                  <ProductCard product={p} priority={i < 2} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* 3. CAPSULE 1·1 EDITO */}
        <Section className="!pt-0">
          <Container>
            <div className="grid md:grid-cols-2">
              <Reveal className="order-2 flex flex-col justify-center gap-6 bg-ink px-[var(--spacing-gutter)] py-16 text-paper md:order-1 md:py-24">
                <span className="eyebrow !text-paper/50">Capsule 1·1 — Edito</span>
                <h2 className="display text-4xl md:text-5xl lg:text-6xl">
                  {fr ? "Le vêtement\ncomme atelier." : "Clothing as\natelier work."}
                </h2>
                <p className="max-w-sm text-paper/70">
                  {fr
                    ? "Construction visible, matière brute — chaque pièce pensée comme un objet, fabriquée à la commande à Paris."
                    : "Visible construction, raw material — each piece conceived as an object, made to order in Paris."}
                </p>
                <Link href="/collections/capsule-1-1-edito" className="label-caps link-underline self-start !text-paper">
                  {fr ? "Découvrir" : "Discover more"} →
                </Link>
              </Reveal>
              <Reveal className="order-1 md:order-2">
                <div className="relative overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
                  <Image
                    src="/media/campaign/campaign-02.webp"
                    alt="JASPÄR — Capsule 1·1 Edito"
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* 4. Manifeste */}
        <Section className="border-y border-ink/10 bg-paper-dim">
          <Container>
            <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
              <Reveal>
                <h2 className="display text-3xl md:text-5xl lg:text-6xl">
                  {fr
                    ? "Notre vision de la mode\ndépasse le vêtement."
                    : "Our vision of fashion is\nestablished beyond clothing."}
                </h2>
              </Reveal>
              <Reveal delay={80} className="flex flex-col justify-center gap-5 text-stone-600">
                <p>
                  {fr
                    ? "L'identité de JASPÄR puise dans une foule d'influences créatives — nos collections n'existent pas hors d'un contexte artistique à 360°."
                    : "JASPÄR's identity takes root in a crowd of creative influences — our collections cannot exist outside a 360° artistic context."}
                </p>
                <p>
                  {fr
                    ? "Des vêtements exclusifs, mais aussi du mobilier design, des sculptures et des pièces de collaboration : des œuvres uniques à acquérir ici."
                    : "Exclusive garments, but also design furniture, sculptures and collaboration pieces — unique works of art to acquire here."}
                </p>
                <Link href="/about" className="label-caps link-underline mt-1 self-start">
                  {fr ? "Découvrir" : "Discover more"} →
                </Link>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* 5. F&F List */}
        <Section className="!py-20 md:!py-28">
          <Container>
            <Reveal className="mx-auto max-w-lg text-center">
              <span className="eyebrow">{t("news.title")}</span>
              <h2 className="display mt-4 text-3xl md:text-4xl">
                {fr ? "Inscrivez-vous à la JASPÄR F&F List" : "Sign up for the JASPÄR F&F List"}
              </h2>
              <p className="mt-3 text-stone-600">
                {fr
                  ? "Profitez de nos prix Friends & Family et d'un accès anticipé exclusif aux meilleures pièces."
                  : "Enjoy our Friends & Family prices and exclusive early access to the finest pieces."}
              </p>
              <div className="mx-auto mt-8 max-w-sm">
                <EmailForm placeholderKey="news.placeholder" submitKey="news.submit" doneKey="news.done" variant="stacked" />
              </div>
            </Reveal>
          </Container>
        </Section>
      </div>
    </>
  );
}
