"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/lib/i18n";
import { EmailForm } from "./EmailForm";

export function Footer() {
  const { t, locale } = useLocale();
  const year = new Date().getFullYear();
  const fr = locale === "fr";

  return (
    <footer className="relative z-20 border-t border-ink/10 bg-paper">
      <div className="mx-[var(--spacing-gutter)] grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        {/* Brand */}
        <div>
          <Link href="/" aria-label="JASPÄR">
            <Image
              src="/brand/Jasper_header-logo_black.png"
              alt="JASPÄR"
              width={80}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 text-sm text-stone-600 max-w-xs">{t("footer.tagline")}</p>
        </div>

        {/* Shop */}
        <nav aria-label={t("nav.shop")}>
          <h2 className="eyebrow mb-4">{t("nav.shop")}</h2>
          <ul className="flex flex-col gap-2">
            <li><Link href="/shop" className="text-sm text-stone-600 link-underline">{fr ? "Toutes les pièces" : "All pieces"}</Link></li>
            <li><Link href="/collections/saison-trois" className="text-sm text-stone-600 link-underline">Saison Trois</Link></li>
            <li><Link href="/collections/capsule-1-1-edito" className="text-sm text-stone-600 link-underline">Capsule 1·1 Edito</Link></li>
          </ul>
        </nav>

        {/* Studio */}
        <nav aria-label={t("nav.about")}>
          <h2 className="eyebrow mb-4">{t("nav.about")}</h2>
          <ul className="flex flex-col gap-2">
            <li><Link href="/about" className="text-sm text-stone-600 link-underline">{t("nav.about")}</Link></li>
            <li><Link href="/contact" className="text-sm text-stone-600 link-underline">{t("nav.contact")}</Link></li>
            <li>
              <a href="https://instagram.com/j4spar" target="_blank" rel="noopener noreferrer"
                className="text-sm text-stone-600 link-underline">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/@jaspar.studio" target="_blank" rel="noopener noreferrer"
                className="text-sm text-stone-600 link-underline">
                TikTok
              </a>
            </li>
          </ul>
        </nav>

        {/* F&F */}
        <div>
          <h2 className="eyebrow mb-4">{t("news.title")}</h2>
          <p className="mb-4 text-sm text-stone-600">{t("news.body")}</p>
          <EmailForm placeholderKey="news.placeholder" submitKey="news.submit" doneKey="news.done" />
        </div>
      </div>

      <div className="mx-[var(--spacing-gutter)] flex flex-col items-start justify-between gap-2 border-t border-ink/10 py-6 text-stone-500 sm:flex-row sm:items-center">
        <p className="label-caps">© {year} JASPÄR · Paris — {t("footer.rights")}</p>
        <p className="label-caps">EUR €</p>
      </div>
    </footer>
  );
}
