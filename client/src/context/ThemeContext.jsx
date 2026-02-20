import { createContext, useContext, useMemo, useState } from "react";

const THEME_KEY = "theme";
const LEGACY_THEME_KEY = "devnotes_theme";
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const applyTheme = (nextTheme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", nextTheme === "dark");
    root.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch (_) {
      // localStorage may be unavailable in some environments
    }
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY);
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      return stored;
    }
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = prefersDark ? "dark" : "light";
    applyTheme(initialTheme);
    return initialTheme;
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
