"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Mock cart — entirely client-side, no commerce back-end, no payment.
 * Demonstrates the side-drawer add-to-cart UX called for in the brief
 * (replacing the Elementor popup). Persisted to localStorage only.
 */
export interface CartLine {
  slug: string;
  name: string;
  size: string;
  price: number; // cents
  image: string;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty">) => void;
  remove: (slug: string, size: string) => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "jaspar.cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback((line: Omit<CartLine, "qty">) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === line.slug && l.size === line.size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...line, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      remove,
    }),
    [lines, isOpen, add, remove],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
