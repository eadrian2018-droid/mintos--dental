import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supabase,
} from "../../lib/supabase";

import {
  useLanguage,
} from "../../context/LanguageContext";

type Cobro = {
  id: number;
  paciente_id: number;
  tratamiento_id: number;
  fecha: string;
  metodo_pago: string;
  moneda: string;
  monto_original: number;
  tipo_cambio: number | null;
  monto_mxn: number;
  comision_porcentaje: number;
  iva_comision_porcentaje: number;
  comision_base: number;
  iva_comision: number;
  comision_banco: number;
  neto_recibido: number;
};

type Paciente = {
  id: number;
  nombre: string;
};

type Tratamiento = {
  id: number;
  tratamiento: string;
};

type PeriodoCobros =
  | "semana"
  | "mes"
  | "anio"
  | "historico";

type DiaSemanaFiltro = {
  clave: string;
  etiqueta: string;
  fecha: Date;
};

export default function Cobros() {

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
    cobros,
    setCobros,
  ] = useState<Cobro[]>([]);

  const [
    pacientes,
    setPacientes,
  ] = useState<Paciente[]>([]);

  const [
    tratamientos,
    setTratamientos,
  ] = useState<Tratamiento[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    monedaPrincipal,
    setMonedaPrincipal,
  ] = useState<"MXN" | "USD">("MXN");

  const [
    monedaSecundariaActiva,
    setMonedaSecundariaActiva,
  ] = useState(true);

  const mostrarMXN =
    monedaPrincipal === "MXN" ||
    monedaSecundariaActiva;

  const mostrarUSD =
    monedaPrincipal === "USD" ||
    monedaSecundariaActiva;

  const [
    periodo,
    setPeriodo,
  ] = useState<PeriodoCobros>(
    "semana"
  );

  const [
    diaSeleccionado,
    setDiaSeleccionado,
  ] = useState<string>(
    "todos"
  );

  useEffect(() => {

    cargarDatos();

  }, []);

  useEffect(() => {

    setDiaSeleccionado(
      "todos"
    );

  }, [
    periodo,
  ]);

  async function cargarDatos() {

    setCargando(true);

    const [
      resultadoCobros,
      resultadoPacientes,
      resultadoTratamientos,
      resultadoConfiguracionFinanzas,
    ] = await Promise.all([

      supabase
        .from("pagos")
        .select("*")
        .order(
          "fecha",
          {
            ascending: false,
          }
        ),

      supabase
        .from("pacientes")
        .select(
          "id, nombre"
        ),

      supabase
        .from("tratamientos")
        .select(
          "id, tratamiento"
        ),

      supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in(
          "clave",
          [
            "moneda_principal",
            "moneda_secundaria_activa",
          ]
        ),

    ]);

    if (
      resultadoCobros.error
    ) {

      console.error(
        "Error cargando cobros:",
        resultadoCobros.error
      );

    }

    if (
      resultadoPacientes.error
    ) {

      console.error(
        "Error cargando pacientes:",
        resultadoPacientes.error
      );

    }

    if (
      resultadoTratamientos.error
    ) {

      console.error(
        "Error cargando tratamientos:",
        resultadoTratamientos.error
      );

    }

    setCobros(
      resultadoCobros.data ||
      []
    );

    setPacientes(
      resultadoPacientes.data ||
      []
    );

    setTratamientos(
      resultadoTratamientos.data ||
      []
    );

    if (
      resultadoConfiguracionFinanzas.error
    ) {
      console.error(
        "Error cargando configuración financiera:",
        resultadoConfiguracionFinanzas.error
      );
    }

    const valoresConfiguracion =
      Object.fromEntries(
        (resultadoConfiguracionFinanzas.data ?? []).map(
          (fila) => [
            fila.clave,
            String(fila.valor ?? ""),
          ]
        )
      );

    setMonedaPrincipal(
      valoresConfiguracion.moneda_principal === "USD"
        ? "USD"
        : "MXN"
    );

    setMonedaSecundariaActiva(
      valoresConfiguracion.moneda_secundaria_activa !== "false"
    );

    setCargando(false);

  }

  function obtenerInicioDia(
    fecha: Date
  ) {

    const resultado =
      new Date(
        fecha
      );

    resultado.setHours(
      0,
      0,
      0,
      0
    );

    return resultado;

  }

  function obtenerFinDia(
    fecha: Date
  ) {

    const resultado =
      new Date(
        fecha
      );

    resultado.setHours(
      23,
      59,
      59,
      999
    );

    return resultado;

  }

  function obtenerInicioSemana(
    fecha: Date
  ) {

    const resultado =
      obtenerInicioDia(
        fecha
      );

    const dia =
      resultado.getDay();

    const diferencia =
      dia === 0
        ? -6
        : 1 - dia;

    resultado.setDate(
      resultado.getDate() +
      diferencia
    );

    return resultado;

  }

  const hoy =
    new Date();

  const lunesSemana =
    useMemo(
      () =>
        obtenerInicioSemana(
          hoy
        ),
      []
    );

  const sabadoSemana =
    useMemo(
      () => {

        const fecha =
          new Date(
            lunesSemana
          );

        fecha.setDate(
          lunesSemana.getDate() +
          5
        );

        return obtenerFinDia(
          fecha
        );

      },
      [
        lunesSemana,
      ]
    );

  const diasSemana =
    useMemo<DiaSemanaFiltro[]>(
      () => {

        const nombres =
          es
            ? [
                "Lun",
                "Mar",
                "Mié",
                "Jue",
                "Vie",
                "Sáb",
              ]
            : [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ];

        return nombres.map(
          (
            etiqueta,
            indice
          ) => {

            const fecha =
              new Date(
                lunesSemana
              );

            fecha.setDate(
              lunesSemana.getDate() +
              indice
            );

            const clave =
              [
                fecha.getFullYear(),
                String(
                  fecha.getMonth() +
                  1
                ).padStart(
                  2,
                  "0"
                ),
                String(
                  fecha.getDate()
                ).padStart(
                  2,
                  "0"
                ),
              ].join(
                "-"
              );

            return {
              clave,
              etiqueta,
              fecha,
            };

          }
        );

      },
      [
        lunesSemana,
        es,
      ]
    );

  const cobrosFiltradosPeriodo =
    useMemo(
      () => {

        if (
          periodo ===
          "historico"
        ) {

          return cobros;

        }

        return cobros.filter(
          (
            cobro
          ) => {

            const fechaCobro =
              new Date(
                cobro.fecha
              );

            if (
              periodo ===
              "semana"
            ) {

              return (
                fechaCobro >=
                  lunesSemana &&
                fechaCobro <=
                  sabadoSemana
              );

            }

            if (
              periodo ===
              "mes"
            ) {

              return (
                fechaCobro.getFullYear() ===
                  hoy.getFullYear() &&
                fechaCobro.getMonth() ===
                  hoy.getMonth()
              );

            }

            if (
              periodo ===
              "anio"
            ) {

              return (
                fechaCobro.getFullYear() ===
                hoy.getFullYear()
              );

            }

            return true;

          }
        );

      },
      [
        cobros,
        periodo,
        lunesSemana,
        sabadoSemana,
      ]
    );

  const cobrosTabla =
    useMemo(
      () => {

        if (
          periodo !==
            "semana" ||
          diaSeleccionado ===
            "todos"
        ) {

          return cobrosFiltradosPeriodo;

        }

        const dia =
          diasSemana.find(
            (
              item
            ) =>
              item.clave ===
              diaSeleccionado
          );

        if (
          !dia
        ) {

          return cobrosFiltradosPeriodo;

        }

        const inicioDia =
          obtenerInicioDia(
            dia.fecha
          );

        const finDia =
          obtenerFinDia(
            dia.fecha
          );

        return cobrosFiltradosPeriodo.filter(
          (
            cobro
          ) => {

            const fechaCobro =
              new Date(
                cobro.fecha
              );

            return (
              fechaCobro >=
                inicioDia &&
              fechaCobro <=
                finDia
            );

          }
        );

      },
      [
        cobrosFiltradosPeriodo,
        periodo,
        diaSeleccionado,
        diasSemana,
      ]
    );


  /*
  ========================================
  TOTALES DEL PERÍODO
  ========================================
  */

  const totalCobradoMXN =
    useMemo(
      () =>
        cobrosFiltradosPeriodo
          .filter(
            (
              cobro
            ) =>
              cobro.moneda ===
                "MXN" &&
              cobro.metodo_pago !==
                "Tarjeta"
          )
          .reduce(
            (
              total,
              cobro
            ) =>
              total +
              Number(
                cobro.monto_original ||
                0
              ),
            0
          ),
      [
        cobrosFiltradosPeriodo,
      ]
    );

  const totalCobradoUSD =
    useMemo(
      () =>
        cobrosFiltradosPeriodo
          .filter(
            (
              cobro
            ) =>
              cobro.moneda ===
                "USD" &&
              cobro.metodo_pago !==
                "Tarjeta"
          )
          .reduce(
            (
              total,
              cobro
            ) =>
              total +
              Number(
                cobro.monto_original ||
                0
              ),
            0
          ),
      [
        cobrosFiltradosPeriodo,
      ]
    );

  const totalCobradoTarjeta =
    useMemo(
      () =>
        cobrosFiltradosPeriodo
          .filter(
            (
              cobro
            ) =>
              cobro.metodo_pago ===
              "Tarjeta"
          )
          .reduce(
            (
              total,
              cobro
            ) =>
              total +
              Number(
                cobro.neto_recibido ||
                0
              ),
            0
          ),
      [
        cobrosFiltradosPeriodo,
      ]
    );

  function obtenerPaciente(
    pacienteId: number
  ) {

    return (
      pacientes.find(
        (
          paciente
        ) =>
          paciente.id ===
          pacienteId
      )?.nombre ||
      `${es ? "Paciente" : "Patient"} #${pacienteId}`
    );

  }

  function obtenerTratamiento(
    tratamientoId: number
  ) {

    return (
      tratamientos.find(
        (
          tratamiento
        ) =>
          tratamiento.id ===
          tratamientoId
      )?.tratamiento ||
      `${es ? "Tratamiento" : "Treatment"} #${tratamientoId}`
    );

  }

  function formatearDinero(
    valor: number
  ) {

    return Number(
      valor ||
      0
    ).toLocaleString(
      locale,
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    );

  }

  function obtenerDescripcionPeriodo() {

    if (
      periodo ===
      "semana"
    ) {

      return (
        `${lunesSemana.toLocaleDateString(
          locale,
          {
            day: "numeric",
            month: "short",
          }
        )} — ${sabadoSemana.toLocaleDateString(
          locale,
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )}`
      );

    }

    if (
      periodo ===
      "mes"
    ) {

      return hoy.toLocaleDateString(
        locale,
        {
          month: "long",
          year: "numeric",
        }
      );

    }

    if (
      periodo ===
      "anio"
    ) {

      return String(
        hoy.getFullYear()
      );

    }

    return es ? "Todos los registros" : "All records";

  }

  return (

    <div
      className="
        space-y-8
      "
    >

      {/* CONTROL DEL PERÍODO */}

      <section
        className="
          mint-card
          overflow-hidden
          border
          border-[var(--mint-border-teal)]
          shadow-[0_12px_30px_rgba(15,42,65,0.06)]
        "
      >

        <div
          style={{
            background:
              "linear-gradient(120deg, #102f4f 0%, #1b4f68 55%, #0b8f80 100%)",
          }}
          className="
            px-6
            py-5
            relative
            overflow-hidden
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-5
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#7ee3cf]
                mb-1
              "
            >
              {es ? "Período de cobros" : "Collections period"}
            </p>

            <h2
              className="
                text-xl
                font-bold
                text-white
              "
            >
              {
                obtenerDescripcionPeriodo()
              }
            </h2>

            <p
              className="
                text-sm
                !text-white/80
                mt-1
              "
            >
              {es
                ? "Los indicadores y transacciones corresponden al período seleccionado."
                : "Indicators and transactions correspond to the selected period."}
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
              shadow-[0_5px_14px_rgba(15,42,65,0.07)]
            "
          >

            <button
              type="button"
              onClick={() =>
                setPeriodo(
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
                  periodo ===
                  "semana"

                    ? `
                        !bg-white
                        !text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/30
                      `

                    : `
                        !text-white/80
                        hover:!text-white
                        hover:bg-white/10
                      `
                }
              `}
            >
              {es ? "Semana" : "Week"}
            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodo(
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
                  periodo ===
                  "mes"

                    ? `
                        !bg-white
                        !text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/30
                      `

                    : `
                        !text-white/80
                        hover:!text-white
                        hover:bg-white/10
                      `
                }
              `}
            >
              {es ? "Mes" : "Month"}
            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodo(
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
                  periodo ===
                  "anio"

                    ? `
                        !bg-white
                        !text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/30
                      `

                    : `
                        !text-white/80
                        hover:!text-white
                        hover:bg-white/10
                      `
                }
              `}
            >
              {es ? "Año" : "Year"}
            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodo(
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
                  periodo ===
                  "historico"

                    ? `
                        !bg-white
                        !text-[#102f4f]
                        shadow-sm
                        ring-1
                        ring-white/30
                      `

                    : `
                        !text-white/80
                        hover:!text-white
                        hover:bg-white/10
                      `
                }
              `}
            >
              {es ? "Histórico" : "History"}
            </button>

          </div>

        </div>

      </section>


      {/* INDICADORES */}

      <section>

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
            mb-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                mint-text-muted
                mb-1
              "
            >
              {es ? "Operación" : "Operations"}
            </p>

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {es ? "Resumen de cobros" : "Collections summary"}
            </h2>

          </div>

          <p
            className="
              hidden
              md:block
              text-xs
              mint-text-muted
            "
          >
            {
              cobrosFiltradosPeriodo
                .length
            }{" "}
            {es ? "transacciones" : "transactions"}
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-4
          "
        >

          {/* TOTAL MXN */}

          {mostrarMXN && (
          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[160px]
              border
              border-[var(--mint-border-soft)]
              shadow-[0_10px_24px_rgba(15,42,65,0.06)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-[0_16px_32px_rgba(15,42,65,0.09)]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[4px]
                bg-[var(--mint-success)]
              "
            />

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
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Total cobrado MXN" : "Total collected MXN"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Pagos recibidos en pesos" : "Payments received in pesos"}
                </p>

              </div>

              <div
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  border
                  border-white/70
                  shadow-sm
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-success-bg)]
                  text-[var(--mint-success)]
                  font-bold
                "
              >
                $
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[var(--mint-success)]
                "
              >
                $
                {
                  formatearDinero(
                    totalCobradoMXN
                  )
                }
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                "
              >
                MXN
              </p>

            </div>

          </div>
          )}



          {/* TOTAL USD */}

          {mostrarUSD && (
          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[160px]
              border
              border-[var(--mint-border-soft)]
              shadow-[0_10px_24px_rgba(15,42,65,0.06)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-[0_16px_32px_rgba(15,42,65,0.09)]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[4px]
                bg-[var(--mint-info)]
              "
            />

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
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Total cobrado USD" : "Total collected USD"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Pagos recibidos en dólares" : "Payments received in dollars"}
                </p>

              </div>

              <div
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  border
                  border-white/70
                  shadow-sm
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-info-bg)]
                  text-[var(--mint-info)]
                  font-bold
                "
              >
                $
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[var(--mint-info)]
                "
              >
                $
                {
                  formatearDinero(
                    totalCobradoUSD
                  )
                }
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                "
              >
                USD
              </p>

            </div>

          </div>
          )}



          {/* TOTAL TARJETA */}

          {mostrarMXN && (
          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[160px]
              border
              border-[var(--mint-border-soft)]
              shadow-[0_10px_24px_rgba(15,42,65,0.06)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-[0_16px_32px_rgba(15,42,65,0.09)]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[4px]
                bg-[var(--mint-primary)]
              "
            />

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
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  {es ? "Total cobrado con tarjeta" : "Total collected by card"}
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es ? "Depósito recibido después de comisiones" : "Deposit received after fees"}
                </p>

              </div>

              <div
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  border
                  border-white/70
                  shadow-sm
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  font-bold
                "
              >
                $
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[var(--mint-primary)]
                "
              >
                $
                {
                  formatearDinero(
                    totalCobradoTarjeta
                  )
                }
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                "
              >
                {es ? "MXN depositados" : "MXN deposited"}
              </p>

            </div>

          </div>
          )}


        </div>

      </section>


      {/* HISTORIAL */}

      <section>

        <div
          className="
            mint-card
            overflow-hidden
            border
            border-[var(--mint-border-teal)]
            shadow-[0_14px_34px_rgba(15,42,65,0.065)]
          "
        >

          <div
            className="
              px-6
              py-5
              bg-gradient-to-r
              from-[var(--mint-surface)]
              to-[var(--mint-surface-teal)]
              border-b
              border-[var(--mint-border)]
              flex
              flex-col
              xl:flex-row
              xl:items-center
              xl:justify-between
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  mint-text-muted
                  mb-1
                "
              >
                {es ? "Transacciones" : "Transactions"}
              </p>

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                "
              >
                {es ? "Historial de cobros" : "Collections history"}
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                {es
                  ? "Cada registro corresponde a una transacción individual."
                  : "Each record represents an individual transaction."}
              </p>

            </div>

            <button
              type="button"
              onClick={
                cargarDatos
              }
              disabled={
                cargando
              }
              className="
                inline-flex
                items-center
                justify-center
                self-start
                xl:self-center
                rounded-xl
                border
                border-[var(--mint-border-teal)]
                bg-white
                px-4
                py-2
                text-sm
                font-semibold
                mint-text-primary
                shadow-[0_4px_12px_rgba(15,42,65,0.06)]
                transition-all
                hover:bg-[var(--mint-surface-teal)]
                hover:border-[var(--mint-teal-soft)]
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {
                cargando
                  ? (es ? "Actualizando..." : "Refreshing...")
                  : (es ? "Actualizar" : "Refresh")
              }
            </button>

          </div>


          {/* FILTRO DIARIO */}

          {
            periodo ===
            "semana"

            &&

            <div
              className="
                px-6
                py-4
                bg-[var(--mint-surface-teal)]
                border-b
                border-[var(--mint-border)]
                overflow-x-auto
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  min-w-max
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setDiaSeleccionado(
                      "todos"
                    )
                  }
                  className={`
                    px-3.5
                    py-2
                    rounded-xl
                    text-xs
                    font-semibold
                    transition-all

                    ${
                      diaSeleccionado ===
                      "todos"

                        ? `
                            bg-[var(--mint-primary)]
                            text-white
                            shadow-sm
                          `

                        : `
                            bg-[var(--mint-bg-card)]
                            border
                            border-[var(--mint-border)]
                            mint-text-secondary
                            hover:border-[var(--mint-border-strong)]
                          `
                    }
                  `}
                >
                  {es ? "Todos" : "All"}
                </button>

                {
                  diasSemana.map(
                    (
                      dia
                    ) => (

                      <button
                        key={
                          dia.clave
                        }
                        type="button"
                        onClick={() =>
                          setDiaSeleccionado(
                            dia.clave
                          )
                        }
                        className={`
                          px-3.5
                          py-2
                          rounded-xl
                          text-xs
                          font-semibold
                          transition-all

                          ${
                            diaSeleccionado ===
                            dia.clave

                              ? `
                                  bg-[var(--mint-primary)]
                                  text-white
                                  shadow-sm
                                `

                              : `
                                  bg-[var(--mint-bg-card)]
                                  border
                                  border-[var(--mint-border)]
                                  mint-text-secondary
                                  hover:border-[var(--mint-border-strong)]
                                `
                          }
                        `}
                      >

                        {
                          dia.etiqueta
                        }

                        {" "}

                        {
                          dia.fecha.getDate()
                        }

                      </button>

                    )
                  )
                }

              </div>

            </div>

          }


          {/* TABLA */}

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[1200px]
                text-sm
              "
            >

              <thead>

                <tr
                  className="
                    bg-[var(--mint-surface-soft)]
                    border-b
                    border-[var(--mint-border)]
                  "
                >

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    {es ? "Fecha" : "Date"}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    {es ? "Paciente" : "Patient"}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    {es ? "Tratamiento" : "Treatment"}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    {es ? "Método" : "Method"}
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold mint-text-secondary">
                    {es ? "Moneda" : "Currency"}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    {es ? "Monto" : "Amount"}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    {es ? "Tipo cambio" : "Exchange rate"}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    {es ? "Equivalente MXN" : "MXN equivalent"}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    {es ? "Comisión" : "Fee"}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    {es ? "Neto" : "Net"}
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  cargando

                    ? (

                      <tr>

                        <td
                          colSpan={10}
                          className="
                            text-center
                            p-12
                            mint-text-muted
                          "
                        >
                          {es ? "Cargando cobros..." : "Loading collections..."}
                        </td>

                      </tr>

                    )

                    : cobrosTabla.length ===
                      0

                      ? (

                        <tr>

                          <td
                            colSpan={10}
                            className="
                              text-center
                              p-12
                            "
                          >

                            <p
                              className="
                                font-semibold
                                mint-text-primary
                              "
                            >
                              {es ? "No hay cobros registrados" : "No collections recorded"}
                            </p>

                            <p
                              className="
                                text-sm
                                mint-text-muted
                                mt-1
                              "
                            >
                              {es
                                ? "No existen transacciones para este filtro."
                                : "There are no transactions for this filter."}
                            </p>

                          </td>

                        </tr>

                      )

                      : (

                        cobrosTabla.map(
                          (
                            cobro
                          ) => (

                            <tr
                              key={
                                cobro.id
                              }
                              className="
                                border-b
                                border-[var(--mint-border-soft)]
                                transition-colors
                                hover:bg-[var(--mint-surface-teal)]
                              "
                            >

                              <td
                                className="
                                  px-5
                                  py-4
                                  whitespace-nowrap
                                  mint-text-secondary
                                "
                              >

                                {
                                  new Date(
                                    cobro.fecha
                                  ).toLocaleString(
                                    locale,
                                    {
                                      dateStyle:
                                        "short",

                                      timeStyle:
                                        "short",
                                    }
                                  )
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  font-semibold
                                  mint-text-primary
                                "
                              >

                                {
                                  obtenerPaciente(
                                    cobro.paciente_id
                                  )
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  mint-text-secondary
                                "
                              >

                                {
                                  obtenerTratamiento(
                                    cobro.tratamiento_id
                                  )
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  mint-text-secondary
                                "
                              >

                                {
                                  cobro.metodo_pago
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-center
                                "
                              >

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    min-w-[48px]
                                    rounded-md
                                    bg-[var(--mint-bg-soft)]
                                    border
                                    border-[var(--mint-border)]
                                    px-2
                                    py-1
                                    text-[11px]
                                    font-bold
                                    mint-text-secondary
                                  "
                                >
                                  {
                                    cobro.moneda
                                  }
                                </span>

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  font-semibold
                                  mint-text-primary
                                "
                              >

                                $
                                {
                                  formatearDinero(
                                    cobro.monto_original
                                  )
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  mint-text-secondary
                                "
                              >

                                {
                                  cobro.moneda ===
                                  "USD"

                                    ? `$${formatearDinero(
                                        Number(
                                          cobro.tipo_cambio ||
                                          0
                                        )
                                      )}`

                                    : "-"
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  font-medium
                                  mint-text-primary
                                "
                              >

                                $
                                {
                                  formatearDinero(
                                    cobro.monto_mxn
                                  )
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  text-[var(--mint-danger)]
                                  font-semibold
                                "
                              >

                                $
                                {
                                  formatearDinero(
                                    cobro.comision_banco
                                  )
                                }

                              </td>

                              <td
                                className="
                                  px-5
                                  py-4
                                  text-right
                                  text-[var(--mint-success)]
                                  font-bold
                                "
                              >

                                $
                                {
                                  formatearDinero(
                                    cobro.neto_recibido
                                  )
                                }

                              </td>

                            </tr>

                          )
                        )

                      )
                }

              </tbody>

            </table>

          </div>


          {/* PIE */}

          {
            !cargando

            &&

            <div
              className="
                px-6
                py-4
                bg-[var(--mint-surface-soft)]
                border-t
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >
                {es ? "Mostrando" : "Showing"}{" "}
                {
                  cobrosTabla.length
                }{" "}
                {es ? "de" : "of"}{" "}
                {
                  cobrosFiltradosPeriodo
                    .length
                }{" "}
                {es ? "transacciones del período" : "transactions for the period"}
              </p>

            </div>

          }

        </div>

      </section>

    </div>

  );

}