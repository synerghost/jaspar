import type { Locale } from "./i18n";

/**
 * Product names from WooCommerce are all-caps (e.g. "LACED SALOPETTE RAW DENIM").
 * We render them in title case for a more editorial feel.
 */
export function titleCase(s: string): string {
  const LOWER = new Set(["raw", "de", "du", "en", "the", "a", "and", "for", "of", "in"]);
  return s
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i === 0 || !LOWER.has(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** price stored in cents → localized currency string */
export function formatPrice(cents: number, locale: Locale = "fr", currency = "EUR"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function leadTimeLabel(weeks: number, locale: Locale = "fr"): string {
  if (weeks <= 0) return locale === "fr" ? "Expédié sous 48h" : "Ships in 48h";
  return locale === "fr"
    ? `Fabriqué à la commande — ~${weeks} semaines`
    : `Made to order — ~${weeks} weeks`;
}
