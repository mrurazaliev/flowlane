import { create } from "zustand";
import { en, type TranslationKey } from "./en";
import { ru } from "./ru";
import { ruTexts } from "./ru-texts";

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

type Vars = Record<string, string | number>;

/** Подставляет значения: "Delete {name}" + { name: "Bug" } → "Delete Bug" */
const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match)) : text;

/**
 * Перевод одной строки. Ключом может быть:
 *  - короткий ключ из en.ts/ru.ts ("login.title") — так сделаны страницы входа и профиля;
 *  - сам английский текст ("Save changes") — для него ищем перевод в ru-texts.ts.
 * Если перевода нет, показываем английский текст как есть.
 */
const translateIn = (locale: Locale, key: string, vars?: Vars) => {
  const text =
    dictionaries[locale][key as TranslationKey] ??
    (locale === "ru" ? ruTexts[key] : undefined) ??
    en[key as TranslationKey] ??
    key;
  return fill(text, vars);
};

/** Хук перевода для компонентов: при смене языка компонент перерисуется сам */
export const useT = () => {
  const locale = useLocaleStore((s) => s.locale);
  return (key: TranslationKey | (string & {}), vars?: Vars) => translateIn(locale, key, vars);
};

/**
 * Перевод без хука — для мест, где хуки нельзя (обычные функции: formatDate, errorText, подписи иконок).
 * Берёт текущий язык из стора. Такие места перерисовываются вместе с компонентом, который использует useT().
 */
export const translate = (key: TranslationKey | (string & {}), vars?: Vars) =>
  translateIn(useLocaleStore.getState().locale, key, vars);

/** Текущий язык без подписки — для форматирования дат */
export const currentLocale = () => useLocaleStore.getState().locale;
