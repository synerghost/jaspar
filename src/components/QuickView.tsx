"use client";

import Link from "next/link";
import type { Product } from "@/data/types";
import { useLocale } from "@/lib/i18n";
import { titleCase } from "@/lib/format";
import { Drawer } from "./Drawer";
import { Media } from "./Media";
import { ProductBuyBox } from "./ProductBuyBox";

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  return (
    <Drawer open={open} onClose={onClose} label={`${t("cta.quickView")} — ${product.name}`} width="max-w-lg">
      <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <span className="eyebrow">{t("cta.quickView")}</span>
        <button onClick={onClose} aria-label={t("nav.close")} className="label-caps hover:text-stone-500">
          {t("nav.close")} ×
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Media
          src={product.images[0].src}
          alt={product.images[0].alt}
          width={product.images[0].width}
          height={product.images[0].height}
          ratio="3/4"
          sizes="(min-width: 640px) 32rem, 100vw"
          className="mb-6"
        />
        <h2 className="display mb-4 text-2xl">
          <Link href={`/product/${product.slug}`} onClick={onClose} className="link-underline">
            {titleCase(product.name)}
          </Link>
        </h2>
        <ProductBuyBox product={product} />
      </div>
    </Drawer>
  );
}
