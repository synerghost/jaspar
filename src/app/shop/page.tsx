"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { collections } from "@/data/collections";
import type { Category, CollectionId } from "@/data/types";
import { useLocale } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";
import { ProductCard } from "@/components/ProductCard";
import { Container, Section } from "@/components/Layout";
import { Reveal } from "@/components/Reveal";

type CatFilter = Category | "all";
type SeasonFilter = CollectionId | "all";
type AvailFilter = "all" | "available" | "made-to-order";
type Sort = "featured" | "price-asc" | "price-desc";

export default function ShopPage() {
  const { t } = useLocale();
  const [cat, setCat] = useState<CatFilter>("all");
  const [season, setSeason] = useState<SeasonFilter>("all");
  const [avail, setAvail] = useState<AvailFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");

  const list = useMemo(() => {
    let out = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (season !== "all" && p.collection !== season) return false;
      if (avail === "available" && (p.madeToOrder || p.soldOut)) return false;
      if (avail === "made-to-order" && !p.madeToOrder) return false;
      return true;
    });
    if (sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [cat, season, avail, sort]);

  const reset = () => {
    setCat("all");
    setSeason("all");
    setAvail("all");
    setSort("featured");
  };

  const cats: { v: CatFilter; label: string }[] = [
    { v: "all", label: t("shop.filter.all") },
    { v: "outerwear", label: t("cat.outerwear") },
    { v: "tops", label: t("cat.tops") },
    { v: "bottoms", label: t("cat.bottoms") },
  ];

  return (
    <Section className="!pt-12">
      <Container>
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <span className="eyebrow">{collections.map((c) => c.name).join(" · ")}</span>
          <h1 className="display mt-3 text-4xl md:text-6xl">{t("shop.title")}</h1>
          <p className="mt-4 text-stone-600">{t("shop.intro")}</p>
        </div>

        {/* Filters — clean, coherent (audit P1 #7) */}
        <div className="sticky top-16 z-30 -mx-[var(--spacing-gutter)] mb-10 border-y border-ink/10 bg-paper/85 px-[var(--spacing-gutter)] py-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterGroup label={t("shop.filter.category")}>
              {cats.map((c) => (
                <Chip key={c.v} active={cat === c.v} onClick={() => setCat(c.v)}>
                  {c.label}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label={t("shop.filter.season")}>
              <Chip active={season === "all"} onClick={() => setSeason("all")}>
                {t("shop.filter.all")}
              </Chip>
              {collections.map((c) => (
                <Chip key={c.id} active={season === c.id} onClick={() => setSeason(c.id)}>
                  {c.name}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label={t("shop.filter.availability")}>
              <Chip active={avail === "all"} onClick={() => setAvail("all")}>
                {t("shop.filter.all")}
              </Chip>
              <Chip active={avail === "available"} onClick={() => setAvail("available")}>
                {t("shop.filter.available")}
              </Chip>
              <Chip active={avail === "made-to-order"} onClick={() => setAvail("made-to-order")}>
                {t("shop.filter.madeToOrder")}
              </Chip>
            </FilterGroup>

            <label className="ml-auto flex items-center gap-2">
              <span className="eyebrow">{t("shop.sort")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="label-caps cursor-pointer border-b border-ink/30 bg-transparent py-1 focus:border-ink focus:outline-none"
              >
                <option value="featured">{t("shop.sort.featured")}</option>
                <option value="price-asc">{t("shop.sort.priceAsc")}</option>
                <option value="price-desc">{t("shop.sort.priceDesc")}</option>
              </select>
            </label>
          </div>
        </div>

        <p className="eyebrow mb-6">
          {list.length} {t("shop.count")}
        </p>

        {list.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-600">{t("shop.empty")}</p>
            <button onClick={reset} className="label-caps link-underline mt-4">
              {t("shop.clear")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 50}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow hidden lg:inline">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "label-caps border px-3 py-1.5 transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-ink/20 text-stone-600 hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
