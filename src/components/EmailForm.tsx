"use client";

import { useState } from "react";
import { useLocale, type TKey } from "@/lib/i18n";
import { clsx } from "@/lib/clsx";

/**
 * Lead-capture form (newsletter / notify-me / auction waitlist).
 * No back-end is wired: it validates and shows a success state only.
 * This is the "capture de leads" the brief asks for, stubbed for the
 * static prototype — swap onSubmit for a real endpoint later.
 */
export function EmailForm({
  placeholderKey,
  submitKey,
  doneKey,
  variant = "inline",
}: {
  placeholderKey: TKey;
  submitKey: TKey;
  doneKey: TKey;
  variant?: "inline" | "stacked";
}) {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-sm text-stone-600">{t(doneKey)}</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) setDone(true);
      }}
      className={clsx("flex gap-3", variant === "stacked" && "flex-col sm:flex-row")}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t(placeholderKey)}
        aria-label={t(placeholderKey)}
        className="min-w-0 flex-1 border-b border-ink/30 bg-transparent px-1 py-2.5 text-sm placeholder:text-stone-400 focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        className="label-caps shrink-0 border-b border-ink py-2.5 transition-colors hover:text-stone-500"
      >
        {t(submitKey)}
      </button>
    </form>
  );
}
