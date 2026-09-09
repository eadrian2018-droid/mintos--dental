import {
  useEffect,
  useState,
} from "react";

import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  LockKeyhole,
} from "lucide-react";

import {
  supabase,
} from "../../lib/supabase";

type CierreFinanciero = {

  id: number;

  anio: number;

  mes: number;

  cobrado_mxn: number;
  cobrado_usd: number;

  base_clinica_mxn: number;
  base_clinica_usd: number;

  comisiones_mxn: number;
  comisiones_usd: number;

  gastos_mxn: number;
  gastos_usd: number;

  utilidad_neta_mxn: number;
  utilidad_neta_usd: number;

  caja_mxn: number;
  caja_usd: number;

  banco_mxn: number;

  cuentas_por_cobrar_mxn: number;

  tratamientos_total: number;

  tratamientos_finalizados: number;

  cerrado_por?: string | null;

  fecha_cierre: string;

};

type Props = {

  cobradoMXN: number;

  cobradoUSD: number;

  totalBaseClinicaMXN: number;

  totalBaseClinicaUSD: number;

  totalComisionesDoctorMXN: number;

  totalComisionesDoctorUSD: number;

  totalGastos: number;

  totalGastosUSD: number;

  gananciaNeta: number;

  gananciaNetaUSD: number;

  cajaMXN: number;

  cajaUSD: number;

  bancoMXN: number;

  pendiente: number;

  tratamientosTotal: number;

  tratamientosFinalizados: number;

};

const MESES = [

  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",

];

