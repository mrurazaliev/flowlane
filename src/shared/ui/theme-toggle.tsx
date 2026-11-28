"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/shared/lib/theme";
import { useT } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";

export const ThemeToggle = ({ withLabel = false, className }: { withLabel?: boolean; className?: string }) => {
  const t = useT();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      className={cn(
        "flex items-center gap-2.5 rounded-lg text-sm transition-colors",
        withLabel ? "w-full px-2.5 py-2 hover:bg-gray-100" : "size-9 justify-center text-muted hover:bg-gray-100 hover:text-ink",
        className,
      )}
    >
      <Icon className={cn("size-4", withLabel && "text-muted")} />
      {withLabel && (isDark ? t("theme.light") : t("theme.dark"))}
    </button>
  );
};
