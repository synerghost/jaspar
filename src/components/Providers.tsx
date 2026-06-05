"use client";

import { LocaleProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "./CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </LocaleProvider>
  );
}
