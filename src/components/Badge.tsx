import { clsx } from "@/lib/clsx";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "live" | "muted";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "label-caps inline-flex items-center gap-1.5 border px-2 py-1 backdrop-blur-sm",
        tone === "default" && "border-ink/30 bg-paper/70 text-ink",
        tone === "muted" && "border-stone-400/40 bg-paper/60 text-stone-500",
        tone === "live" && "border-[var(--color-live)]/40 bg-paper/70 text-[var(--color-live)]",
        className,
      )}
    >
      {tone === "live" && (
        <span className="live-dot inline-block size-1.5 rounded-full bg-[var(--color-live)]" />
      )}
      {children}
    </span>
  );
}
