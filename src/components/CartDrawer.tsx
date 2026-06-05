"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart";
import { useLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { Drawer } from "./Drawer";
import { Button } from "./Button";

export function CartDrawer() {
  const { lines, subtotal, isOpen, close, remove } = useCart();
  const { t, locale } = useLocale();

  return (
    <Drawer open={isOpen} onClose={close} label={t("cart.title")} width="max-w-md">
      <header className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <span className="eyebrow">{t("cart.title")}</span>
        <button onClick={close} aria-label={t("nav.close")} className="label-caps hover:text-stone-500">
          {t("nav.close")} ×
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {lines.length === 0 ? (
          <p className="text-sm text-stone-600">{t("cart.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className="flex gap-4">
                <div className="relative h-28 w-21 shrink-0 overflow-hidden bg-stone-200" style={{ aspectRatio: "3 / 4" }}>
                  <Image src={l.image} alt={l.name} width={120} height={160} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm">{l.name}</p>
                  <p className="eyebrow mt-1">
                    {t("pdp.size")} {l.size} · ×{l.qty}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{formatPrice(l.price * l.qty, locale)}</p>
                  <button
                    onClick={() => remove(l.slug, l.size)}
                    className="label-caps mt-auto self-start text-stone-500 hover:text-ink"
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-ink/10 px-6 py-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="eyebrow">{t("cart.subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <p className="mb-4 text-xs text-stone-500">{t("cart.note")}</p>
        <Button size="lg" className="w-full" disabled>
          {t("cart.checkout")}
        </Button>
        <button onClick={close} className="label-caps mt-3 w-full py-2 text-stone-500 hover:text-ink">
          {t("cta.continue")}
        </button>
      </footer>
    </Drawer>
  );
}
