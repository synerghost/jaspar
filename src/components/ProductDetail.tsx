"use client";

import Link from "next/link";
import type { Product } from "@/data/types";
import { getProduct } from "@/data/products";
import { getCollection } from "@/data/collections";
import { useLocale } from "@/lib/i18n";
import { Container } from "./Layout";
import { ProductGallery } from "./ProductGallery";
import { ProductBuyBox } from "./ProductBuyBox";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { Badge } from "./Badge";

export function ProductDetail({ product }: { product: Product }) {
  const { t } = useLocale();
  const collection = getCollection(product.collection);
  const pairs = product.pairsWith.map(getProduct).filter(Boolean) as Product[];

  return (
    <Container className="pt-8 pb-4">
      {/* Breadcrumb — coherent hierarchy (audit P1 #6) */}
      <nav aria-label="Breadcrumb" className="eyebrow mb-8 flex flex-wrap gap-2">
        <Link href="/shop" className="link-underline">
          {t("nav.shop")}
        </Link>
        <span aria-hidden>/</span>
        {collection && (
          <>
            <Link href={`/collections/${collection.id}`} className="link-underline">
              {collection.name}
            </Link>
            <span aria-hidden>/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} />

        <div className="md:py-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {product.limited && <Badge>{t("badge.limited")}</Badge>}
            {product.madeToOrder && !product.soldOut && <Badge tone="muted">{t("badge.madeToOrder")}</Badge>}
            {product.soldOut && <Badge tone="muted">{t("badge.soldOut")}</Badge>}
          </div>

          <h1 className="display text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-4 max-w-md text-stone-700">{product.description}</p>

          <div className="mt-8">
            <ProductBuyBox product={product} />
          </div>
        </div>
      </div>

      {/* Complete the look (cross-sell, editorial) */}
      {pairs.length > 0 && (
        <Reveal className="mt-28">
          <h2 className="display mb-8 text-2xl md:text-3xl">{t("pdp.completeLook")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {pairs.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Reveal>
      )}
    </Container>
  );
}
