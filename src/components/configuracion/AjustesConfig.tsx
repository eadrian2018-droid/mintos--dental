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

      <section
        className="
          overflow-hidden
          rounded-[24px]
          border
          border-[var(--mint-border)]
          bg-white
          shadow-[0_12px_34px_rgba(15,42,65,0.07)]
        "
      >

        <div
          className="
            relative
            overflow-hidden
            bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
            px-6
            py-6
          "
        >

          <div className="relative z-10 flex items-center gap-4">

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-white/15
                bg-white/10
                text-white
                shadow-sm
              "
            >
              <MonitorCog size={24} />
            </div>

            <div>

              <p
                className="
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.16em]
                  text-[var(--mint-teal-soft)]
                "
              >
                {es ? "Preferencias de MintOS" : "MintOS preferences"}
              </p>

              <h1
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-white
                "
              >
                {es ? "Ajustes" : "Settings"}
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-white/70
                "
              >
                {
                  es
                    ? "Personaliza el idioma y la apariencia de tu espacio de trabajo."
                    : "Customize the language and appearance of your workspace."
                }
              </p>

            </div>

          </div>

          <div
            className="
              absolute
              bottom-0
              left-0
              h-[3px]
              w-full
              bg-[linear-gradient(90deg,#19a991_0%,#65cdb8_55%,#d8bd72_100%)]
            "
          />

        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-5
            bg-[var(--mint-app-bg)]
            p-6
            xl:grid-cols-2
          "
        >

          {/* IDIOMA */}

          <section
            className="
              rounded-[20px]
              border
              border-[var(--mint-border)]
              bg-white
              p-5
              shadow-[0_6px_18px_rgba(15,42,65,0.035)]
            "
          >

            <div
              className="
                flex
                h-full
                flex-col
                justify-between
                gap-5
              "
            >

              <div className="flex gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[var(--mint-border-teal)]
                    bg-[var(--mint-surface-teal)]
                    text-[var(--mint-teal)]
                  "
                >
                  <Languages size={19} />
                </div>

                <div>

                  <p
                    className="
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--mint-teal)]
                    "
                  >
                    {es ? "Interfaz" : "Interface"}
                  </p>

                  <h2
                    className="
                      mt-1
                      font-bold
                      text-[var(--mint-navy)]
                    "
                  >
                    {es ? "Idioma" : "Language"}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-[var(--mint-text-secondary)]
                    "
                  >
                    {
                      es
                        ? "Selecciona el idioma que utilizará la interfaz de MintOS."
                        : "Select the language used throughout the MintOS interface."
                    }
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  items-center
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-surface-soft)]
                  p-1
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setLanguage("es")
                  }
                  className={`
                    flex-1
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      language === "es"
                        ? `
                            !bg-[linear-gradient(115deg,#087b80_0%,#119f91_55%,#19b5a0_100%)]
                            !text-white
                            shadow-[0_5px_14px_rgba(3,93,98,0.28)]
                            ring-1
                            !ring-[#4ad6c3]
                          `
                        : `
                            text-[var(--mint-text-muted)]
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
                    flex-1
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      language === "en"
                        ? `
                            !bg-[linear-gradient(115deg,#087b80_0%,#119f91_55%,#19b5a0_100%)]
                            !text-white
                            shadow-[0_5px_14px_rgba(3,93,98,0.28)]
                            ring-1
                            !ring-[#4ad6c3]
                          `
                        : `
                            text-[var(--mint-text-muted)]
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
              rounded-[20px]
              border
              border-[var(--mint-border)]
              bg-white
              p-5
              shadow-[0_6px_18px_rgba(15,42,65,0.035)]
            "
          >

            <div
              className="
                flex
                h-full
                flex-col
                justify-between
                gap-5
              "
            >

              <div className="flex gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[var(--mint-border-teal)]
                    bg-[var(--mint-surface-teal)]
                    text-[var(--mint-teal)]
                  "
                >
                  {
                    theme === "dark"
                      ? <Moon size={19} />
                      : <Sun size={19} />
                  }
                </div>

                <div>

                  <p
                    className="
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--mint-teal)]
                    "
                  >
                    {es ? "Visual" : "Visual"}
                  </p>

                  <h2
                    className="
                      mt-1
                      font-bold
                      text-[var(--mint-navy)]
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
                      mt-1
                      text-sm
                      leading-6
                      text-[var(--mint-text-secondary)]
                    "
                  >
                    {
                      es
                        ? "Selecciona el tema visual que deseas utilizar en MintOS."
                        : "Select the visual theme you want to use in MintOS."
                    }
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  items-center
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-surface-soft)]
                  p-1
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setTheme("light")
                  }
                  className={`
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      theme === "light"
                        ? `
                            !bg-[linear-gradient(115deg,#087b80_0%,#119f91_55%,#19b5a0_100%)]
                            !text-white
                            shadow-[0_5px_14px_rgba(3,93,98,0.28)]
                            ring-1
                            !ring-[#4ad6c3]
                          `
                        : `
                            text-[var(--mint-text-muted)]
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
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      theme === "dark"
                        ? `
                            !bg-[linear-gradient(115deg,#087b80_0%,#119f91_55%,#19b5a0_100%)]
                            !text-white
                            shadow-[0_5px_14px_rgba(3,93,98,0.28)]
                            ring-1
                            !ring-[#4ad6c3]
                          `
                        : `
                            text-[var(--mint-text-muted)]
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

      </section>

    </div>

  );

}