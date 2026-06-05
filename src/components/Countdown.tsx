"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function Countdown({ target, className }: { target: string; className?: string }) {
  const { t } = useLocale();
  const ts = new Date(target).getTime();
  const [time, setTime] = useState(() => diff(ts));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(diff(ts)), 1000);
    return () => clearInterval(id);
  }, [ts]);

  // Time-based output only exists after mount → no SSR/client mismatch.
  if (!mounted) {
    return <span className={className}>—</span>;
  }

  if (time.done) {
    return <span className={className}>{t("countdown.open")}</span>;
  }

  const unit = (n: number, label: string) => (
    <span className="tabular-nums">
      {String(n).padStart(2, "0")}
      <span className="text-stone-500">{label}</span>
    </span>
  );

  return (
    <span className={className} suppressHydrationWarning>
      {unit(time.d, t("countdown.days"))} {unit(time.h, t("countdown.hours"))}{" "}
      {unit(time.m, t("countdown.minutes"))} {unit(time.s, t("countdown.seconds"))}
    </span>
  );
}
