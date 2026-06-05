export type Category = "outerwear" | "tops" | "bottoms";
export type CollectionId = "saison-trois" | "capsule-1-1-edito";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Measurement {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  category: Category;
  collection: CollectionId;
  /** price in cents, EUR */
  price: number;
  /** ISO currency */
  currency: "EUR";
  images: ProductImage[];
  sizes: string[];
  /** sizes that are sold out (made-to-order waitlist) */
  soldOutSizes?: string[];
  /** entire piece is sold out → notify-me only */
  soldOut?: boolean;
  madeToOrder: boolean;
  /** lead time in weeks */
  leadTimeWeeks: number;
  limited?: boolean;
  fabric: string;
  details: string[];
  /** model line, e.g. "Cléa is 1m74, wears S" */
  modelNote: string;
  description: string;
  /** slugs for "complete the look" */
  pairsWith: string[];
}

export interface Collection {
  id: CollectionId;
  name: string;
  tagline: string;
  intro: string;
  cover: ProductImage;
  /** ordered story blocks, alternating media + text */
  lookbook: ProductImage[];
}

export type LotStatus = "upcoming" | "live" | "closed";

export interface AuctionLot {
  slug: string;
  number: string;
  title: string;
  kind: string; // e.g. "Denim sculpture", "1 of 1", "Collaboration"
  image: ProductImage;
  estimate: string;
  /** ISO datetime the lot opens/closes */
  opensAt: string;
  status: LotStatus;
  note: string;
}
