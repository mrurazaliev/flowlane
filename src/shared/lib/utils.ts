import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { currentLocale, translate } from "@/shared/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Alex Rivera" → "AR" */
export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** ISO-дата → "Dec 12" / "12 дек." (в UTC, чтобы сервер и браузер рисовали одинаково) */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(currentLocale() === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** 48200 → "47 KB" */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Даты цикла/модуля: "Nov 23 → Dec 6" или "No dates" */
export function formatDateRange(start: string | null, end: string | null) {
  if (!start && !end) return translate("No dates");
  return `${start ? formatDate(start) : "…"} → ${end ? formatDate(end) : "…"}`;
}
