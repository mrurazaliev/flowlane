import { create } from "zustand";

// Тёмная / светлая тема. Выбор хранится в localStorage, тема — это класс .dark на <html>.

export type Theme = "light" | "dark";

const THEME_KEY = "theme";

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  // На сервере и при первой отрисовке всегда "light" — настоящее значение ставит loadSavedTheme()
  theme: "light",

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
}));

/** Вызывается один раз в браузере (Providers): берёт тему, которую уже поставил themeScript */
export const loadSavedTheme = () => {
  const isDark = document.documentElement.classList.contains("dark");
  useThemeStore.setState({ theme: isDark ? "dark" : "light" });
};

/**
 * Маленький скрипт в <head>: ставит класс .dark ДО отрисовки страницы,
 * чтобы при загрузке не мигала светлая тема.
 * Если пользователь ещё не выбирал — берём тему системы.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;
