"use client";

import { useEffect } from "react";
import { clsx } from "@/lib/clsx";

/** Side drawer used for cart + quick-view. Locks scroll, ESC to close. */
export function Drawer({
  open,
  onClose,
  side = "right",
  label,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  label: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={clsx("fixed inset-0 z-[60] overflow-hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={clsx(
          "absolute top-0 flex h-full w-full flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          width,
          side === "right" ? "right-0" : "left-0",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        {children}
      </aside>
    </div>
  );
}
