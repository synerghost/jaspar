import { clsx } from "@/lib/clsx";

/** Gutter-padded full-bleed-capable container. */
export function Container({
  children,
  className,
  bleed = false,
}: {
  children: React.ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return <div className={clsx(!bleed && "mx-[var(--spacing-gutter)]", className)}>{children}</div>;
}

/** Vertical rhythm wrapper for editorial sections. */
export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={clsx("mb-10 flex flex-col gap-3", className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="display text-3xl md:text-5xl">{title}</h2>
    </div>
  );
}
