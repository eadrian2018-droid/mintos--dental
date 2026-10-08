import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Gasto,
} from "../../types/Gasto";

import { useAuth }
  from "../../context/AuthContext";

import { useLanguage }
  from "../../context/LanguageContext";

import { supabase }
  from "../../lib/supabase";

type PeriodoGastos =
  | "semana"
  | "mes"
  | "anio"
  | "historico";

type GastosProps = {

  total: number;

  cantidad: number;

  fechaGasto: string;

  setFechaGasto:
    Dispatch<
      SetStateAction<string>
    >;

  conceptoGasto: string;

  setConceptoGasto:
    Dispatch<
      SetStateAction<string>
    >;

  categoriaGasto: string;

  setCategoriaGasto:
    Dispatch<
      SetStateAction<string>
    >;

  montoGasto: string;

  setMontoGasto:
    Dispatch<
      SetStateAction<string>
    >;

  monedaGasto:
    | "MXN"
    | "USD";

  setMonedaGasto:
    Dispatch<
      SetStateAction<
        "MXN" |
        "USD"
      >
    >;

  metodoPagoGasto:
    | "Efectivo"
    | "Transferencia"
    | "Tarjeta";

  setMetodoPagoGasto:
    Dispatch<
      SetStateAction<
        "Efectivo" |
        "Transferencia" |
        "Tarjeta"
      >
    >;

  notasGasto: string;

  setNotasGasto:
    Dispatch<
      SetStateAction<string>
    >;

  guardarGasto: () => void;

  gastosFiltrados: Gasto[];

  eliminarGasto:
    (
      id: number
    ) => void;

  gastosPorCategoria:
    Record<
      string,
      number
    >;

};

