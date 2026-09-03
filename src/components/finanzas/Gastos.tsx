import {
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
          (gasto) => {

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
            (gasto) =>
              (
                gasto.moneda ||
                "MXN"
              ) === "MXN"
          )
          .reduce(
            (
              acumulado,
              gasto
            ) =>
              acumulado +
              Number(
                gasto.monto || 0
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
            (gasto) =>
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
                gasto.monto || 0
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
                gasto.monto || 0
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
      "es-MX",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  }

  function formatoFecha(
    fecha: string
  ) {

    if (!fecha) {

      return "—";

    }

    const fechaLocal =
      new Date(
        `${fecha}T12:00:00`
      );

    return fechaLocal
      .toLocaleDateString(
        "es-MX",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
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
            `${lunesSemana.toLocaleDateString(
              "es-MX",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )} — ${
              sabadoSemana.toLocaleDateString(
                "es-MX",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )
            }`
          );

        }

        if (
          periodoGastos ===
          "mes"
        ) {

          return hoy.toLocaleDateString(
            "es-MX",
            {
              month: "long",
              year: "numeric",
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

        return "Todos los registros";

      },
      [
        periodoGastos,
        lunesSemana,
        sabadoSemana,
        hoy,
      ]
    );

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
            border-b
            border-[var(--mint-border)]
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
                  bg-[var(--mint-danger-bg)]
                  text-[var(--mint-danger)]
                  border
                  border-[var(--mint-danger-border)]
                  px-3
                  py-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                "
              >

                Control de egresos

              </span>

            </div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                mint-text-primary
              "
            >

              Gastos operativos

            </h2>

            <p
              className="
                mt-2
                text-sm
                mint-text-secondary
                max-w-2xl
              "
            >

              Registra y consulta los gastos de
              operación de la clínica sin mezclar
              movimientos en pesos y dólares.

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
              border-[var(--mint-border)]
              bg-[var(--mint-bg-soft)]
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

              Semana

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

              Mes

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

              Año

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

              Histórico

            </button>

          </div>

        </div>

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

              Período seleccionado

            </p>

            <p
              className="
                text-sm
                font-semibold
                mint-text-primary
              "
            >

              {textoPeriodo}

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

                ? "movimiento"

                : "movimientos"
            }

          </div>

        </div>

      </div>

      {/* =========================
          KPIS
      ========================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

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

                  Gastos MXN

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

                  Pesos mexicanos

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

                  Gastos USD

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

                  Dólares estadounidenses

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

              Registros

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

              Gastos en el período seleccionado

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

              Nuevo movimiento

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              Registrar gasto

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

                Fecha

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

                Concepto

              </label>

              <input
                type="text"
                placeholder="Ej. Compra de anestesia"
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

                Categoría

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
                  Seleccionar categoría
                </option>

                <option value="Material Dental">
                  Material Dental
                </option>

                <option value="Limpieza">
                  Limpieza
                </option>

                <option value="Laboratorio">
                  Laboratorio
                </option>

                <option value="Especialistas">
                  Especialistas
                </option>

                <option value="Nómina">
                  Nómina
                </option>

                <option value="Servicios">
                  Servicios
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Otros">
                  Otros
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

                Monto

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

                </div>

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  mint-text-muted
                "
              >

                El gasto se guardará en
                {" "}
                <strong
                  className="
                    mint-text-secondary
                  "
                >

                  {monedaGasto}

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

                Método de pago

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

                  Efectivo

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

                  Transferencia

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

                  Tarjeta

                </button>

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  mint-text-muted
                "
              >

                Indica de dónde salió el dinero.

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

                Notas

              </label>

              <textarea
                placeholder="Información adicional del gasto..."
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

              Guardar gasto

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

              Actividad

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              Historial de gastos

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

                ? "registro"

                : "registros"
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

                  Fecha

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  Concepto

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  Categoría

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  Moneda

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  Método de pago

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  Monto

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  Acción

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

                        No hay gastos registrados
                        en este período.

                      </td>

                    </tr>

                  )

                  : gastosPeriodo.map(
                    (gasto) => {

                      const moneda =
                        gasto.moneda ||
                        "MXN";

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
                                gasto.categoria
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

                              {moneda}

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
                                gasto.metodo_pago ||
                                "Efectivo"
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

                              {moneda}

                            </span>

                          </td>

                          <td
                            className="
                              p-4
                              text-right
                            "
                          >

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

                              Eliminar

                            </button>

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

            Distribución

          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >

            Gastos por categoría

          </h3>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >

            Los importes en MXN y USD
            permanecen separados.

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
            ).length === 0

              ? (

                <div
                  className="
                    py-8
                    text-center
                    mint-text-muted
                  "
                >

                  No hay información por
                  categoría para mostrar.

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

                              {categoria}

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