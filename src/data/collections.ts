import type { Collection } from "./types";

export const collections: Collection[] = [
  {
    id: "saison-trois",
    name: "Saison Trois",
    tagline: "Construction visible, matière brute",
    intro:
      "Saison Trois lit le denim comme matière de sculpture. Les coutures sont exposées, les bords laissés bruts. Chaque pièce est faite à la commande dans notre atelier à Paris.",
    cover: {
      src: "/media/campaign/look1.webp",
      alt: "Saison Trois campaign",
      width: 1400,
      height: 2100,
    },
    lookbook: [
      { src: "/media/campaign/look1.webp", alt: "Saison Trois — look 01", width: 1400, height: 2100 },
      { src: "/media/campaign/look2.webp", alt: "Saison Trois — look 02", width: 1400, height: 2100 },
      { src: "/media/campaign/look3.webp", alt: "Saison Trois — campaign", width: 1400, height: 933 },
      { src: "/media/campaign/hero.webp", alt: "Saison Trois — hero shot", width: 2000, height: 1334 },
    ],
  },
  {
    id: "capsule-1-1-edito",
    name: "Capsule 1·1 — Edito",
    tagline: "Le dessin porté",
    intro:
      "FOURMIS, CŒUR — la pratique graphique de l'atelier sérigraphiée à la main sur du jersey lourd. Là où la collection finit et l'œuvre commence reste délibérément flou.",
    cover: {
      src: "/media/campaign/look2.webp",
      alt: "Capsule 1·1 Edito campaign",
      width: 1400,
      height: 2100,
    },
    lookbook: [
      { src: "/media/campaign/look2.webp", alt: "Capsule Edito — look 01", width: 1400, height: 2100 },
      { src: "/media/campaign/look1.webp", alt: "Capsule Edito — look 02", width: 1400, height: 2100 },
    ],
  },
];

export function getCollection(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}