export default function CierreMensual({

  cobradoMXN,

  cobradoUSD,

  totalBaseClinicaMXN,

  totalBaseClinicaUSD,

  totalComisionesDoctorMXN,

  totalComisionesDoctorUSD,

  totalGastos,

  totalGastosUSD,

  gananciaNeta,

  gananciaNetaUSD,

  cajaMXN,

  cajaUSD,

  bancoMXN,

  pendiente,

  tratamientosTotal,

  tratamientosFinalizados,

}: Props) {

  const hoy =
    new Date();

  const mesActual =
    hoy.getMonth() + 1;

  const anioActual =
    hoy.getFullYear();

  const [
    cierres,
    setCierres,
  ] =
    useState<CierreFinanciero[]>(
      []
    );

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    cerrando,
    setCerrando,
  ] =
    useState(false);

  const cierreActual =
    cierres.find(
      (cierre) =>
        cierre.mes ===
          mesActual &&
        cierre.anio ===
          anioActual
    );

  const resumenCierre = {

    cobradoMXN:
      cierreActual
        ?.cobrado_mxn ??
      cobradoMXN,

    cobradoUSD:
      cierreActual
        ?.cobrado_usd ??
      cobradoUSD,

    baseClinicaMXN:
      cierreActual
        ?.base_clinica_mxn ??
      totalBaseClinicaMXN,

    baseClinicaUSD:
      cierreActual
        ?.base_clinica_usd ??
      totalBaseClinicaUSD,

    comisionesMXN:
      cierreActual
        ?.comisiones_mxn ??
      totalComisionesDoctorMXN,

    comisionesUSD:
      cierreActual
        ?.comisiones_usd ??
      totalComisionesDoctorUSD,

    gastosMXN:
      cierreActual
        ?.gastos_mxn ??
      totalGastos,

    gastosUSD:
      cierreActual
        ?.gastos_usd ??
      totalGastosUSD,

    utilidadMXN:
      cierreActual
        ?.utilidad_neta_mxn ??
      gananciaNeta,

    utilidadUSD:
      cierreActual
        ?.utilidad_neta_usd ??
      gananciaNetaUSD,

    cajaMXN:
      cierreActual
        ?.caja_mxn ??
      cajaMXN,

    cajaUSD:
      cierreActual
        ?.caja_usd ??
      cajaUSD,

    bancoMXN:
      cierreActual
        ?.banco_mxn ??
      bancoMXN,

    pendienteMXN:
      cierreActual
        ?.cuentas_por_cobrar_mxn ??
      pendiente,

    tratamientosTotal:
      cierreActual
        ?.tratamientos_total ??
      tratamientosTotal,

    tratamientosFinalizados:
      cierreActual
        ?.tratamientos_finalizados ??
      tratamientosFinalizados,

  };

  useEffect(
    () => {

      cargarCierres();

    },
    []
  );

  async function cargarCierres() {

    setCargando(
      true
    );

    const {
      data,
      error,
    } =
      await supabase

        .from(
          "cierres_financieros"
        )

        .select("*")

        .order(
          "anio",
          {
            ascending:
              false,
          }
        )

        .order(
          "mes",
          {
            ascending:
              false,
          }
        );

    if (error) {

      console.error(
        "Error cargando cierres:",
        error
      );

      setCargando(
        false
      );

      return;

    }

    setCierres(
      (
        data ||
        []
      ) as CierreFinanciero[]
    );

    setCargando(
      false
    );

  }

  function formatoDinero(
    valor: number,
    moneda:
      | "MXN"
      | "USD"
  ) {

    return `$${Number(
      valor || 0
    ).toLocaleString(
      "es-MX",
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )} ${moneda}`;

  }

  function formatoFecha(
    fecha: string
  ) {

    return new Date(
      fecha
    ).toLocaleString(
      "es-MX",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    );

  }

  async function cerrarMes() {

    if (
      cierreActual
    ) {

      alert(
        "Este mes ya fue cerrado."
      );

      return;

    }

    const confirmar =
      window.confirm(
        `¿Confirmas el cierre financiero de ${MESES[
          mesActual - 1
        ]} ${anioActual}?\n\nUna vez guardado, este cierre conservará la fotografía financiera del mes.`
      );

    if (
      !confirmar
    ) {

      return;

    }

    setCerrando(
      true
    );

    const {
      data: usuario,
    } =
      await supabase
        .auth
        .getUser();

    const usuarioId =
      usuario
        ?.user
        ?.id ||
      null;

    const {
      error,
    } =
      await supabase

        .from(
          "cierres_financieros"
        )

        .insert({

          anio:
            anioActual,

          mes:
            mesActual,

          cobrado_mxn:
            Number(
              cobradoMXN || 0
            ),

          cobrado_usd:
            Number(
              cobradoUSD || 0
            ),

          base_clinica_mxn:
            Number(
              totalBaseClinicaMXN ||
                0
            ),

          base_clinica_usd:
            Number(
              totalBaseClinicaUSD ||
                0
            ),

          comisiones_mxn:
            Number(
              totalComisionesDoctorMXN ||
                0
            ),

          comisiones_usd:
            Number(
              totalComisionesDoctorUSD ||
                0
            ),

          gastos_mxn:
            Number(
              totalGastos || 0
            ),

          gastos_usd:
            Number(
              totalGastosUSD || 0
            ),

          utilidad_neta_mxn:
            Number(
              gananciaNeta || 0
            ),

          utilidad_neta_usd:
            Number(
              gananciaNetaUSD || 0
            ),

          caja_mxn:
            Number(
              cajaMXN || 0
            ),

          caja_usd:
            Number(
              cajaUSD || 0
            ),

          banco_mxn:
            Number(
              bancoMXN || 0
            ),

          cuentas_por_cobrar_mxn:
            Number(
              pendiente || 0
            ),

          tratamientos_total:
            Number(
              tratamientosTotal ||
                0
            ),

          tratamientos_finalizados:
            Number(
              tratamientosFinalizados ||
                0
            ),

          cerrado_por:
            usuarioId,

        });

    if (
      error
    ) {

      console.error(
        "Error cerrando mes:",
        error
      );

      alert(
        "No se pudo realizar el cierre mensual."
      );

      setCerrando(
        false
      );

      return;

    }

    await cargarCierres();

    setCerrando(
      false
    );

    alert(
      "Cierre mensual guardado correctamente."
    );

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      {/* ENCABEZADO */}

      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-6
            flex-wrap
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-3
                mb-2
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  flex
                  items-center
                  justify-center
                "
              >

                <CalendarCheck
                  size={
                    20
                  }
                />

              </div>

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--mint-primary)]
                  "
                >
                  Cierre financiero
                </p>

                <h2
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                  "
                >
                  {
                    MESES[
                      mesActual -
                        1
                    ]
                  }{" "}
                  {
                    anioActual
                  }
                </h2>

              </div>

            </div>

            <p
              className="
                text-sm
                mint-text-secondary
                max-w-2xl
              "
            >
              Guarda una fotografía
              definitiva del resultado
              financiero del mes sin
              modificar los movimientos
              originales.
            </p>

          </div>

          {
            cierreActual

              ? (

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    bg-[var(--mint-success-bg)]
                    border
                    border-[var(--mint-success-border)]
                    text-[var(--mint-success)]
                    text-sm
                    font-semibold
                  "
                >

                  <CheckCircle2
                    size={
                      17
                    }
                  />

                  Mes cerrado

                </div>

              )

              : (

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    mint-bg-soft
                    border
                    mint-border
                    mint-text-secondary
                    text-sm
                    font-semibold
                  "
                >

                  <Clock3
                    size={
                      17
                    }
                  />

                  Mes abierto

                </div>

              )
          }

        </div>

      </div>

      {/* RESUMEN */}

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
            flex-wrap
          "
        >

          <div>

            <h3
              className="
                font-bold
                mint-text-primary
              "
            >
              Resumen para cierre
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              {
                cierreActual
                  ? "Valores almacenados en el cierre definitivo del mes."
                  : "Revisa la fotografía financiera completa antes de cerrar el período."
              }
            </p>

          </div>

          <div
            className="
              px-3
              py-1.5
              rounded-lg
              bg-[var(--mint-bg-soft)]
              border
              border-[var(--mint-border)]
              text-xs
              font-semibold
              mint-text-secondary
            "
          >
            {
              cierreActual
                ? "Cierre guardado"
                : "Datos actuales"
            }
          </div>

        </div>

        <div
          className="
            p-6
            space-y-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-4
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-5
              "
            >
              <p className="text-xs uppercase tracking-wide mint-text-muted font-semibold">
                Cobrado MXN
              </p>
              <p className="mt-2 text-xl font-bold text-[var(--mint-success)]">
                {
                  formatoDinero(
                    resumenCierre.cobradoMXN,
                    "MXN"
                  )
                }
              </p>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-5
              "
            >
              <p className="text-xs uppercase tracking-wide mint-text-muted font-semibold">
                Cobrado USD
              </p>
              <p className="mt-2 text-xl font-bold text-[var(--mint-info)]">
                {
                  formatoDinero(
                    resumenCierre.cobradoUSD,
                    "USD"
                  )
                }
              </p>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-primary)]
                bg-[var(--mint-primary-soft)]
                p-5
              "
            >
              <p className="text-xs uppercase tracking-wide text-[var(--mint-primary)] font-semibold">
                Utilidad MXN
              </p>
              <p className="mt-2 text-xl font-bold text-[var(--mint-primary)]">
                {
                  formatoDinero(
                    resumenCierre.utilidadMXN,
                    "MXN"
                  )
                }
              </p>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-5
              "
            >
              <p className="text-xs uppercase tracking-wide mint-text-muted font-semibold">
                Utilidad USD
              </p>
              <p className="mt-2 text-xl font-bold text-[var(--mint-info)]">
                {
                  formatoDinero(
                    resumenCierre.utilidadUSD,
                    "USD"
                  )
                }
              </p>
            </div>

          </div>

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-4
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                p-5
              "
            >

              <div className="mb-4">
                <p className="text-sm font-bold mint-text-primary">
                  Distribución financiera
                </p>
                <p className="text-xs mint-text-muted mt-1">
                  Base clínica, comisiones y gastos del período.
                </p>
              </div>

              <div className="space-y-3">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm mint-text-secondary">Base clínica MXN</span>
                  <span className="text-sm font-semibold mint-text-primary">
                    {formatoDinero(resumenCierre.baseClinicaMXN, "MXN")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm mint-text-secondary">Base clínica USD</span>
                  <span className="text-sm font-semibold mint-text-primary">
                    {formatoDinero(resumenCierre.baseClinicaUSD, "USD")}
                  </span>
                </div>

                <div className="h-px bg-[var(--mint-border)]" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm mint-text-secondary">Comisiones MXN</span>
                  <span className="text-sm font-semibold mint-text-primary">
                    {formatoDinero(resumenCierre.comisionesMXN, "MXN")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm mint-text-secondary">Comisiones USD</span>
                  <span className="text-sm font-semibold mint-text-primary">
                    {formatoDinero(resumenCierre.comisionesUSD, "USD")}
                  </span>
                </div>

                <div className="h-px bg-[var(--mint-border)]" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm mint-text-secondary">Gastos MXN</span>
                  <span className="text-sm font-semibold text-[var(--mint-danger)]">
                    {formatoDinero(resumenCierre.gastosMXN, "MXN")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm mint-text-secondary">Gastos USD</span>
                  <span className="text-sm font-semibold text-[var(--mint-danger)]">
                    {formatoDinero(resumenCierre.gastosUSD, "USD")}
                  </span>
                </div>

              </div>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                p-5
              "
            >

              <div className="mb-4">
                <p className="text-sm font-bold mint-text-primary">
                  Posición al cierre
                </p>
                <p className="text-xs mint-text-muted mt-1">
                  Disponibilidad, cuentas por cobrar y actividad clínica.
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                "
              >

                <div className="rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)] p-4">
                  <p className="text-[11px] uppercase tracking-wide mint-text-muted font-semibold">Caja MXN</p>
                  <p className="mt-1 font-bold mint-text-primary">
                    {formatoDinero(resumenCierre.cajaMXN, "MXN")}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)] p-4">
                  <p className="text-[11px] uppercase tracking-wide mint-text-muted font-semibold">Caja USD</p>
                  <p className="mt-1 font-bold mint-text-primary">
                    {formatoDinero(resumenCierre.cajaUSD, "USD")}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)] p-4">
                  <p className="text-[11px] uppercase tracking-wide mint-text-muted font-semibold">Banco MXN</p>
                  <p className="mt-1 font-bold mint-text-primary">
                    {formatoDinero(resumenCierre.bancoMXN, "MXN")}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--mint-bg-soft)] border border-[var(--mint-border)] p-4">
                  <p className="text-[11px] uppercase tracking-wide mint-text-muted font-semibold">Por cobrar MXN</p>
                  <p className="mt-1 font-bold text-[var(--mint-warning)]">
                    {formatoDinero(resumenCierre.pendienteMXN, "MXN")}
                  </p>
                </div>

              </div>

              <div
                className="
                  mt-4
                  pt-4
                  border-t
                  border-[var(--mint-border)]
                  flex
                  items-center
                  justify-between
                  gap-4
                  flex-wrap
                "
              >

                <div>
                  <p className="text-[11px] uppercase tracking-wide mint-text-muted font-semibold">
                    Tratamientos del mes
                  </p>
                  <p className="mt-1 text-lg font-bold mint-text-primary">
                    {resumenCierre.tratamientosTotal}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide mint-text-muted font-semibold">
                    Finalizados
                  </p>
                  <p className="mt-1 text-lg font-bold text-[var(--mint-success)]">
                    {resumenCierre.tratamientosFinalizados}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ACCIÓN */}

      {
        !cierreActual && (

          <div
            className="
              mint-card
              p-6
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-5
                flex-wrap
              "
            >

              <div>

                <h3
                  className="
                    font-bold
                    mint-text-primary
                  "
                >
                  Cerrar período
                </h3>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-1
                  "
                >
                  Revisa los indicadores
                  antes de guardar el
                  cierre definitivo.
                </p>

              </div>

              <button
                type="button"
                disabled={
                  cerrando
                }
                onClick={
                  cerrarMes
                }
                className="
                  mint-btn
                  mint-btn-primary
                  inline-flex
                  items-center
                  gap-2
                "
              >

                <LockKeyhole
                  size={
                    17
                  }
                />

                {
                  cerrando
                    ? "Cerrando..."
                    : "Cerrar mes"
                }

              </button>

            </div>

          </div>

        )
      }

      {/* HISTORIAL */}

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
            mint-border
          "
        >

          <h3
            className="
              font-bold
              mint-text-primary
            "
          >
            Historial de cierres
          </h3>

          <p
            className="
              text-sm
              mint-text-secondary
              mt-1
            "
          >
            Fotografías financieras
            almacenadas por período.
          </p>

        </div>

        {
          cargando

            ? (

              <div
                className="
                  p-8
                  text-center
                  mint-text-muted
                "
              >
                Cargando cierres...
              </div>

            )

            : cierres.length ===
                0

              ? (

                <div
                  className="
                    p-8
                    text-center
                    mint-text-muted
                  "
                >
                  Todavía no hay
                  cierres registrados.
                </div>

              )

              : (

                <div
                  className="
                    overflow-x-auto
                  "
                >

                  <table
                    className="
                      w-full
                      text-sm
                    "
                  >

                    <thead
                      className="
                        mint-bg-soft
                      "
                    >

                      <tr>

                        <th
                          className="
                            text-left
                            px-6
                            py-3
                          "
                        >
                          Período
                        </th>

                        <th
                          className="
                            text-right
                            px-6
                            py-3
                          "
                        >
                          Utilidad MXN
                        </th>

                        <th
                          className="
                            text-right
                            px-6
                            py-3
                          "
                        >
                          Utilidad USD
                        </th>

                        <th
                          className="
                            text-right
                            px-6
                            py-3
                          "
                        >
                          Cobrado MXN
                        </th>

                        <th
                          className="
                            text-right
                            px-6
                            py-3
                          "
                        >
                          Cobrado USD
                        </th>

                        <th
                          className="
                            text-left
                            px-6
                            py-3
                          "
                        >
                          Fecha cierre
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {
                        cierres.map(
                          (
                            cierre
                          ) => (

                            <tr
                              key={
                                cierre.id
                              }
                              className="
                                border-t
                                mint-border
                              "
                            >

                              <td
                                className="
                                  px-6
                                  py-4
                                  font-semibold
                                  mint-text-primary
                                "
                              >
                                {
                                  MESES[
                                    cierre.mes -
                                      1
                                  ]
                                }{" "}
                                {
                                  cierre.anio
                                }
                              </td>

                              <td
                                className="
                                  px-6
                                  py-4
                                  text-right
                                  font-semibold
                                "
                              >
                                {
                                  formatoDinero(
                                    cierre.utilidad_neta_mxn,
                                    "MXN"
                                  )
                                }
                              </td>

                              <td
                                className="
                                  px-6
                                  py-4
                                  text-right
                                  font-semibold
                                "
                              >
                                {
                                  formatoDinero(
                                    cierre.utilidad_neta_usd,
                                    "USD"
                                  )
                                }
                              </td>

                              <td
                                className="
                                  px-6
                                  py-4
                                  text-right
                                "
                              >
                                {
                                  formatoDinero(
                                    cierre.cobrado_mxn,
                                    "MXN"
                                  )
                                }
                              </td>

                              <td
                                className="
                                  px-6
                                  py-4
                                  text-right
                                "
                              >
                                {
                                  formatoDinero(
                                    cierre.cobrado_usd,
                                    "USD"
                                  )
                                }
                              </td>

                              <td
                                className="
                                  px-6
                                  py-4
                                  mint-text-secondary
                                "
                              >
                                {
                                  formatoFecha(
                                    cierre.fecha_cierre
                                  )
                                }
                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              )
        }

      </div>

    </div>

  );

}