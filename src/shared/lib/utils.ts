import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { currentLocale, translate } from "@/shared/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(currentLocale() === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateRange(start: string | null, end: string | null) {
  if (!start && !end) return translate("No dates");
  return `${start ? formatDate(start) : "…"} → ${end ? formatDate(end) : "…"}`;
}
