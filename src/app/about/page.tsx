"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { Container, Section } from "@/components/Layout";

export default function AboutPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <>
      {/* Statement ouverture */}
      <Section className="!pt-20">
        <Container>
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Studio · Paris</span>
            <h1 className="display mt-6 text-[clamp(2rem,6vw,5rem)]">
              {fr
                ? "Notre vision de la mode s'établit au-delà du vêtement."
                : "Our vision of fashion is established beyond clothing."}
            </h1>
          </Reveal>
        </Container>
      </Section>

      {/* Image pleine largeur */}
      <Container>
        <Reveal>
          <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
            <Image
              src="/media/campaign/look3.webp"
              alt="JASPÄR Studio"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </Container>

      {/* Corps — deux colonnes, pas de chiffres */}
      <Section>
        <Container>
          <div className="grid gap-16 md:grid-cols-2 md:gap-24">
            <Reveal>
              <h2 className="display text-2xl md:text-3xl">
                {fr ? "Fait à la commande." : "Made to order."}
              </h2>
              <p className="mt-6 text-stone-700 leading-relaxed">
                {fr
                  ? "Rien n'est produit à l'avance. Chaque pièce est lancée quand vous la commandez, et faite à la main dans notre atelier à Paris. La lenteur n'est pas un défaut — c'est la condition d'un vêtement qui vous est destiné."
                  : "Nothing is produced in advance. Each piece is started when you order it, and made by hand in our Paris atelier. The slowness is not a flaw — it is the condition of a garment made for you."}
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h2 className="display text-3xl md:text-4xl">
                {fr ? "Denim brut." : "Raw denim."}
              </h2>
              <p className="mt-6 text-stone-700 leading-relaxed">
                {fr
                  ? "Le denim est notre matière première — non lavé, non traité. Chaque pièce porte les traces de son usage. La construction est visible, assumée, ornementale."
                  : "Denim is our raw material — unwashed, untreated. Each piece carries the marks of its use. The construction is visible, deliberate, ornamental."}
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* CTA retour boutique */}
      <Section className="!pt-0">
        <Container>
          <Reveal>
            <Link href="/shop" className="label-caps link-underline">
              {fr ? "Acquérir" : "Acquire"} →
            </Link>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
