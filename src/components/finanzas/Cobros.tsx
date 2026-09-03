import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supabase,
} from "../../lib/supabase";

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

        const nombres = [
          "Lun",
          "Mar",
          "Mié",
          "Jue",
          "Vie",
          "Sáb",
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
      `Paciente #${pacienteId}`
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
      `Tratamiento #${tratamientoId}`
    );

  }

  function formatearDinero(
    valor: number
  ) {

    return Number(
      valor ||
      0
    ).toLocaleString(
      "es-MX",
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
          "es-MX",
          {
            day: "numeric",
            month: "short",
          }
        )} — ${sabadoSemana.toLocaleDateString(
          "es-MX",
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
        "es-MX",
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

    return "Todos los registros";

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
        "
      >

        <div
          className="
            px-6
            py-5
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
                mint-text-muted
                mb-1
              "
            >
              Período de cobros
            </p>

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {
                obtenerDescripcionPeriodo()
              }
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Los indicadores y
              transacciones corresponden
              al período seleccionado.
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
              Operación
            </p>

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Resumen de cobros
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
            transacciones
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          "
        >

          {/* TOTAL MXN */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[160px]
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
                h-[3px]
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
                  Total cobrado MXN
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Pagos recibidos en pesos
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  shrink-0
                  rounded-xl
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


          {/* TOTAL USD */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[160px]
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
                h-[3px]
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
                  Total cobrado USD
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Pagos recibidos en dólares
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  shrink-0
                  rounded-xl
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


          {/* TOTAL TARJETA */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[160px]
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
                h-[3px]
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
                  Total cobrado con tarjeta
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Depósito recibido después de comisiones
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  shrink-0
                  rounded-xl
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
                MXN depositados
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* HISTORIAL */}

      <section>

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
                Transacciones
              </p>

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                "
              >
                Historial de cobros
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                Cada registro corresponde
                a una transacción individual.
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
                rounded-lg
                border
                border-[var(--mint-border-strong)]
                bg-[var(--mint-bg-card)]
                px-4
                py-2
                text-sm
                font-semibold
                mint-text-primary
                shadow-sm
                transition-all
                hover:bg-[var(--mint-bg-soft)]
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {
                cargando
                  ? "Actualizando..."
                  : "Actualizar"
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
                bg-[var(--mint-bg-soft)]
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
                    px-3
                    py-2
                    rounded-lg
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
                  Todos
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
                          px-3
                          py-2
                          rounded-lg
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
                    bg-[var(--mint-bg-soft)]
                    border-b
                    border-[var(--mint-border)]
                  "
                >

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    Fecha
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    Paciente
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    Tratamiento
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold mint-text-secondary">
                    Método
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold mint-text-secondary">
                    Moneda
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    Monto
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    Tipo cambio
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    Equivalente MXN
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    Comisión
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold mint-text-secondary">
                    Neto
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
                          Cargando cobros...
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
                              No hay cobros
                              registrados
                            </p>

                            <p
                              className="
                                text-sm
                                mint-text-muted
                                mt-1
                              "
                            >
                              No existen
                              transacciones para
                              este filtro.
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
                                border-[var(--mint-border)]
                                transition-colors
                                hover:bg-[var(--mint-bg-soft)]
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
                                    "es-MX",
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
                bg-[var(--mint-bg-soft)]
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
                Mostrando{" "}
                {
                  cobrosTabla.length
                }{" "}
                de{" "}
                {
                  cobrosFiltradosPeriodo
                    .length
                }{" "}
                transacciones del período
              </p>

            </div>

          }

        </div>

      </section>

    </div>

  );

}