"use client";

import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import { useLocale } from "@/lib/i18n";
import { HeroParallax } from "@/components/HeroParallax";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/Button";
import { Container, Section, SectionHead } from "@/components/Layout";
import { EmailForm } from "@/components/EmailForm";

export default function HomePage() {
  const { t, locale } = useLocale();
  const fr = locale === "fr";

  const selection = [
    products.find((p) => p.slug === "laced-salopette-raw-denim"),
    products.find((p) => p.slug === "strapped-army-jacket-raw-denim"),
    products.find((p) => p.slug === "bowed-wrap-skirt"),
    products.find((p) => p.slug === "fourmis-tee-shirt-white"),
  ].filter(Boolean) as typeof products;

  return (
    <>
      {/* ── Hero — image + signature, zéro texte ni bouton ── */}
      <HeroParallax
        src="/media/campaign/hero.webp"
        alt="JASPÄR Saison Trois campaign"
        width={2000}
        height={1334}
        mobileSrc="/media/campaign/look1.webp"
        mobileWidth={1400}
        mobileHeight={2100}
        minHeight="100svh"
      />

      {/* ── Editorial split — Saison Trois ── */}
      <Section className="!py-0">
        <div className="grid md:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden" style={{ aspectRatio: "2 / 3" }}>
              <Image
                src="/media/campaign/look1.webp"
                alt="JASPÄR Campaign — Saison Trois"
                fill
                sizes="(min-width:768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={60} className="flex flex-col justify-center gap-6 bg-paper-dim px-[var(--spacing-gutter)] py-20">
            <span className="eyebrow">Saison Trois</span>
            <h2 className="display text-4xl md:text-5xl lg:text-6xl">
              {fr
                ? "Construction visible,\nmatière brute."
                : "Visible construction,\nraw material."}
            </h2>
            <p className="max-w-sm text-stone-600">
              {fr
                ? "Chaque pièce est fabriquée à la commande dans notre atelier parisien. Cinq semaines, un artisan, zéro surproduction."
                : "Every piece is made to order in our Paris atelier. Five weeks, one maker, zero overproduction."}
            </p>
            <Link href="/collections/saison-trois" className="label-caps link-underline self-start">
              {fr ? "Voir le lookbook" : "View lookbook"} →
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* ── Editorial split — Capsule Edito ── */}
      <Section className="!pt-0 !pb-0">
        <div className="grid md:grid-cols-2">
          <Reveal delay={40} className="order-2 flex flex-col justify-center gap-6 bg-ink px-[var(--spacing-gutter)] py-20 text-paper md:order-1">
            <span className="eyebrow !text-paper/50">Capsule 1·1 Edito</span>
            <h2 className="display text-4xl md:text-5xl lg:text-6xl">
              {fr ? "Le dessin porté." : "The drawing, worn."}
            </h2>
            <p className="max-w-sm text-paper/70">
              {fr
                ? "FOURMIS, CŒUR — la pratique graphique de l'atelier sérigraphiée à la main sur du jersey lourd."
                : "FOURMIS, COEUR — the atelier's drawing practice hand-screened on heavy jersey."}
            </p>
            <Link href="/shop" className="label-caps link-underline self-start !text-paper">
              {fr ? "Acquérir" : "Acquire"} →
            </Link>
          </Reveal>
          <Reveal className="order-1 md:order-2">
            <div className="relative overflow-hidden" style={{ aspectRatio: "2 / 3" }}>
              <Image
                src="/media/campaign/look2.webp"
                alt="JASPÄR Campaign — Capsule Edito"
                fill
                sizes="(min-width:768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── Sélection produits ── */}
      <Section>
        <Container>
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-4">
              <SectionHead
                eyebrow={fr ? "Pièces" : "Pieces"}
                title={fr ? "Sélection" : "Selection"}
                className="mb-0"
              />
              <Link href="/shop" className="label-caps link-underline whitespace-nowrap pb-1">
                {fr ? "Tout voir" : "View all"} →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {selection.map((p, i) => (
              <Reveal key={p.slug} delay={i * 55}>
                <ProductCard product={p} priority={i < 2} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Made to order statement ── */}
      <Section className="border-y border-ink/10 bg-paper-dim">
        <Container>
          <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
            <Reveal>
              <h2 className="display text-4xl md:text-6xl lg:text-7xl">
                {fr
                  ? "Fait à la commande,\npar principe."
                  : "Made to order,\non principle."}
              </h2>
            </Reveal>
            <Reveal delay={80} className="flex flex-col justify-center gap-4 text-stone-600">
              <p>
                {fr
                  ? "Nous ne produisons rien à l'avance. Chaque pièce est lancée quand vous la commandez."
                  : "We produce nothing in advance. Each piece is started when you order it."}
              </p>
              <Link href="/about" className="label-caps link-underline mt-2 self-start">
                {fr ? "Le studio" : "The studio"} →
              </Link>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── F&F Newsletter ── */}
      <Section className="!py-20">
        <Container>
          <Reveal className="mx-auto max-w-lg text-center">
            <span className="eyebrow">{t("news.title")}</span>
            <h2 className="display mt-4 text-3xl md:text-4xl">
              {fr ? "Accès anticipé." : "Early access."}
            </h2>
            <p className="mt-3 text-stone-600">{t("news.body")}</p>
            <div className="mx-auto mt-8 max-w-sm">
              <EmailForm
                placeholderKey="news.placeholder"
                submitKey="news.submit"
                doneKey="news.done"
                variant="stacked"
              />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
