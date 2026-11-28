import { create } from "zustand";
import { en, type TranslationKey } from "./en";
import { ru } from "./ru";
import { ruTexts } from "./ru-texts";

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
  locale: "en",

  setLocale: (locale) => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

export const loadSavedLocale = () => {
  const saved = localStorage.getItem(LOCALE_KEY);
  const fromBrowser = navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
  const locale = isLocale(saved) ? saved : fromBrowser;
  document.documentElement.lang = locale;
  useLocaleStore.setState({ locale });
};

type Vars = Record<string, string | number>;

const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match)) : text;

const translateIn = (locale: Locale, key: string, vars?: Vars) => {
  const text =
    dictionaries[locale][key as TranslationKey] ??
    (locale === "ru" ? ruTexts[key] : undefined) ??
    en[key as TranslationKey] ??
    key;
  return fill(text, vars);
};

export const useT = () => {
  const locale = useLocaleStore((s) => s.locale);
  return (key: TranslationKey | (string & {}), vars?: Vars) => translateIn(locale, key, vars);
};

export const translate = (key: TranslationKey | (string & {}), vars?: Vars) =>
  translateIn(useLocaleStore.getState().locale, key, vars);

export const currentLocale = () => useLocaleStore.getState().locale;
