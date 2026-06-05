import Link from "next/link";
import { clsx } from "@/lib/clsx";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 label-caps select-none transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-stone-700",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-stone-500",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4 text-xs",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {rest.children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  href,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
