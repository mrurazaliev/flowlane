"use client";

import { locales, useLocaleStore, useT } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";

/** Переключатель языка: EN | RU */
export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div role="group" aria-label={t("common.language")} className={cn("inline-flex rounded-lg border border-line p-0.5", className)}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors",
            locale === l ? "bg-ink text-canvas" : "text-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
};
