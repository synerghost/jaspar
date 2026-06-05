import type { Locale } from "./i18n";

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
