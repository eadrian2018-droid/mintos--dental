import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

export type MintTheme =
  | "light"
  | "dark";

type ThemeContextValue = {
  theme: MintTheme;
  setTheme: (
    theme: MintTheme
  ) => void;
  toggleTheme: () => void;
  isLight: boolean;
  isDark: boolean;
};

const STORAGE_KEY =
  "mintos-theme";

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: ThemeProviderProps) {

  const [
    theme,
    setThemeState,
  ] = useState<MintTheme>(
    () => {

      const savedTheme =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        savedTheme === "light" ||
        savedTheme === "dark"
      ) {
        return savedTheme;
      }

      return "light";

    }
  );

  useEffect(
    () => {

      localStorage.setItem(
        STORAGE_KEY,
        theme
      );

      document.documentElement
        .setAttribute(
          "data-theme",
          theme
        );

    },
    [
      theme,
    ]
  );

  function setTheme(
    newTheme: MintTheme
  ) {

    setThemeState(
      newTheme
    );

  }

  function toggleTheme() {

    setThemeState(
      (
        currentTheme
      ) =>
        currentTheme === "light"
          ? "dark"
          : "light"
    );

  }

  const value =
    useMemo(
      () => ({
        theme,
        setTheme,
        toggleTheme,
        isLight:
          theme === "light",
        isDark:
          theme === "dark",
      }),
      [
        theme,
      ]
    );

  return (

    <ThemeContext.Provider
      value={
        value
      }
    >
      {children}
    </ThemeContext.Provider>

  );

}

export function useTheme() {

  const context =
    useContext(
      ThemeContext
    );

  if (!context) {

    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider."
    );

  }

  return context;

}