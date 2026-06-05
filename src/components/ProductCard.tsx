"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/types";
import { useLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { Media } from "./Media";
import { Badge } from "./Badge";
import { QuickView } from "./QuickView";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { t, locale } = useLocale();
  const [qv, setQv] = useState(false);
  const [front, back] = product.images;

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <Media
            src={front.src}
            alt={front.alt}
            hoverSrc={back?.src}
            width={front.width}
            height={front.height}
            ratio="3/4"
            priority={priority}
          />
        </Link>

        {/* Badges — rarity as desire (audit P1 #8, recommendations) */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.soldOut && <Badge tone="muted">{t("badge.soldOut")}</Badge>}
          {product.limited && <Badge>{t("badge.limited")}</Badge>}
          {product.madeToOrder && !product.soldOut && (
            <Badge tone="muted">{t("badge.madeToOrder")}</Badge>
          )}
        </div>

        {/* Quick view — real drawer, not an Elementor popup (audit P0 #3) */}
        <button
          onClick={() => setQv(true)}
          className="label-caps absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 border border-ink/20 bg-paper/85 px-4 py-2 opacity-0 backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-paper group-hover:translate-y-0 group-hover:opacity-100"
        >
          {t("cta.quickView")}
        </button>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm">
          <Link href={`/product/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 text-sm text-stone-600">
          {formatPrice(product.price, locale, product.currency)}
        </p>
      </div>
      <p className="eyebrow mt-1">{t(`cat.${product.category}`)}</p>

      <QuickView product={product} open={qv} onClose={() => setQv(false)} />
    </article>
  );
}
