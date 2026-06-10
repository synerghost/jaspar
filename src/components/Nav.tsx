"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useLocale, type TKey } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";

/**
 * Single source-of-truth nav. Rendered once in the DOM (audit P0 #5).
 * Matches the real j4spar.com navigation:
 * ACQUIRE / CAMPAIGNS / ABOUT / CONTACT
 */
const links: { href: string; key: TKey }[] = [
  { href: "/shop",                             key: "nav.shop" },
  { href: "/collections/saison-trois",         key: "nav.collections" },
  { href: "/about",                            key: "nav.about" },
  { href: "/contact",                          key: "nav.contact" },
];

export function Nav() {
  const { t, locale, setLocale } = useLocale();
  const { count, open } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-400",
        // Verre quasi transparent : flou minimal pour garder la texture des
        // tuiles visible à travers (pas d'aplat orange).
        scrolled
          ? "border-b border-ink/10 bg-paper/55 backdrop-blur-md"
          : "border-b border-white/10 bg-paper/5 backdrop-blur-[2px]",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-[var(--spacing-gutter)] grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4"
      >
        {/* Left — first two links (desktop) */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.slice(0, 2).map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={clsx(
                  "label-caps link-underline transition-colors",
                  pathname.startsWith(l.href) ? "text-ink" : "text-stone-500 hover:text-ink",
                )}
              >
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle — burger icon */}
        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
        >
          <span
            className={clsx(
              "block h-px w-5 bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              menuOpen && "translate-y-[6px] rotate-45",
            )}
          />
          <span
            className={clsx(
              "block h-px w-5 bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              menuOpen && "opacity-0",
            )}
          />
          <span
            className={clsx(
              "block h-px w-5 bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              menuOpen && "-translate-y-[6px] -rotate-45",
            )}
          />
        </button>

        {/* Centre — real logo mark */}
        <Link href="/" aria-label="JASPÄR home" className="flex items-center justify-center">
          <Image
            src="/brand/Jasper_header-logo_black.png"
            alt="JASPÄR"
            width={72}
            height={36}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Right — last two links + locale + cart */}
        <div className="flex items-center justify-end gap-6">
          <ul className="hidden items-center gap-8 md:flex">
            {links.slice(2).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={clsx(
                    "label-caps link-underline transition-colors",
                    pathname.startsWith(l.href) ? "text-ink" : "text-stone-500 hover:text-ink",
                  )}
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Locale toggle */}
          <div className="label-caps flex items-center gap-1 text-stone-400">
            <button
              onClick={() => setLocale("fr")}
              className={clsx("hover:text-ink", locale === "fr" && "text-ink")}
              aria-pressed={locale === "fr"}
            >
              FR
            </button>
            <span aria-hidden>/</span>
            <button
              onClick={() => setLocale("en")}
              className={clsx("hover:text-ink", locale === "en" && "text-ink")}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>

          <button onClick={open} className="label-caps link-underline" aria-label={t("nav.cart")}>
            ({count})
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <ul
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-ink/10 bg-paper px-[var(--spacing-gutter)] py-8 md:hidden"
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="display block py-3 text-4xl">
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
