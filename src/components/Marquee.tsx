import { clsx } from "@/lib/clsx";

/** Editorial running banner — pure CSS, reduced-motion aware. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={clsx("overflow-hidden border-y border-ink/10 py-3", className)}>
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-12 motion-reduce:animate-none">
        {row.map((it, i) => (
          <span key={i} className="label-caps whitespace-nowrap text-stone-500">
            {it} <span className="mx-6 text-stone-300">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