export default function Gastos({

  total,

  cantidad,

  fechaGasto,
  setFechaGasto,

  conceptoGasto,
  setConceptoGasto,

  categoriaGasto,
  setCategoriaGasto,

  montoGasto,
  setMontoGasto,

  monedaGasto,
  setMonedaGasto,

  metodoPagoGasto,
  setMetodoPagoGasto,

  notasGasto,
  setNotasGasto,

  guardarGasto,

  gastosFiltrados,

  eliminarGasto,

  gastosPorCategoria,

}: GastosProps) {

  const {
    permisos,
  } = useAuth();

  const puedeAnularGastos =
    permisos
      ?.anular_gastos ===
    true;

  const {
    language,
  } = useLanguage();

  const es =
    language === "es";

  const locale =
    es
      ? "es-MX"
      : "en-US";

  const [
    monedaPrincipal,
    setMonedaPrincipal,
  ] = useState<
    "MXN" |
    "USD"
  >(
    "MXN"
  );

  const [
    monedaSecundariaActiva,
    setMonedaSecundariaActiva,
  ] = useState(
    true
  );

  useEffect(
    () => {

      let activo =
        true;

      async function cargarConfiguracionMonedas() {

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "configuracion_finanzas"
            )
            .select(
              "clave, valor"
            )
            .in(
              "clave",
              [
                "moneda_principal",
                "moneda_secundaria_activa",
              ]
            );

        if (
          error ||
          !activo
        ) {

          return;

        }

        const valores =
          Object.fromEntries(
            (
              data ?? []
            ).map(
              (
                fila
              ) => [
                fila.clave,
                String(
                  fila.valor ??
                  ""
                ),
              ]
            )
          );

        setMonedaPrincipal(
          valores
            .moneda_principal ===
          "USD"

            ? "USD"

            : "MXN"
        );

        setMonedaSecundariaActiva(
          valores
            .moneda_secundaria_activa !==
          "false"
        );

      }

      void cargarConfiguracionMonedas();

      return () => {

        activo =
          false;

      };

    },
    []
  );

  const mostrarMXN =
    monedaPrincipal ===
      "MXN" ||
    monedaSecundariaActiva;

  const mostrarUSD =
    monedaPrincipal ===
      "USD" ||
    monedaSecundariaActiva;

  useEffect(
    () => {

      if (
        monedaGasto ===
          "MXN" &&
        !mostrarMXN
      ) {

        setMonedaGasto(
          monedaPrincipal
        );

        return;

      }

      if (
        monedaGasto ===
          "USD" &&
        !mostrarUSD
      ) {

        setMonedaGasto(
          monedaPrincipal
        );

      }

    },
    [
      monedaGasto,
      monedaPrincipal,
      mostrarMXN,
      mostrarUSD,
      setMonedaGasto,
    ]
  );

  /*
    total, cantidad y gastosPorCategoria
    todavía llegan desde Finanzas.tsx
    para mantener compatibilidad.

    Esta vista controla ahora
    su propio período.
  */

  void total;
  void cantidad;
  void gastosPorCategoria;

  const [
    periodoGastos,
    setPeriodoGastos,
  ] = useState<PeriodoGastos>(
    "semana"
  );

  const hoy =
    useMemo(
      () => {

        const fecha =
          new Date();

        fecha.setHours(
          12,
          0,
          0,
          0
        );

        return fecha;

      },
      []
    );

  const lunesSemana =
    useMemo(
      () => {

        const fecha =
          new Date(
            hoy
          );

        const diaSemana =
          fecha.getDay();

        const diferencia =
          diaSemana === 0
            ? -6
            : 1 - diaSemana;

        fecha.setDate(
          fecha.getDate() +
          diferencia
        );

        fecha.setHours(
          0,
          0,
          0,
          0
        );

        return fecha;

      },
      [
        hoy,
      ]
    );

  const sabadoSemana =
    useMemo(
      () => {

        const fecha =
          new Date(
            lunesSemana
          );

        fecha.setDate(
          fecha.getDate() +
          5
        );

        fecha.setHours(
          23,
          59,
          59,
          999
        );

        return fecha;

      },
      [
        lunesSemana,
      ]
    );

  const gastosPeriodo =
    useMemo(
      () => {

        if (
          periodoGastos ===
          "historico"
        ) {

          return gastosFiltrados;

        }

        return gastosFiltrados.filter(
          (
            gasto
          ) => {

            if (
              !gasto.fecha
            ) {

              return false;

            }

            const fechaGastoRegistro =
              new Date(
                `${gasto.fecha}T12:00:00`
              );

            if (
              Number.isNaN(
                fechaGastoRegistro
                  .getTime()
              )
            ) {

              return false;

            }

            if (
              periodoGastos ===
              "semana"
            ) {

              return (
                fechaGastoRegistro >=
                  lunesSemana &&
                fechaGastoRegistro <=
                  sabadoSemana
              );

            }

            if (
              periodoGastos ===
              "mes"
            ) {

              return (
                fechaGastoRegistro
                  .getFullYear() ===
                  hoy.getFullYear() &&
                fechaGastoRegistro
                  .getMonth() ===
                  hoy.getMonth()
              );

            }

            return (
              fechaGastoRegistro
                .getFullYear() ===
              hoy.getFullYear()
            );

          }
        );

      },
      [
        gastosFiltrados,
        periodoGastos,
        lunesSemana,
        sabadoSemana,
        hoy,
      ]
    );

  const totalGastosMXN =
    useMemo(
      () =>
        gastosPeriodo
          .filter(
            (
              gasto
            ) =>
              (
                gasto.moneda ||
                "MXN"
              ) ===
              "MXN"
          )
          .reduce(
            (
              acumulado,
              gasto
            ) =>
              acumulado +
              Number(
                gasto.monto ||
                0
              ),
            0
          ),
      [
        gastosPeriodo,
      ]
    );

  const totalGastosUSD =
    useMemo(
      () =>
        gastosPeriodo
          .filter(
            (
              gasto
            ) =>
              gasto.moneda ===
              "USD"
          )
          .reduce(
            (
              acumulado,
              gasto
            ) =>
              acumulado +
              Number(
                gasto.monto ||
                0
              ),
            0
          ),
      [
        gastosPeriodo,
      ]
    );

  const categorias =
    useMemo(
      () =>
        gastosPeriodo.reduce(
          (
            acumulado,
            gasto
          ) => {

            const categoria =
              gasto.categoria ||
              "Sin categoría";

            const moneda =
              gasto.moneda ||
              "MXN";

            if (
              !acumulado[
                categoria
              ]
            ) {

              acumulado[
                categoria
              ] = {
                MXN: 0,
                USD: 0,
              };

            }

            acumulado[
              categoria
            ][moneda] +=
              Number(
                gasto.monto ||
                0
              );

            return acumulado;

          },
          {} as Record<
            string,
            {
              MXN: number;
              USD: number;
            }
          >
        ),
      [
        gastosPeriodo,
      ]
    );

  function formatoMonto(
    monto: number
  ) {

    return monto.toLocaleString(
      locale,
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    );

  }

  function formatoFecha(
    fecha: string
  ) {

    if (
      !fecha
    ) {

      return "—";

    }

    const fechaLocal =
      new Date(
        `${fecha}T12:00:00`
      );

    return fechaLocal
      .toLocaleDateString(
        locale,
        {
          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",
        }
      );

  }

  const textoPeriodo =
    useMemo(
      () => {

        if (
          periodoGastos ===
          "semana"
        ) {

          return (
            `${
              lunesSemana
                .toLocaleDateString(
                  locale,
                  {
                    day:
                      "numeric",

                    month:
                      "short",

                    year:
                      "numeric",
                  }
                )
            } — ${
              sabadoSemana
                .toLocaleDateString(
                  locale,
                  {
                    day:
                      "numeric",

                    month:
                      "short",

                    year:
                      "numeric",
                  }
                )
            }`
          );

        }

        if (
          periodoGastos ===
          "mes"
        ) {

          return hoy
            .toLocaleDateString(
              locale,
              {
                month:
                  "long",

                year:
                  "numeric",
              }
            );

        }

        if (
          periodoGastos ===
          "anio"
        ) {

          return String(
            hoy.getFullYear()
          );

        }

        return es
          ? "Todos los registros"
          : "All records";

      },
      [
        periodoGastos,
        lunesSemana,
        sabadoSemana,
        hoy,
        es,
        locale,
      ]
    );

  function etiquetaCategoria(
    categoria: string
  ) {

    if (
      es
    ) {

      return categoria;

    }

    const traducciones:
      Record<
        string,
        string
      > = {

        "Material Dental":
          "Dental Supplies",

        Limpieza:
          "Cleaning",

        Laboratorio:
          "Laboratory",

        Especialistas:
          "Specialists",

        "Nómina":
          "Payroll",

        Servicios:
          "Services",

        Marketing:
          "Marketing",

        Otros:
          "Other",

        "Sin categoría":
          "Uncategorized",

      };

    return (
      traducciones[
        categoria
      ] ||
      categoria
    );

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      {/* =========================
          ENCABEZADO + PERÍODO
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-6
            bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
                mb-2
              "
            >

              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-white/10
                  text-white
                  border
                  border-white/20
                  px-3
                  py-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                "
              >

                {
                  es
                    ? "Control de egresos"
                    : "Expense control"
                }

              </span>

            </div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-white
              "
            >

              {
                es
                  ? "Gastos operativos"
                  : "Operating expenses"
              }

            </h2>

            <p
              className="
                mt-2
                text-sm
                text-white/80
                max-w-2xl
              "
            >

              {
                es

                  ? "Registra y consulta los gastos de operación de la clínica sin mezclar movimientos en pesos y dólares."

                  : "Record and review clinic operating expenses while keeping peso and dollar transactions separate."
              }

            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              self-start
              xl:self-center
              rounded-xl
              border
              border-white/20
              bg-white/10
              p-1
              shadow-sm
            "
          >

            <button
              type="button"
              onClick={() =>
                setPeriodoGastos(
                  "semana"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold
                transition-all

                ${
                  periodoGastos ===
                  "semana"

                    ? `
                        bg-white
                        text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/20
                      `

                    : `
                        text-white/75
                        hover:text-white
                      `
                }
              `}
            >

              {
                es
                  ? "Semana"
                  : "Week"
              }

            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodoGastos(
                  "mes"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold
                transition-all

                ${
                  periodoGastos ===
                  "mes"

                    ? `
                        bg-white
                        text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/20
                      `

                    : `
                        text-white/75
                        hover:text-white
                      `
                }
              `}
            >

              {
                es
                  ? "Mes"
                  : "Month"
              }

            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodoGastos(
                  "anio"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold
                transition-all

                ${
                  periodoGastos ===
                  "anio"

                    ? `
                        bg-white
                        text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/20
                      `

                    : `
                        text-white/75
                        hover:text-white
                      `
                }
              `}
            >

              {
                es
                  ? "Año"
                  : "Year"
              }

            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodoGastos(
                  "historico"
                )
              }
              className={`
                px-4
                py-2
                rounded-lg
                text-sm
                font-semibold
                transition-all

                ${
                  periodoGastos ===
                  "historico"

                    ? `
                        bg-white
                        text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/20
                      `

                    : `
                        text-white/75
                        hover:text-white
                      `
                }
              `}
            >

              {
                es
                  ? "Histórico"
                  : "History"
              }

            </button>

          </div>

        </div>

        <div
          className="
            h-1
            bg-[linear-gradient(90deg,#249884_0%,#63c8b2_58%,#d8bd72_100%)]
          "
        />

        <div
          className="
            px-6
            py-4
            bg-[var(--mint-bg-soft)]
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                font-bold
                mint-text-muted
                mb-1
              "
            >

              {
                es
                  ? "Período seleccionado"
                  : "Selected period"
              }

            </p>

            <p
              className="
                text-sm
                font-semibold
                mint-text-primary
              "
            >

              {
                textoPeriodo
              }

            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              mint-text-secondary
            "
          >

            <span
              className="
                inline-flex
                items-center
                justify-center
                min-w-[28px]
                h-7
                px-2
                rounded-lg
                bg-[var(--mint-bg-card)]
                border
                border-[var(--mint-border)]
                font-bold
                mint-text-primary
              "
            >

              {
                gastosPeriodo.length
              }

            </span>

            {
              gastosPeriodo.length ===
              1

                ? (
                  es
                    ? "movimiento"
                    : "transaction"
                )

                : (
                  es
                    ? "movimientos"
                    : "transactions"
                )
            }

          </div>

        </div>

      </div>

      {/* =========================
          KPIS
      ========================== */}

      <div
        className={`
          grid
          grid-cols-1

          ${
            mostrarMXN &&
            mostrarUSD

              ? "md:grid-cols-3"

              : "md:grid-cols-2"
          }

          gap-4
        `}
      >

        {
          mostrarMXN && (

            <div
              className="
                mint-card
                overflow-hidden
              "
            >

              <div
                className="
                  h-1
                  bg-[var(--mint-danger)]
                "
              />

              <div
                className="
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-[11px]
                        uppercase
                        tracking-[0.1em]
                        font-bold
                        mint-text-muted
                      "
                    >

                      {
                        es
                          ? "Gastos MXN"
                          : "MXN expenses"
                      }

                    </p>

                    <h3
                      className="
                        text-3xl
                        font-bold
                        mt-2
                        text-[var(--mint-danger)]
                      "
                    >

                      $
                      {
                        formatoMonto(
                          totalGastosMXN
                        )
                      }

                    </h3>

                    <p
                      className="
                        text-xs
                        mint-text-muted
                        mt-2
                      "
                    >

                      {
                        es
                          ? "Pesos mexicanos"
                          : "Mexican pesos"
                      }

                    </p>

                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      justify-center
                      min-w-[52px]
                      h-8
                      px-2
                      rounded-lg
                      bg-[var(--mint-danger-bg)]
                      text-[var(--mint-danger)]
                      text-xs
                      font-bold
                    "
                  >

                    MXN

                  </span>

                </div>

              </div>

            </div>

          )
        }

        {
          mostrarUSD && (

            <div
              className="
                mint-card
                overflow-hidden
              "
            >

              <div
                className="
                  h-1
                  bg-[var(--mint-accent)]
                "
              />

              <div
                className="
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-[11px]
                        uppercase
                        tracking-[0.1em]
                        font-bold
                        mint-text-muted
                      "
                    >

                      {
                        es
                          ? "Gastos USD"
                          : "USD expenses"
                      }

                    </p>

                    <h3
                      className="
                        text-3xl
                        font-bold
                        mt-2
                        text-[var(--mint-accent)]
                      "
                    >

                      $
                      {
                        formatoMonto(
                          totalGastosUSD
                        )
                      }

                    </h3>

                    <p
                      className="
                        text-xs
                        mint-text-muted
                        mt-2
                      "
                    >

                      {
                        es
                          ? "Dólares estadounidenses"
                          : "U.S. dollars"
                      }

                    </p>

                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      justify-center
                      min-w-[52px]
                      h-8
                      px-2
                      rounded-lg
                      bg-[var(--mint-warning-bg)]
                      text-[var(--mint-warning)]
                      text-xs
                      font-bold
                    "
                  >

                    USD

                  </span>

                </div>

              </div>

            </div>

          )
        }

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              h-1
              bg-[var(--mint-primary)]
            "
          />

          <div
            className="
              p-5
            "
          >

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.1em]
                font-bold
                mint-text-muted
              "
            >

              {
                es
                  ? "Registros"
                  : "Records"
              }

            </p>

            <h3
              className="
                text-3xl
                font-bold
                mt-2
                text-[var(--mint-primary)]
              "
            >

              {
                gastosPeriodo.length
              }

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {
                es
                  ? "Gastos en el período seleccionado"
                  : "Expenses in the selected period"
              }

            </p>

          </div>

        </div>

      </div>

            {/* =========================
          REGISTRAR GASTO
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                font-bold
                text-[var(--mint-primary)]
                mb-1
              "
            >

              {
                es
                  ? "Nuevo movimiento"
                  : "New transaction"
              }

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              {
                es
                  ? "Registrar gasto"
                  : "Record expense"
              }

            </h3>

          </div>

        </div>

        <div
          className="
            p-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-5
            "
          >

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >

                {
                  es
                    ? "Fecha"
                    : "Date"
                }

              </label>

              <input
                type="date"
                value={
                  fechaGasto
                }
                onChange={(e) =>
                  setFechaGasto(
                    e.target.value
                  )
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              />

            </div>

            <div
              className="
                xl:col-span-2
              "
            >

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >

                {
                  es
                    ? "Concepto"
                    : "Description"
                }

              </label>

              <input
                type="text"
                placeholder={
                  es
                    ? "Ej. Compra de anestesia"
                    : "E.g. Anesthetic purchase"
                }
                value={
                  conceptoGasto
                }
                onChange={(e) =>
                  setConceptoGasto(
                    e.target.value
                  )
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              />

            </div>

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >

                {
                  es
                    ? "Categoría"
                    : "Category"
                }

              </label>

              <select
                value={
                  categoriaGasto
                }
                onChange={(e) =>
                  setCategoriaGasto(
                    e.target.value
                  )
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              >

                <option value="">
                  {
                    es
                      ? "Seleccionar categoría"
                      : "Select category"
                  }
                </option>

                <option value="Material Dental">
                  {
                    es
                      ? "Material Dental"
                      : "Dental Supplies"
                  }
                </option>

                <option value="Limpieza">
                  {
                    es
                      ? "Limpieza"
                      : "Cleaning"
                  }
                </option>

                <option value="Laboratorio">
                  {
                    es
                      ? "Laboratorio"
                      : "Laboratory"
                  }
                </option>

                <option value="Especialistas">
                  {
                    es
                      ? "Especialistas"
                      : "Specialists"
                  }
                </option>

                <option value="Nómina">
                  {
                    es
                      ? "Nómina"
                      : "Payroll"
                  }
                </option>

                <option value="Servicios">
                  {
                    es
                      ? "Servicios"
                      : "Services"
                  }
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Otros">
                  {
                    es
                      ? "Otros"
                      : "Other"
                  }
                </option>

              </select>

            </div>

          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-5
              mt-5
            "
          >

            {/* MONTO + MONEDA */}

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >

                {
                  es
                    ? "Monto"
                    : "Amount"
                }

              </label>

              <div
                className="
                  flex
                  gap-3
                "
              >

                <div
                  className="
                    flex-1
                  "
                >

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      montoGasto
                    }
                    onChange={(e) =>
                      setMontoGasto(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                      p-3
                    "
                  />

                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    rounded-xl
                    border
                    border-[var(--mint-border)]
                    bg-[var(--mint-bg-soft)]
                    p-1
                    shrink-0
                  "
                >

                  {
                    mostrarMXN && (

                      <button
                        type="button"
                        onClick={() =>
                          setMonedaGasto(
                            "MXN"
                          )
                        }
                        className={`
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          font-bold
                          transition-all

                          ${
                            monedaGasto ===
                            "MXN"

                              ? `
                                  bg-[var(--mint-bg-card)]
                                  text-[var(--mint-primary)]
                                  shadow-sm
                                  ring-1
                                  ring-[var(--mint-border)]
                                `

                              : `
                                  mint-text-muted
                                  hover:text-[var(--mint-text-primary)]
                                `
                          }
                        `}
                      >

                        MXN

                      </button>

                    )
                  }

                  {
                    mostrarUSD && (

                      <button
                        type="button"
                        onClick={() =>
                          setMonedaGasto(
                            "USD"
                          )
                        }
                        className={`
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          font-bold
                          transition-all

                          ${
                            monedaGasto ===
                            "USD"

                              ? `
                                  bg-[var(--mint-bg-card)]
                                  text-[var(--mint-accent)]
                                  shadow-sm
                                  ring-1
                                  ring-[var(--mint-border)]
                                `

                              : `
                                  mint-text-muted
                                  hover:text-[var(--mint-text-primary)]
                                `
                          }
                        `}
                      >

                        USD

                      </button>

                    )
                  }

                </div>

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  mint-text-muted
                "
              >

                {
                  es
                    ? "El gasto se guardará en"
                    : "The expense will be saved in"
                }
                {" "}

                <strong
                  className="
                    mint-text-secondary
                  "
                >

                  {
                    monedaGasto
                  }

                </strong>
                .

              </p>

            </div>

            {/* MÉTODO DE PAGO */}

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >

                {
                  es
                    ? "Método de pago"
                    : "Payment method"
                }

              </label>

              <div
                className="
                  inline-flex
                  items-center
                  w-full
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-soft)]
                  p-1
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setMetodoPagoGasto(
                      "Efectivo"
                    )
                  }
                  className={`
                    flex-1
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      metodoPagoGasto ===
                      "Efectivo"

                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-primary)]
                            shadow-sm
                            ring-1
                            ring-[var(--mint-border)]
                          `

                        : `
                            mint-text-secondary
                            hover:text-[var(--mint-text-primary)]
                          `
                    }
                  `}
                >

                  {
                    es
                      ? "Efectivo"
                      : "Cash"
                  }

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMetodoPagoGasto(
                      "Transferencia"
                    )
                  }
                  className={`
                    flex-1
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      metodoPagoGasto ===
                      "Transferencia"

                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-info)]
                            shadow-sm
                            ring-1
                            ring-[var(--mint-border)]
                          `

                        : `
                            mint-text-secondary
                            hover:text-[var(--mint-text-primary)]
                          `
                    }
                  `}
                >

                  {
                    es
                      ? "Transferencia"
                      : "Transfer"
                  }

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMetodoPagoGasto(
                      "Tarjeta"
                    )
                  }
                  className={`
                    flex-1
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      metodoPagoGasto ===
                      "Tarjeta"

                        ? `
                            bg-[var(--mint-bg-card)]
                            text-[var(--mint-accent)]
                            shadow-sm
                            ring-1
                            ring-[var(--mint-border)]
                          `

                        : `
                            mint-text-secondary
                            hover:text-[var(--mint-text-primary)]
                          `
                    }
                  `}
                >

                  {
                    es
                      ? "Tarjeta"
                      : "Card"
                  }

                </button>

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  mint-text-muted
                "
              >

                {
                  es
                    ? "Indica de dónde salió el dinero."
                    : "Indicate how the expense was paid."
                }

              </p>

            </div>

            {/* NOTAS */}

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >

                {
                  es
                    ? "Notas"
                    : "Notes"
                }

              </label>

              <textarea
                placeholder={
                  es
                    ? "Información adicional del gasto..."
                    : "Additional expense information..."
                }
                value={
                  notasGasto
                }
                onChange={(e) =>
                  setNotasGasto(
                    e.target.value
                  )
                }
                className="
                  mint-input
                  w-full
                  p-3
                  min-h-[96px]
                  resize-y
                "
              />

            </div>

          </div>

          <div
            className="
              flex
              justify-end
              mt-5
              pt-5
              border-t
              border-[var(--mint-border)]
            "
          >

            <button
              type="button"
              onClick={
                guardarGasto
              }
              className="
                mint-btn
                mint-btn-primary
                justify-center
                px-6
                min-w-[170px]
              "
            >

              {
                es
                  ? "Guardar gasto"
                  : "Save expense"
              }

            </button>

          </div>

        </div>

      </div>

            {/* =========================
          HISTORIAL
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.12em]
                font-bold
                text-[var(--mint-primary)]
                mb-1
              "
            >

              {
                es
                  ? "Actividad"
                  : "Activity"
              }

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              {
                es
                  ? "Historial de gastos"
                  : "Expense history"
              }

            </h3>

          </div>

          <div
            className="
              inline-flex
              items-center
              px-3
              py-2
              rounded-lg
              bg-[var(--mint-bg-soft)]
              text-xs
              font-semibold
              mint-text-secondary
            "
          >

            {
              gastosPeriodo.length
            }
            {" "}
            {
              gastosPeriodo.length ===
              1

                ? (
                  es
                    ? "registro"
                    : "record"
                )

                : (
                  es
                    ? "registros"
                    : "records"
                )
            }

          </div>

        </div>

        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              mint-table
              w-full
              text-sm
            "
          >

            <thead
              className="
                mint-table-head
              "
            >

              <tr>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {
                    es
                      ? "Fecha"
                      : "Date"
                  }

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {
                    es
                      ? "Concepto"
                      : "Description"
                  }

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {
                    es
                      ? "Categoría"
                      : "Category"
                  }

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {
                    es
                      ? "Moneda"
                      : "Currency"
                  }

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {
                    es
                      ? "Método de pago"
                      : "Payment method"
                  }

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {
                    es
                      ? "Monto"
                      : "Amount"
                  }

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {
                    es
                      ? "Acción"
                      : "Action"
                  }

                </th>

              </tr>

            </thead>

            <tbody>

              {
                gastosPeriodo.length ===
                0

                  ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="
                          px-6
                          py-12
                          text-center
                          mint-text-muted
                        "
                      >

                        {
                          es
                            ? "No hay gastos registrados en este período."
                            : "There are no expenses recorded for this period."
                        }

                      </td>

                    </tr>

                  )

                  : gastosPeriodo.map(
                    (
                      gasto
                    ) => {

                      /*
                        IMPORTANTE:
                        La moneda de cada gasto histórico
                        se conserva exactamente como fue
                        registrada.

                        La configuración global solamente
                        controla qué monedas pueden usarse
                        para NUEVOS gastos y qué KPIs
                        principales se muestran.
                      */

                      const moneda =
                        gasto.moneda ||
                        "MXN";

                      const metodoPago =
                        gasto.metodo_pago ||
                        "Efectivo";

                      const etiquetaMetodo =
                        !es

                          ? (
                            metodoPago ===
                            "Efectivo"

                              ? "Cash"

                              : metodoPago ===
                                "Transferencia"

                                ? "Transfer"

                                : metodoPago ===
                                  "Tarjeta"

                                  ? "Card"

                                  : metodoPago
                          )

                          : metodoPago;

                      return (

                        <tr
                          key={
                            gasto.id
                          }
                          className="
                            mint-table-row
                          "
                        >

                          <td
                            className="
                              p-4
                              whitespace-nowrap
                              mint-text-secondary
                            "
                          >

                            {
                              formatoFecha(
                                gasto.fecha
                              )
                            }

                          </td>

                          <td
                            className="
                              p-4
                            "
                          >

                            <p
                              className="
                                font-semibold
                                mint-text-primary
                              "
                            >

                              {
                                gasto.concepto
                              }

                            </p>

                            {
                              gasto.notas

                              &&

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  mint-text-muted
                                  max-w-[320px]
                                  truncate
                                "
                              >

                                {
                                  gasto.notas
                                }

                              </p>
                            }

                          </td>

                          <td
                            className="
                              p-4
                            "
                          >

                            <span
                              className="
                                mint-badge
                                mint-badge-muted
                              "
                            >

                              {
                                etiquetaCategoria(
                                  gasto.categoria ||
                                  (
                                    es
                                      ? "Sin categoría"
                                      : "Uncategorized"
                                  )
                                )
                              }

                            </span>

                          </td>

                          <td
                            className="
                              p-4
                            "
                          >

                            <span
                              className={`
                                inline-flex
                                items-center
                                justify-center
                                min-w-[52px]
                                px-2.5
                                py-1
                                rounded-lg
                                text-xs
                                font-bold

                                ${
                                  moneda ===
                                  "USD"

                                    ? `
                                        bg-[var(--mint-warning-bg)]
                                        text-[var(--mint-warning)]
                                      `

                                    : `
                                        bg-[var(--mint-primary-soft)]
                                        text-[var(--mint-primary)]
                                      `
                                }
                              `}
                            >

                              {
                                moneda
                              }

                            </span>

                          </td>

                          <td
                            className="
                              p-4
                            "
                          >

                            <span
                              className="
                                inline-flex
                                items-center
                                px-2.5
                                py-1
                                rounded-lg
                                text-xs
                                font-semibold
                                bg-[var(--mint-bg-soft)]
                                border
                                border-[var(--mint-border)]
                                mint-text-secondary
                              "
                            >

                              {
                                etiquetaMetodo
                              }

                            </span>

                          </td>

                          <td
                            className="
                              p-4
                              text-right
                              whitespace-nowrap
                            "
                          >

                            <span
                              className="
                                font-bold
                                text-[var(--mint-danger)]
                              "
                            >

                              $
                              {
                                formatoMonto(
                                  Number(
                                    gasto.monto ||
                                    0
                                  )
                                )
                              }

                            </span>

                            <span
                              className="
                                ml-2
                                text-xs
                                mint-text-muted
                              "
                            >

                              {
                                moneda
                              }

                            </span>

                          </td>

                          <td
                            className="
                              p-4
                              text-right
                            "
                          >

                            {
                              puedeAnularGastos && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarGasto(
                                      gasto.id
                                    )
                                  }
                                  className="
                                    mint-btn
                                    mint-btn-danger
                                    mint-btn-sm
                                  "
                                >

                                  {
                                    es
                                      ? "Eliminar"
                                      : "Delete"
                                  }

                                </button>

                              )
                            }

                          </td>

                        </tr>

                      );

                    }
                  )
              }

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          RESUMEN POR CATEGORÍA
      ========================== */}

      <div
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-5
            border-b
            border-[var(--mint-border)]
          "
        >

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.12em]
              font-bold
              text-[var(--mint-primary)]
              mb-1
            "
          >

            {
              es
                ? "Distribución"
                : "Distribution"
            }

          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >

            {
              es
                ? "Gastos por categoría"
                : "Expenses by category"
            }

          </h3>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >

            {
              mostrarMXN &&
              mostrarUSD

                ? (
                  es

                    ? "Los importes en MXN y USD permanecen separados."

                    : "MXN and USD amounts remain separate."
                )

                : mostrarMXN

                  ? (
                    es

                      ? "Resumen de gastos activos en MXN."

                      : "Summary of active expenses in MXN."
                  )

                  : (
                    es

                      ? "Resumen de gastos activos en USD."

                      : "Summary of active expenses in USD."
                  )
            }

          </p>

        </div>

        <div
          className="
            p-6
          "
        >

          {
            Object.keys(
              categorias
            ).length ===
            0

              ? (

                <div
                  className="
                    py-8
                    text-center
                    mint-text-muted
                  "
                >

                  {
                    es
                      ? "No hay información por categoría para mostrar."
                      : "There is no category information to display."
                  }

                </div>

              )

              : (

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-3
                    gap-4
                  "
                >

                  {
                    Object.entries(
                      categorias
                    ).map(
                      (
                        [
                          categoria,
                          valores,
                        ]
                      ) => (

                        <div
                          key={
                            categoria
                          }
                          className="
                            rounded-2xl
                            border
                            border-[var(--mint-border)]
                            bg-[var(--mint-bg-soft)]
                            p-4
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              mb-4
                            "
                          >

                            <p
                              className="
                                font-semibold
                                mint-text-primary
                              "
                            >

                              {
                                etiquetaCategoria(
                                  categoria
                                )
                              }

                            </p>

                            <span
                              className="
                                w-2
                                h-2
                                rounded-full
                                bg-[var(--mint-primary)]
                              "
                            />

                          </div>

                          <div
                            className="
                              space-y-2
                            "
                          >

                            {
                              mostrarMXN && (

                                <div
                                  className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                  "
                                >

                                  <span
                                    className="
                                      text-xs
                                      mint-text-muted
                                    "
                                  >

                                    MXN

                                  </span>

                                  <span
                                    className="
                                      text-sm
                                      font-bold
                                      mint-text-primary
                                    "
                                  >

                                    $
                                    {
                                      formatoMonto(
                                        valores.MXN
                                      )
                                    }

                                  </span>

                                </div>

                              )
                            }

                            {
                              mostrarUSD && (

                                <div
                                  className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                  "
                                >

                                  <span
                                    className="
                                      text-xs
                                      mint-text-muted
                                    "
                                  >

                                    USD

                                  </span>

                                  <span
                                    className="
                                      text-sm
                                      font-bold
                                      text-[var(--mint-accent)]
                                    "
                                  >

                                    $
                                    {
                                      formatoMonto(
                                        valores.USD
                                      )
                                    }

                                  </span>

                                </div>

                              )
                            }

                          </div>

                        </div>

                      )
                    )
                  }

                </div>

              )
          }

        </div>

      </div>

    </div>

  );

}