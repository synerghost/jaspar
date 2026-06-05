"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";

const rows = [
  { size: "XS", chest: "82–86", waist: "62–66" },
  { size: "S", chest: "86–90", waist: "66–70" },
  { size: "M", chest: "90–96", waist: "70–76" },
  { size: "L", chest: "96–102", waist: "76–82" },
  { size: "XL", chest: "102–108", waist: "82–88" },
];

/** Inline size guide — a disclosure, never a popup (audit P1 #8). */
export function SizeGuide() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-ink/10 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="label-caps flex w-full items-center justify-between text-stone-600 transition-colors hover:text-ink"
      >
        {t("pdp.sizeGuide")}
        <span aria-hidden className="text-base leading-none">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <table className="mt-4 w-full text-left text-xs">
          <thead className="eyebrow">
            <tr className="border-b border-ink/15 [&>th]:pb-2 [&>th]:font-normal">
              <th>{t("pdp.size")}</th>
              <th>{locale === "fr" ? "Poitrine (cm)" : "Chest (cm)"}</th>
              <th>{locale === "fr" ? "Taille (cm)" : "Waist (cm)"}</th>
            </tr>
          </thead>
          <tbody className="text-stone-600">
            {rows.map((r) => (
              <tr key={r.size} className="border-b border-ink/5 [&>td]:py-2">
                <td className="text-ink">{r.size}</td>
                <td>{r.chest}</td>
                <td>{r.waist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
