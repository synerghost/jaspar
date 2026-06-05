import type { Product } from "./types";

/**
 * Product data sourced directly from j4spar.com (scraped June 2026).
 * Images: converted from GIF → WebP, stored in /public/media/products/.
 * Sizes match WooCommerce attribute_size options from each product page.
 */

function img(
  gifFilename: string,
  alt: string,
  thumb = false,
): { src: string; alt: string; width: number; height: number } {
  const stem = gifFilename.replace(/\.gif$/, "");
  return {
    src: `/media/products/${stem}${thumb ? "-thumb" : ""}.webp`,
    alt,
    width: thumb ? 600 : 1200,
    height: thumb ? 800 : 1600,
  };
}

export const products: Product[] = [
  {
    slug: "laced-salopette-raw-denim",
    name: "LACED SALOPETTE RAW DENIM",
    category: "bottoms",
    collection: "saison-trois",
    price: 24000,
    currency: "EUR",
    images: [
      img("image00055-scaled.gif", "LACED SALOPETTE — front view"),
      img("image00052-scaled.gif", "LACED SALOPETTE — side detail"),
      img("image00050-scaled.gif", "LACED SALOPETTE — back view"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: true,
    madeToOrder: true,
    leadTimeWeeks: 5,
    limited: true,
    fabric: "100% cotton denim",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Fits true to size",
    ],
    modelNote: "Cléa is 1m74, wears size S",
    description:
      "Cléa is wearing our Laced Salopette Raw Denim. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["strapped-army-jacket-raw-denim", "fourmis-tee-shirt-white"],
  },
  {
    slug: "strapped-army-jacket-raw-denim",
    name: "STRAPPED ARMY JACKET RAW DENIM",
    category: "outerwear",
    collection: "saison-trois",
    price: 24000,
    currency: "EUR",
    images: [
      img("image00030-scaled.gif", "STRAPPED ARMY JACKET — front view"),
      img("image00010-scaled.gif", "STRAPPED ARMY JACKET — back view"),
      img("image00036-scaled.gif", "STRAPPED ARMY JACKET — detail"),
      img("image00008-scaled.gif", "STRAPPED ARMY JACKET — worn"),
      img("image00034-scaled.gif", "STRAPPED ARMY JACKET — side"),
      img("image00009-scaled.gif", "STRAPPED ARMY JACKET — straps detail"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: true,
    madeToOrder: true,
    leadTimeWeeks: 5,
    limited: true,
    fabric: "100% cotton denim",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Fits true to size",
    ],
    modelNote: "Ezaï is 1m74, wears size L",
    description:
      "Ezai is wearing our Strapped Army Jacket Raw Denim. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["laced-salopette-raw-denim", "bowed-wrap-skirt"],
  },
  {
    slug: "fingerless-bomber-jacket-daim",
    name: "FINGERLESS BOMBER JACKET SUEDE",
    category: "outerwear",
    collection: "saison-trois",
    price: 36000,
    currency: "EUR",
    images: [
      img("image00046-scaled.gif", "FINGERLESS BOMBER JACKET — front view"),
      img("image00002-scaled.gif", "FINGERLESS BOMBER JACKET — back"),
      img("image00044-scaled.gif", "FINGERLESS BOMBER JACKET — detail"),
      img("image00041-scaled.gif", "FINGERLESS BOMBER JACKET — worn"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: true,
    madeToOrder: true,
    leadTimeWeeks: 5,
    limited: true,
    fabric: "75% vegan suede, 20% quilting, 5% polyester",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Fits true to size",
    ],
    modelNote: "Zaï is 1m74, wears size S",
    description:
      "Zaï is wearing our Fingerless Bomber Jacket Daim. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["boxer-pants-raw-denim-raw", "bowed-wrap-skirt"],
  },
  {
    slug: "bowed-wrap-skirt",
    name: "BOWED WRAP SKIRT RAW DENIM",
    category: "bottoms",
    collection: "saison-trois",
    price: 12000,
    currency: "EUR",
    images: [
      img("DSC_7734-scaled.gif", "BOWED WRAP SKIRT — front view"),
      img("image00021-scaled.gif", "BOWED WRAP SKIRT — side"),
      img("DSC_7723-scaled.gif", "BOWED WRAP SKIRT — back"),
      img("image00019-scaled.gif", "BOWED WRAP SKIRT — detail"),
      img("DSC_7747-scaled.gif", "BOWED WRAP SKIRT — worn"),
      img("image00017-scaled.gif", "BOWED WRAP SKIRT — drape"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: true,
    madeToOrder: true,
    leadTimeWeeks: 5,
    fabric: "100% cotton denim",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Fits true to size",
    ],
    modelNote: "Cléa is 1m74, wears size S",
    description:
      "Cléa is wearing our Bowed Wrap Skirt. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["strapped-army-jacket-raw-denim", "fourmis-tee-shirt-white"],
  },
  {
    slug: "boxer-pants-raw-denim-raw",
    name: "BOXER PANTS RAW DENIM",
    category: "bottoms",
    collection: "saison-trois",
    price: 15000,
    currency: "EUR",
    images: [
      img("image00005-scaled.gif", "BOXER PANTS — front view"),
      img("image00015-scaled.gif", "BOXER PANTS — back view"),
      img("image00004-scaled.gif", "BOXER PANTS — side"),
      img("image00013-scaled.gif", "BOXER PANTS — detail"),
      img("image00003-scaled.gif", "BOXER PANTS — worn"),
      img("image00011-scaled.gif", "BOXER PANTS — hem detail"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: true,
    madeToOrder: true,
    leadTimeWeeks: 5,
    fabric: "100% cotton denim",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Fits true to size",
    ],
    modelNote: "Toma is 1m78, wears size S",
    description:
      "Toma is wearing our Boxer Pants. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["fingerless-bomber-jacket-daim", "patchwork-shirt-blue"],
  },
  {
    slug: "patchwork-shirt-blue",
    name: "STRAPPED ARMY SHIRT",
    category: "tops",
    collection: "capsule-1-1-edito",
    price: 12000,
    currency: "EUR",
    images: [
      img("image00026-scaled.gif", "STRAPPED ARMY SHIRT — front view"),
      img("image00023-scaled.gif", "STRAPPED ARMY SHIRT — side"),
      img("image00027-scaled.gif", "STRAPPED ARMY SHIRT — back"),
      img("image00022-scaled.gif", "STRAPPED ARMY SHIRT — worn"),
      img("image00028-scaled.gif", "STRAPPED ARMY SHIRT — detail"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: true,
    madeToOrder: true,
    leadTimeWeeks: 5,
    fabric: "100% cotton poplin",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Fits true to size",
    ],
    modelNote: "Ezai is 1m74, wears size S",
    description:
      "Ezai is wearing our Strapped Army Shirt. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["boxer-pants-raw-denim-raw", "laced-salopette-raw-denim"],
  },
  {
    slug: "fourmis-tee-shirt-white",
    name: "FOURMIS TEE SHIRT WHITE",
    category: "tops",
    collection: "capsule-1-1-edito",
    price: 4500,
    currency: "EUR",
    images: [
      img("IMG_0557-scaled.gif", "FOURMIS TEE SHIRT WHITE — front"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: false,
    madeToOrder: true,
    leadTimeWeeks: 4,
    fabric: "100% cotton",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Not cropped",
      "Fits true to size",
    ],
    modelNote: "Fits true to size",
    description:
      "FOURMIS TEE SHIRT WHITE. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["laced-salopette-raw-denim", "bowed-wrap-skirt"],
  },
  {
    slug: "fourmis-tee-shirt-light-grey",
    name: "FOURMIS TEE SHIRT LIGHT GREY",
    category: "tops",
    collection: "capsule-1-1-edito",
    price: 4500,
    currency: "EUR",
    images: [
      img("IMG_0553-2-scaled.gif", "FOURMIS TEE SHIRT LIGHT GREY — front"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: false,
    madeToOrder: true,
    leadTimeWeeks: 4,
    fabric: "100% cotton",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Not cropped",
      "Fits true to size",
    ],
    modelNote: "Fits true to size",
    description:
      "FOURMIS TEE SHIRT LIGHT GREY. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["boxer-pants-raw-denim-raw", "patchwork-shirt-blue"],
  },
  {
    slug: "fourmis-longsleeve-light-grey",
    name: "FOURMIS LONGSLEEVE LIGHT GREY",
    category: "tops",
    collection: "capsule-1-1-edito",
    price: 6000,
    currency: "EUR",
    images: [
      img("IMG_0554-scaled.gif", "FOURMIS LONGSLEEVE LIGHT GREY — front"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: false,
    madeToOrder: true,
    leadTimeWeeks: 4,
    fabric: "100% cotton",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Not cropped",
      "Fits true to size",
    ],
    modelNote: "Fits true to size",
    description:
      "FOURMIS LONGSLEEVE LIGHT GREY. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["boxer-pants-raw-denim-raw", "laced-salopette-raw-denim"],
  },
  {
    slug: "coeur-tee-shirt-pink",
    name: "COEUR TEE SHIRT PINK",
    category: "tops",
    collection: "capsule-1-1-edito",
    price: 4500,
    currency: "EUR",
    images: [
      img("IMG_0558-scaled.gif", "COEUR TEE SHIRT PINK — front"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: false,
    madeToOrder: true,
    leadTimeWeeks: 4,
    fabric: "100% cotton",
    details: [
      "Made in Paris, France",
      "Made-to-order in our partner atelier",
      "Not cropped",
      "Fits true to size",
    ],
    modelNote: "Fits true to size",
    description:
      "COEUR TEE SHIRT PINK. All of our pieces are made-to-order in our partner atelier in Paris, France.",
    pairsWith: ["bowed-wrap-skirt", "fourmis-tee-shirt-white"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsByCollection(id: string): Product[] {
  return products.filter((p) => p.collection === id);
}
