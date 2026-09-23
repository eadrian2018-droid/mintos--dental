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

export type MintLanguage =
  | "es"
  | "en";

type LanguageContextValue = {
  language: MintLanguage;
  setLanguage: (
    language: MintLanguage
  ) => void;
  toggleLanguage: () => void;
  isSpanish: boolean;
  isEnglish: boolean;
};

const STORAGE_KEY =
  "mintos-language";

const LanguageContext =
  createContext<
    LanguageContextValue | undefined
  >(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({
  children,
}: LanguageProviderProps) {

  const [
    language,
    setLanguageState,
  ] = useState<MintLanguage>(
    () => {

      const savedLanguage =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        savedLanguage === "en" ||
        savedLanguage === "es"
      ) {
        return savedLanguage;
      }

      return "es";

    }
  );

  useEffect(
    () => {

      localStorage.setItem(
        STORAGE_KEY,
        language
      );

      document.documentElement.lang =
        language;

    },
    [
      language,
    ]
  );

  function setLanguage(
    newLanguage: MintLanguage
  ) {

    setLanguageState(
      newLanguage
    );

  }

  function toggleLanguage() {

    setLanguageState(
      (
        currentLanguage
      ) =>
        currentLanguage === "es"
          ? "en"
          : "es"
    );

  }

  const value =
    useMemo(
      () => ({
        language,
        setLanguage,
        toggleLanguage,
        isSpanish:
          language === "es",
        isEnglish:
          language === "en",
      }),
      [
        language,
      ]
    );

  return (

    <LanguageContext.Provider
      value={
        value
      }
    >
      {children}
    </LanguageContext.Provider>

  );

}

export function useLanguage() {

  const context =
    useContext(
      LanguageContext
    );

  if (!context) {

    throw new Error(
      "useLanguage debe utilizarse dentro de LanguageProvider."
    );

  }

  return context;

}