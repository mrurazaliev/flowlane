import { create } from "zustand";
import { en, type TranslationKey } from "./en";
import { ru } from "./ru";

// Переводы без сторонних библиотек: словари en/ru + стор с текущим языком.
// В компоненте:  const t = useT();  …  <h1>{t("login.title")}</h1>

export type { TranslationKey };

export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ru };

const LOCALE_KEY = "locale";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  // На сервере всегда "en" — сохранённый язык ставит loadSavedLocale() уже в браузере
  locale: "en",

  setLocale: (locale) => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/** Вызывается один раз в браузере (Providers). Нет сохранённого языка → язык браузера */
export const loadSavedLocale = () => {
  const saved = localStorage.getItem(LOCALE_KEY);
  const fromBrowser = navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
  const locale = isLocale(saved) ? saved : fromBrowser;
  document.documentElement.lang = locale;
  useLocaleStore.setState({ locale });
};

/**
 * Хук перевода. Принимает и ключ, и просто строку: если ключа нет в словаре,
 * вернёт строку как есть (удобно для сообщений Zod и ошибок бэкенда).
 */
export const useT = () => {
  const locale = useLocaleStore((s) => s.locale);
  return (key: TranslationKey | (string & {})) =>
    dictionaries[locale][key as TranslationKey] ?? en[key as TranslationKey] ?? key;
};
