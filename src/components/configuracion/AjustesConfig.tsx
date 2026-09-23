import {
  Languages,
  MonitorCog,
  Moon,
  Sun,
} from "lucide-react";

import {
  useLanguage,
} from "../../context/LanguageContext";

import {
  useTheme,
} from "../../context/ThemeContext";

export default function AjustesConfig() {

  const {
    language,
    setLanguage,
  } = useLanguage();

  const {
    theme,
    setTheme,
  } = useTheme();

  const es =
    language === "es";

  return (

    <div className="space-y-5">

      <div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
              bg-[var(--mint-primary-soft)]
              text-[var(--mint-primary)]
            "
          >
            <MonitorCog size={20} />
          </div>

          <div>

            <h1
              className="
                text-2xl
                font-bold
                mint-text-primary
              "
            >
              {es ? "Ajustes" : "Settings"}
            </h1>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {
                es
                  ? "Personaliza la apariencia y el funcionamiento de MintOS."
                  : "Customize the appearance and behavior of MintOS."
              }
            </p>

          </div>

        </div>

      </div>

      {/* IDIOMA */}

      <section
        className="
          mint-card
          p-5
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-6
          "
        >

          <div
            className="
              flex
              gap-3
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                bg-[var(--mint-bg-soft)]
                text-[var(--mint-primary)]
                flex-shrink-0
              "
            >
              <Languages size={18} />
            </div>

            <div>

              <h2
                className="
                  font-bold
                  mint-text-primary
                "
              >
                {es ? "Idioma" : "Language"}
              </h2>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                {
                  es
                    ? "Selecciona el idioma de la interfaz de MintOS."
                    : "Select the language of the MintOS interface."
                }
              </p>

            </div>

          </div>

          <div
            className="
              flex
              items-center
              rounded-xl
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              p-1
              flex-shrink-0
            "
          >

            <button
              type="button"
              onClick={() =>
                setLanguage("es")
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-semibold
                transition

                ${
                  language === "es"
                    ? `
                        bg-[var(--mint-bg-card)]
                        text-[var(--mint-primary)]
                        shadow-sm
                      `
                    : `
                        mint-text-muted
                        hover:text-[var(--mint-text-primary)]
                      `
                }
              `}
            >
              Español
            </button>

            <button
              type="button"
              onClick={() =>
                setLanguage("en")
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-semibold
                transition

                ${
                  language === "en"
                    ? `
                        bg-[var(--mint-bg-card)]
                        text-[var(--mint-primary)]
                        shadow-sm
                      `
                    : `
                        mint-text-muted
                        hover:text-[var(--mint-text-primary)]
                      `
                }
              `}
            >
              English
            </button>

          </div>

        </div>

      </section>

      {/* APARIENCIA */}

      <section
        className="
          mint-card
          p-5
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-6
          "
        >

          <div
            className="
              flex
              gap-3
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                bg-[var(--mint-bg-soft)]
                text-[var(--mint-primary)]
                flex-shrink-0
              "
            >
              {
                theme === "dark"
                  ? <Moon size={18} />
                  : <Sun size={18} />
              }
            </div>

            <div>

              <h2
                className="
                  font-bold
                  mint-text-primary
                "
              >
                {
                  es
                    ? "Apariencia"
                    : "Appearance"
                }
              </h2>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                {
                  es
                    ? "Selecciona el tema visual de MintOS."
                    : "Select the visual theme for MintOS."
                }
              </p>

            </div>

          </div>

          <div
            className="
              flex
              items-center
              rounded-xl
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              p-1
              flex-shrink-0
            "
          >

            <button
              type="button"
              onClick={() =>
                setTheme("light")
              }
              className={`
                flex
                items-center
                gap-2
                rounded-lg
                px-4
                py-2
                text-sm
                font-semibold
                transition

                ${
                  theme === "light"
                    ? `
                        bg-[var(--mint-bg-card)]
                        text-[var(--mint-primary)]
                        shadow-sm
                      `
                    : `
                        mint-text-muted
                        hover:text-[var(--mint-text-primary)]
                      `
                }
              `}
            >
              <Sun size={16} />

              {
                es
                  ? "Claro"
                  : "Light"
              }
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme("dark")
              }
              className={`
                flex
                items-center
                gap-2
                rounded-lg
                px-4
                py-2
                text-sm
                font-semibold
                transition

                ${
                  theme === "dark"
                    ? `
                        bg-[var(--mint-bg-card)]
                        text-[var(--mint-primary)]
                        shadow-sm
                      `
                    : `
                        mint-text-muted
                        hover:text-[var(--mint-text-primary)]
                      `
                }
              `}
            >
              <Moon size={16} />

              {
                es
                  ? "Oscuro"
                  : "Dark"
              }
            </button>

          </div>

        </div>

      </section>

    </div>

  );

}