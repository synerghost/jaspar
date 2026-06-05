"use client";

import Link from "next/link";
import type { Collection } from "@/data/types";
import { productsByCollection } from "@/data/products";
import { collections } from "@/data/collections";
import { useLocale } from "@/lib/i18n";
import { Media } from "./Media";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { Container, Section } from "./Layout";
import { clsx } from "@/lib/clsx";

export function CollectionDetail({ collection }: { collection: Collection }) {
  const { t } = useLocale();
  const pieces = productsByCollection(collection.id);

  return (
    <>
      {/* Narrative hero */}
      <section className="relative -mt-16 flex min-h-[80vh] items-end overflow-hidden">
        <Media
          src={collection.cover.src}
          alt={collection.cover.alt}
          width={collection.cover.width}
          height={collection.cover.height}
          ratio="16/9"
          priority
          fill
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
        <Container className="relative w-full pb-14 text-paper">
          <p className="eyebrow !text-paper/70">Collection</p>
          <h1 className="display mt-3 text-5xl md:text-7xl">{collection.name}</h1>
          <p className="mt-4 max-w-md text-paper/85">{collection.tagline}</p>
        </Container>
      </section>

      {/* Intro */}
      <Section className="!py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="display text-2xl leading-snug md:text-3xl">{collection.intro}</p>
          </Reveal>
        </Container>
      </Section>

      {/* Scrollable lookbook — alternating full/split (audit P1 #7) */}
      <div className="flex flex-col gap-4 px-[var(--spacing-gutter)]">
        {collection.lookbook.map((look, i) => {
          const full = i % 3 === 0;
          return (
            <Reveal
              key={i}
              className={clsx(full ? "w-full" : "w-full md:w-[60%]", i % 2 === 1 && "md:ml-auto")}
            >
              <Media
                src={look.src}
                alt={look.alt}
                width={look.width}
                height={look.height}
                ratio={full ? "16/10" : "3/4"}
                sizes={full ? "100vw" : "60vw"}
              />
            </Reveal>
          );
        })}
      </div>

      {/* Pieces from this collection */}
      <Section>
        <Container>
          <Reveal>
            <h2 className="display mb-10 text-3xl md:text-4xl">{t("home.selection")}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {pieces.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Other collections */}
      <Section className="!pt-0">
        <Container>
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-ink/10 pt-8">
            <span className="eyebrow">{t("nav.collections")}</span>
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className={clsx(
                  "label-caps link-underline",
                  c.id === collection.id ? "text-ink" : "text-stone-500",
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
