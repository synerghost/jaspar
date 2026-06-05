import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getCollection } from "@/data/collections";
import { CollectionDetail } from "@/components/CollectionDetail";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.intro,
    openGraph: { title: `${collection.name} — JASPÄR`, images: [{ url: collection.cover.src }] },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();
  return <CollectionDetail collection={collection} />;
}
