import Image from "next/image";
import { clsx } from "@/lib/clsx";

type Ratio = "3/4" | "4/5" | "16/10" | "16/9" | "1/1" | "4/3";

interface MediaProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  ratio?: Ratio;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  /** optional second image revealed on hover (Shop grid behaviour) */
  hoverSrc?: string;
  /** absolutely fill the nearest positioned ancestor (full-bleed heroes) */
  fill?: boolean;
}

/**
 * Single image primitive. Reserves the aspect-ratio box up front so there
 * is zero CLS regardless of when the asset paints. Real assets should be
 * .webp/.avif at the same dimensions; the prototype ships lightweight SVG.
 */
export function Media({
  src,
  alt,
  width,
  height,
  ratio = "3/4",
  priority,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
  imgClassName,
  hoverSrc,
  fill,
}: MediaProps) {
  return (
    <div
      className={clsx(
        "overflow-hidden bg-stone-200",
        fill ? "absolute inset-0 h-full w-full" : "relative",
        className,
      )}
      style={fill ? undefined : { aspectRatio: ratio.replace("/", " / ") }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={clsx(
          "h-full w-full object-cover transition-opacity duration-700",
          hoverSrc && "group-hover:opacity-0",
          imgClassName,
        )}
      />
      {hoverSrc && (
        <Image
          src={hoverSrc}
          alt=""
          aria-hidden
          width={width}
          height={height}
          sizes={sizes}
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
        />
      )}
    </div>
  );
}
