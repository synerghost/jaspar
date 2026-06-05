"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/data/types";
import { clsx } from "@/lib/clsx";

/** High-def gallery with click-to-zoom (audit P1 #8: real zoom, no popup). */
export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const img = images[active];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {images.map((im, i) => (
            <button
              key={im.src}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={clsx(
                "relative w-16 overflow-hidden border transition-colors md:w-20",
                i === active ? "border-ink" : "border-transparent hover:border-ink/30",
              )}
              style={{ aspectRatio: "3 / 4" }}
            >
              <Image src={im.src} alt="" width={120} height={160} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <button
        onClick={() => setZoom(true)}
        className="group relative flex-1 cursor-zoom-in overflow-hidden bg-stone-200"
        style={{ aspectRatio: "3 / 4" }}
        aria-label="Zoom image"
      >
        <Image
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          priority
          sizes="(min-width:768px) 50vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </button>

      {/* Zoom overlay */}
      {zoom && (
        <div
          className="fixed inset-0 z-[70] flex cursor-zoom-out items-center justify-center bg-ink/90 p-6"
          onClick={() => setZoom(false)}
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            className="max-h-full w-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}
