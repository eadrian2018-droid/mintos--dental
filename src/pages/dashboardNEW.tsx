import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
  DollarSign,
  Stethoscope,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function Dashboard() {

  const [
    ,
    setTotalPacientes,
  ] = useState(0);

  const [
    ,
    setTotalCitas,
  ] = useState(0);

  const [
    citasHoy,
    setCitasHoy,
  ] = useState<any[]>([]);

  const [
    cobrosHoy,
    setCobrosHoy,
  ] = useState(0);

  const [, setPacientesNuevosMes] = useState(0);
  const [saldoPendiente, setSaldoPendiente] = useState(0);
  const [, setTratamientosPendientes] = useState(0);
  const [, setPresupuestosActivos] = useState(0);
  const [tipoCambio, setTipoCambio] = useState(0);

  const [
    ,
    setCargando,
  ] = useState(true);

  useEffect(() => {

    cargarDashboard();

  }, []);

  async function cargarDashboard() {

    setCargando(true);

    const hoy =
      new Date()
        .toLocaleDateString(
          "en-CA"
        );

    const inicioHoy =
      `${hoy}T00:00:00`;

    const finHoy =
      `${hoy}T23:59:59`;

    const ahora = new Date();

    const inicioMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        1
      ).toISOString();

    const finMes =
      new Date(
        ahora.getFullYear(),
        ahora.getMonth() + 1,
        1
      ).toISOString();

    const [
      pacientesResponse,
      citasResponse,
      citasHoyResponse,
      pagosHoyResponse,
      pacientesMesResponse,
      tratamientosResponse,
      presupuestosResponse,
      tipoCambioResponse,
    ] =
      await Promise.all([

        supabase
          .from("pacientes")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("citas")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("citas")
          .select("*")
          .gte(
            "inicio",
            inicioHoy
          )
          .lte(
            "inicio",
            finHoy
          )
          .order(
            "inicio",
            {
              ascending: true,
            }
          ),

        supabase
          .from("pagos")
          .select(
            "monto_mxn, created_at"
          )
          .gte(
            "created_at",
            inicioHoy
          )
          .lte(
            "created_at",
            finHoy
          ),

        supabase
          .from("pacientes")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          )
          .gte("created_at", inicioMes)
          .lt("created_at", finMes),

        supabase
          .from("tratamientos")
          .select("resta, pendiente"),

        supabase
          .from("presupuestos")
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          )
          .in(
            "estado",
            ["Borrador", "Enviado"]
          ),

        supabase
          .from("configuracion_finanzas")
          .select("valor")
          .eq("clave", "tipo_cambio_usd_mxn")
          .maybeSingle(),

      ]);

    setTotalPacientes(
      pacientesResponse.count || 0
    );

    setTotalCitas(
      citasResponse.count || 0
    );

    setCitasHoy(
      citasHoyResponse.data || []
    );

    const totalCobrosHoy =
      (
        pagosHoyResponse.data || []
      ).reduce(
        (
          total,
          pago: any
        ) =>
          total +
          Number(
            pago.monto_mxn || 0
          ),
        0
      );

    setCobrosHoy(
      totalCobrosHoy
    );

    setPacientesNuevosMes(
      pacientesMesResponse.count || 0
    );

    const tratamientosActivos =
      (tratamientosResponse.data || [])
        .filter(
          (tratamiento: any) =>
            Number(tratamiento.resta || 0) > 0 ||
            tratamiento.pendiente === true
        );

    setTratamientosPendientes(
      tratamientosActivos.length
    );

    setSaldoPendiente(
      tratamientosActivos.reduce(
        (total: number, tratamiento: any) =>
          total + Number(tratamiento.resta || 0),
        0
      )
    );

    setPresupuestosActivos(
      presupuestosResponse.count || 0
    );

    setTipoCambio(
      Number(tipoCambioResponse.data?.valor || 0)
    );

    setCargando(false);

  }

  const fechaActual =
    useMemo(
      () =>
        new Date()
          .toLocaleDateString(
            "es-MX",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          ),
      []
    );

  const citasPendientes =
    citasHoy.filter(
      (cita) =>
        String(
          cita.estado || ""
        )
          .toLowerCase() !==
        "cancelada"
    ).length;

  const doctoresHoy =
    new Set(
      citasHoy
        .map(
          (cita) =>
            cita.doctor
        )
        .filter(Boolean)
    ).size;

  function formatoMoneda(
    valor: number
  ) {

    return new Intl.NumberFormat(
      "es-MX",
      {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    ).format(
      valor
    );

  }

  function obtenerEstadoCita(
    estado: string
  ) {

    const estadoNormalizado =
      String(
        estado || "pendiente"
      ).toLowerCase();

    if (
      estadoNormalizado ===
        "confirmada" ||
      estadoNormalizado ===
        "confirmado"
    ) {

      return {
        texto: "Confirmada",
        clase:
          "bg-[var(--mint-success-bg)] text-[var(--mint-success)] border-[var(--mint-success-border)]",
      };

    }

    if (
      estadoNormalizado ===
        "cancelada" ||
      estadoNormalizado ===
        "cancelado"
    ) {

      return {
        texto: "Cancelada",
        clase:
          "bg-[var(--mint-danger-bg)] text-[var(--mint-danger)] border-[var(--mint-danger-border)]",
      };

    }

    if (
      estadoNormalizado ===
        "completada" ||
      estadoNormalizado ===
        "completado" ||
      estadoNormalizado ===
        "finalizada" ||
      estadoNormalizado ===
        "finalizado"
    ) {

      return {
        texto: "Completada",
        clase:
          "bg-[var(--mint-info-bg)] text-[var(--mint-info)] border-[var(--mint-info-border)]",
      };

    }

    return {
      texto: "Pendiente",
      clase:
        "bg-[var(--mint-warning-bg)] text-[var(--mint-warning)] border-[var(--mint-warning-border)]",
    };

  }

  return (

    <div
      className="
        space-y-7
      "
    >

      <div
        className="
          flex
          flex-col
          xl:flex-row
          xl:items-end
          xl:justify-between
          gap-4
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              text-[var(--mint-primary)]
              text-xs
              font-bold
              mb-3
            "
          >
            <Stethoscope
              size={14}
            />

            Vista general
          </div>

          <h1
            className="
              text-3xl
              lg:text-4xl
              font-bold
              mint-text-primary
              tracking-tight
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mint-text-secondary
              mt-2
              text-sm
              lg:text-base
              capitalize
            "
          >
            {fechaActual}
          </p>

        </div>

        <div
          className="
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-2xl
            bg-[var(--mint-bg-soft)]
            border
            border-[var(--mint-border)]
          "
        >

          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              flex
              items-center
              justify-center
              text-[var(--mint-primary)]
            "
          >
            <Clock3
              size={18}
            />
          </div>

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wide
                font-bold
                mint-text-muted
              "
            >
              Operación de hoy
            </p>

            <p
              className="
                text-sm
                font-semibold
                mint-text-primary
                mt-0.5
              "
            >
              {citasHoy.length} citas · {doctoresHoy} doctores
            </p>

          </div>

        </div>

      </div>

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
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-muted
                "
              >
                Citas hoy
              </p>

              <p
                className="
                  text-3xl
                  font-bold
                  mint-text-primary
                  mt-2
                "
              >
                {citasHoy.length}
              </p>

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mt-1
                "
              >
                {citasPendientes} activas
              </p>

            </div>

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-[var(--mint-warning-bg)]
                border
                border-[var(--mint-warning-border)]
                flex
                items-center
                justify-center
                text-[var(--mint-warning)]
              "
            >
              <Clock3
                size={20}
              />
            </div>

          </div>

        </div>

        <div
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
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-muted
                "
              >
                Cobros hoy
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-success)]
                  mt-2
                "
              >
                {
                  formatoMoneda(
                    cobrosHoy
                  )
                }
              </p>

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mt-1
                "
              >
                Ingreso registrado
              </p>

            </div>

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-[var(--mint-success-bg)]
                border
                border-[var(--mint-success-border)]
                flex
                items-center
                justify-center
                text-[var(--mint-success)]
              "
            >
              <DollarSign
                size={20}
              />
            </div>

          </div>

        </div>

        <div
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
              gap-4
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  mint-text-muted
                "
              >
                Saldo pendiente
              </p>

              <div
                className="
                  flex
                  items-baseline
                  gap-2
                  mt-2
                  whitespace-nowrap
                "
              >

                <p
                  className="
                    text-lg
                    font-bold
                    text-[var(--mint-danger)]
                  "
                >
                  {
                    formatoMoneda(
                      saldoPendiente
                    )
                  }
                </p>

                <span
                  className="
                    text-xs
                    font-semibold
                    mint-text-muted
                  "
                >
                  MXN
                </span>

                <span
                  className="
                    text-xs
                    mint-text-muted
                  "
                >
                  |
                </span>

                <p
                  className="
                    text-sm
                    font-bold
                    text-[var(--mint-primary)]
                  "
                >
                  {
                    tipoCambio > 0
                      ? new Intl.NumberFormat(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }
                        ).format(
                          saldoPendiente /
                          tipoCambio
                        )
                      : "$0"
                  }
                </p>

                <span
                  className="
                    text-xs
                    font-semibold
                    mint-text-muted
                  "
                >
                  USD
                </span>

              </div>

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mt-1
                "
              >
                Tratamientos con saldo
              </p>

            </div>

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-[var(--mint-danger-bg)]
                border
                border-[var(--mint-danger-border)]
                flex
                items-center
                justify-center
                text-[var(--mint-danger)]
                shrink-0
              "
            >
              <DollarSign
                size={20}
              />
            </div>

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

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Agenda de hoy
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Próximas citas programadas
            </p>

          </div>

          <div
            className="
              px-3
              py-1.5
              rounded-xl
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
              text-[var(--mint-primary)]
              text-xs
              font-bold
            "
          >
            {citasHoy.length} citas
          </div>

        </div>

        <div
          className="
            p-4
            sm:p-5
          "
        >

          {
            citasHoy.length ===
            0
              ? (

                <div
                  className="
                    mint-empty
                    py-12
                  "
                >
                  No hay citas programadas para hoy
                </div>

              )
              : (

                <div
                  className="
                    divide-y
                    divide-[var(--mint-border)]
                  "
                >

                  {
                    citasHoy.map(
                      (cita) => {

                        const estado =
                          obtenerEstadoCita(
                            cita.estado
                          );

                        return (

                          <div
                            key={
                              cita.id
                            }
                            className="
                              py-4
                              first:pt-0
                              last:pb-0
                              flex
                              flex-col
                              md:flex-row
                              md:items-center
                              gap-4
                            "
                          >

                            <div
                              className="
                                min-w-[92px]
                                md:border-r
                                md:border-[var(--mint-border)]
                                md:pr-5
                              "
                            >

                              <p
                                className="
                                  text-base
                                  font-bold
                                  text-[var(--mint-primary)]
                                "
                              >
                                {
                                  new Date(
                                    cita.inicio
                                  ).toLocaleTimeString(
                                    "es-MX",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                }
                              </p>

                            </div>

                            <div
                              className="
                                flex-1
                                min-w-0
                              "
                            >

                              <h3
                                className="
                                  text-sm
                                  font-bold
                                  mint-text-primary
                                  truncate
                                "
                              >
                                {
                                  cita.paciente ||
                                  "Paciente"
                                }
                              </h3>

                              <p
                                className="
                                  text-xs
                                  mint-text-secondary
                                  mt-1
                                "
                              >
                                {
                                  cita.doctor ||
                                  "Doctor sin asignar"
                                }
                              </p>

                            </div>

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                flex-wrap
                              "
                            >

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  px-3
                                  py-1.5
                                  rounded-full
                                  border
                                  text-xs
                                  font-bold
                                  ${estado.clase}
                                `}
                              >
                                {
                                  estado.texto
                                }
                              </span>

                            </div>

                          </div>

                        );

                      }
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
