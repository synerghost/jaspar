"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Locale = "fr" | "en";

const dict = {
  fr: {
    "nav.shop": "Acquire",
    "nav.collections": "Campaigns",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cart": "Cart",
    "nav.menu": "Menu",
    "nav.close": "Close",

    "cta.discover": "Découvrir",
    "cta.shopSeason": "Voir Saison Trois",
    "cta.addToCart": "Ajouter au panier",
    "cta.notify": "Prévenez-moi",
    "cta.quickView": "Aperçu",
    "cta.viewProduct": "Voir la pièce",
    "cta.continue": "Continuer",

    "home.selection": "Sélection",

    "badge.madeToOrder": "Made to order",
    "badge.limited": "Édition limitée",
    "badge.soldOut": "Épuisé",

    "shop.title": "Acquire",
    "shop.intro": "Toutes les pièces, fabriquées à la commande dans notre atelier parisien.",
    "shop.filter.category": "Catégorie",
    "shop.filter.season": "Saison",
    "shop.filter.availability": "Disponibilité",
    "shop.filter.all": "Tout",
    "shop.filter.available": "Disponible",
    "shop.filter.madeToOrder": "Made to order",
    "shop.sort": "Trier",
    "shop.sort.featured": "Mis en avant",
    "shop.sort.priceAsc": "Prix croissant",
    "shop.sort.priceDesc": "Prix décroissant",
    "shop.count": "pièces",
    "shop.empty": "Aucune pièce ne correspond à ces filtres.",
    "shop.clear": "Réinitialiser",

    "cat.outerwear": "Vestes",
    "cat.tops": "Hauts",
    "cat.bottoms": "Bas",

    "pdp.size": "Taille",
    "pdp.sizeGuide": "Guide des tailles",
    "pdp.composition": "Matière",
    "pdp.details": "Détails",
    "pdp.model": "Mannequin",
    "pdp.completeLook": "Complete the look",
    "pdp.soldOutLine": "Cette pièce est actuellement épuisée.",
    "pdp.notifyHint": "Laissez votre email — vous serez prévenu·e dès la réouverture.",

    "notify.title": "Prévenez-moi",
    "notify.placeholder": "Votre email",
    "notify.submit": "M'avertir",
    "notify.done": "C'est noté. Vous serez prévenu·e en premier.",

    "cart.title": "Panier",
    "cart.empty": "Votre panier est vide.",
    "cart.subtotal": "Sous-total",
    "cart.note": "Le paiement n'est pas activé sur cette préversion.",
    "cart.checkout": "Paiement (désactivé)",
    "cart.remove": "Retirer",

    "news.title": "F&F List",
    "news.body": "Accès anticipé aux drops. Pas de spam.",
    "news.placeholder": "Votre email",
    "news.submit": "S'inscrire",
    "news.done": "Bienvenue sur la liste F&F.",

    "countdown.open": "Ouverture des commandes",
    "countdown.days": "j",
    "countdown.hours": "h",
    "countdown.minutes": "m",
    "countdown.seconds": "s",

    "footer.tagline": "Mode contemporaine avant-gardiste · Paris · Made to order",
    "footer.rights": "Tous droits réservés.",
  },
  en: {
    "nav.shop": "Acquire",
    "nav.collections": "Campaigns",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cart": "Cart",
    "nav.menu": "Menu",
    "nav.close": "Close",

    "cta.discover": "Discover",
    "cta.shopSeason": "Shop Saison Trois",
    "cta.addToCart": "Add to cart",
    "cta.notify": "Notify me",
    "cta.quickView": "Quick view",
    "cta.viewProduct": "View piece",
    "cta.continue": "Continue",

    "home.selection": "Selection",

    "badge.madeToOrder": "Made to order",
    "badge.limited": "Limited edition",
    "badge.soldOut": "Sold out",

    "shop.title": "Acquire",
    "shop.intro": "Every piece, made to order in our Paris atelier.",
    "shop.filter.category": "Category",
    "shop.filter.season": "Season",
    "shop.filter.availability": "Availability",
    "shop.filter.all": "All",
    "shop.filter.available": "Available",
    "shop.filter.madeToOrder": "Made to order",
    "shop.sort": "Sort",
    "shop.sort.featured": "Featured",
    "shop.sort.priceAsc": "Price, low to high",
    "shop.sort.priceDesc": "Price, high to low",
    "shop.count": "pieces",
    "shop.empty": "No pieces match these filters.",
    "shop.clear": "Reset",

    "cat.outerwear": "Outerwear",
    "cat.tops": "Tops",
    "cat.bottoms": "Bottoms",

    "pdp.size": "Size",
    "pdp.sizeGuide": "Size guide",
    "pdp.composition": "Fabric",
    "pdp.details": "Details",
    "pdp.model": "Model",
    "pdp.completeLook": "Complete the look",
    "pdp.soldOutLine": "This piece is currently sold out.",
    "pdp.notifyHint": "Leave your email — you'll be notified the moment orders reopen.",

    "notify.title": "Notify me",
    "notify.placeholder": "Your email",
    "notify.submit": "Notify me",
    "notify.done": "Noted. You'll be the first to know.",

    "cart.title": "Cart",
    "cart.empty": "Your cart is empty.",
    "cart.subtotal": "Subtotal",
    "cart.note": "Checkout is not enabled on this preview.",
    "cart.checkout": "Checkout (disabled)",
    "cart.remove": "Remove",

    "news.title": "F&F List",
    "news.body": "Early access to drops. No spam.",
    "news.placeholder": "Your email",
    "news.submit": "Sign up",
    "news.done": "Welcome to the F&F list.",

    "countdown.open": "Orders open",
    "countdown.days": "d",
    "countdown.hours": "h",
    "countdown.minutes": "m",
    "countdown.seconds": "s",

    "footer.tagline": "Avant-garde contemporary fashion · Paris · Made to order",
    "footer.rights": "All rights reserved.",
  },
} as const;

export type TKey = keyof (typeof dict)["en"];

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
}

const Ctx = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("jaspar.locale") as Locale | null;
    if (saved === "fr" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("jaspar.locale", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: TKey) => dict[locale][key] ?? key, [locale]);

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
