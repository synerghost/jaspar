"use client";

import { useState } from "react";
import type { Product } from "@/data/types";
import { useCart } from "@/lib/cart";
import { useLocale } from "@/lib/i18n";
import { formatPrice, leadTimeLabel } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import { Button } from "./Button";
import { EmailForm } from "./EmailForm";
import { SizeGuide } from "./SizeGuide";

export function ProductBuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const { t, locale } = useLocale();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const fullySoldOut = !!product.soldOut;

  function handleAdd() {
    if (!size) {
      setError(true);
      return;
    }
    add({
      slug: product.slug,
      name: product.name,
      size,
      price: product.price,
      image: product.images[0].src,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-lg">{formatPrice(product.price, locale, product.currency)}</p>
        {product.madeToOrder && (
          <p className="mt-1 text-sm text-stone-600">{leadTimeLabel(product.leadTimeWeeks, locale)}</p>
        )}
      </div>

      {/* Sizes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">{t("pdp.size")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const out = fullySoldOut || product.soldOutSizes?.includes(s);
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                disabled={out}
                onClick={() => {
                  setSize(s);
                  setError(false);
                }}
                className={clsx(
                  "label-caps min-w-12 border px-3 py-2 transition-colors",
                  active ? "border-ink bg-ink text-paper" : "border-ink/25 text-ink hover:border-ink",
                  out && "cursor-not-allowed border-ink/10 text-stone-300 line-through hover:border-ink/10",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-2 text-xs text-[var(--color-live)]">
            {locale === "fr" ? "Choisissez une taille." : "Please choose a size."}
          </p>
        )}
      </div>

      {/* Action */}
      {fullySoldOut ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-stone-600">{t("pdp.soldOutLine")}</p>
          {notifyOpen ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-stone-500">{t("pdp.notifyHint")}</p>
              <EmailForm placeholderKey="notify.placeholder" submitKey="notify.submit" doneKey="notify.done" />
            </div>
          ) : (
            <Button variant="outline" size="lg" onClick={() => setNotifyOpen(true)}>
              {t("cta.notify")}
            </Button>
          )}
        </div>
      ) : (
        <Button size="lg" onClick={handleAdd}>
          {t("cta.addToCart")}
        </Button>
      )}

      <SizeGuide />

      {/* Fabric + details */}
      <dl className="flex flex-col gap-4 border-t border-ink/10 pt-5 text-sm">
        <div>
          <dt className="eyebrow mb-1">{t("pdp.composition")}</dt>
          <dd className="text-stone-700">{product.fabric}</dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">{t("pdp.details")}</dt>
          <dd>
            <ul className="flex flex-col gap-1 text-stone-700">
              {product.details.map((d) => (
                <li key={d}>— {d}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">{t("pdp.model")}</dt>
          <dd className="text-stone-700">{product.modelNote}</dd>
        </div>
      </dl>
    </div>
  );
}
