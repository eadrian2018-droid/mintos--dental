import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

import type {
  Doctor,
} from "../types/Doctor";

import type {
  Paciente,
} from "../types/Paciente";

import type {
  Tratamiento,
} from "../types/Tratamiento";

type PagoDoctorDetalle = {

  id?: number;

  fecha?: string;

  tratamiento_id?: number;

  moneda?: string;

  monto_original?: number;

  comision_banco?: number;

  comision_doctor_porcentaje?: number | null;

  comision_doctor_pagada?: boolean;

  comision_doctor_fecha_pago?: string | null;

  comision_doctor_metodo_pago?: string | null;

  comision_doctor_pago_moneda?: string | null;

  comision_doctor_pago_monto?: number;

};

type DoctorDetalleProps = {

  doctor: Doctor | null;

  pacientes: Paciente[];

  tratamientos: Tratamiento[];

  pagos?: PagoDoctorDetalle[];

  onClose: () => void;

};

export default function DoctorDetalle({

  doctor,

  pacientes,

  tratamientos,

  pagos = [],

  onClose,

}: DoctorDetalleProps) {

  const { language } = useLanguage();
  const es = language === "es";
  const locale = es ? "es-MX" : "en-US";
  const t = (espanol: string, ingles: string) => es ? espanol : ingles;

  const [monedaPrincipal, setMonedaPrincipal] = useState<"MXN" | "USD">("MXN");
  const [monedaSecundariaActiva, setMonedaSecundariaActiva] = useState(true);

  useEffect(() => {
    let activo = true;
    const cargarMonedas = async () => {
      const { data, error } = await supabase
        .from("configuracion_finanzas")
        .select("clave, valor")
        .in("clave", ["moneda_principal", "moneda_secundaria_activa"]);
      if (error) {
        console.error("Error consultando monedas financieras:", error);
        return;
      }
      if (!activo) return;
      const valores = Object.fromEntries(
        (data ?? []).map(fila => [fila.clave, String(fila.valor ?? "")])
      );
      setMonedaPrincipal(valores.moneda_principal === "USD" ? "USD" : "MXN");
      setMonedaSecundariaActiva(valores.moneda_secundaria_activa !== "false");
    };
    void cargarMonedas();
    return () => { activo = false; };
  }, []);

  const mostrarMXN = monedaPrincipal === "MXN" || monedaSecundariaActiva;
  const mostrarUSD = monedaPrincipal === "USD" || monedaSecundariaActiva;

  if (!doctor) {
    return null;
  }

  const formatoMonto =
    (
      monto: number
    ) =>
      monto.toLocaleString(
        locale,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

  const formatoFecha =
    (
      fecha: string
    ) => {

      if (!fecha) {

        return "—";

      }

      const fechaLocal =
        new Date(
          `${fecha}T12:00:00`
        );

      if (
        Number.isNaN(
          fechaLocal.getTime()
        )
      ) {

        return fecha;

      }

      return fechaLocal
        .toLocaleDateString(
          locale,
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

    };

  const formatoFechaHora =
    (
      fecha?: string | null
    ) => {

      if (!fecha) {
        return "—";
      }

      const fechaReal =
        new Date(fecha);

      if (
        Number.isNaN(
          fechaReal.getTime()
        )
      ) {
        return fecha;
      }

      return fechaReal
        .toLocaleString(
          locale,
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

    };

  const tratamientosDoctor =
    tratamientos.filter(
      (tratamiento) =>
        tratamiento.doctor_id ===
        doctor.id
    );

   const detalleTratamientos =
    tratamientosDoctor.map(
      (tratamiento) => {

        const porcentaje =
          Number(
            doctor.porcentaje || 0
          );

        const tratamientoFinalizado =
          tratamiento.estado ===
          "Finalizado";

        const pagosTratamiento =
          pagos.filter(
            (pago) =>
              pago.tratamiento_id ===
              tratamiento.id
          );

        const pagadoMXN =
          pagosTratamiento
            .filter(
              (pago) =>
                pago.moneda === "MXN"
            )
            .reduce(
              (
                total,
                pago
              ) =>
                total +
                Number(
                  pago.monto_original || 0
                ),
              0
            );

        const pagadoUSD =
          pagosTratamiento
            .filter(
              (pago) =>
                pago.moneda === "USD"
            )
            .reduce(
              (
                total,
                pago
              ) =>
                total +
                Number(
                  pago.monto_original || 0
                ),
              0
            );

        const baseClinicaMXN =
          tratamientoFinalizado
            ? pagadoMXN
            : 0;

        const baseClinicaUSD =
          tratamientoFinalizado
            ? pagadoUSD
            : 0;

        const comisionMXN =
          baseClinicaMXN *
          porcentaje /
          100;

        const comisionUSD =
          baseClinicaUSD *
          porcentaje /
          100;

        const paciente =
          pacientes.find(
            (pacienteActual) =>
              pacienteActual.id ===
              tratamiento.paciente_id
          );

        return {

          tratamiento,

          paciente,

          pagadoMXN,

          pagadoUSD,

          baseClinicaMXN,

          baseClinicaUSD,

          comisionMXN,

          comisionUSD,

          tratamientoFinalizado,

        };

      }
    );

  /*
  |--------------------------------------------------------------------------
  | TOTALES POR MONEDA
  |--------------------------------------------------------------------------
  */

  const totalPagadoMXN =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.pagadoMXN,
      0
    );

  const totalPagadoUSD =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.pagadoUSD,
      0
    );

  const totalBaseClinicaMXN =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.baseClinicaMXN,
      0
    );

  const totalBaseClinicaUSD =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.baseClinicaUSD,
      0
    );

  const totalComisionMXN =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.comisionMXN,
      0
    );

  const totalComisionUSD =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.comisionUSD,
      0
    );

  const totalTratamientosFinalizados =
    detalleTratamientos.filter(
      (detalle) =>
        detalle.tratamientoFinalizado
    ).length;

  /*
  |--------------------------------------------------------------------------
  | HISTORIAL REAL DE COMISIONES
  |--------------------------------------------------------------------------
  |
  | Cada cobro real genera una comisión cuando el tratamiento está Finalizado.
  | Conservamos MXN y USD separados.
  |
  */

  const movimientosComision =
    pagos
      .map(
        (pago) => {

          const tratamiento =
            tratamientosDoctor.find(
              (item) =>
                Number(item.id) ===
                Number(
                  pago.tratamiento_id
                )
            );

          if (
            !tratamiento ||
            tratamiento.estado !==
              "Finalizado"
          ) {
            return null;
          }

          const paciente =
            pacientes.find(
              (item) =>
                Number(item.id) ===
                Number(
                  tratamiento.paciente_id
                )
            );

         const porcentaje =
  pago.comision_doctor_porcentaje !==
    null &&
  pago.comision_doctor_porcentaje !==
    undefined
    ? Number(
        pago.comision_doctor_porcentaje
      )
    : Number(
        doctor.porcentaje || 0
      );

const montoCobro =
  Number(
    pago.monto_original || 0
  );

const comisionGenerada =
  montoCobro *
  porcentaje /
  100;

          const moneda =
            pago.moneda === "USD"
              ? "USD"
              : "MXN";

          const pagada =
            pago.comision_doctor_pagada ===
            true;

          const montoPagado =
            pagada
              ? Number(
                  pago.comision_doctor_pago_monto ??
                  comisionGenerada
                )
              : 0;

          return {
            pago,
            tratamiento,
            paciente,
            moneda,
            montoCobro,
            comisionGenerada,
            pagada,
            montoPagado,
          };

        }
      )
      .filter(
        (
          movimiento
        ): movimiento is NonNullable<
          typeof movimiento
        > =>
          movimiento !== null
      )
      .sort(
        (a, b) => {

          const fechaA =
            new Date(
              a.pago.fecha || 0
            ).getTime();

          const fechaB =
            new Date(
              b.pago.fecha || 0
            ).getTime();

          return fechaB - fechaA;

        }
      );

  const comisionPagadaMXN =
    movimientosComision
      .filter(
        (movimiento) =>
          movimiento.pagada
          &&
          movimiento.moneda ===
            "MXN"
      )
      .reduce(
        (
          total,
          movimiento
        ) =>
          total +
          movimiento.montoPagado,
        0
      );

  const comisionPagadaUSD =
    movimientosComision
      .filter(
        (movimiento) =>
          movimiento.pagada
          &&
          movimiento.moneda ===
            "USD"
      )
      .reduce(
        (
          total,
          movimiento
        ) =>
          total +
          movimiento.montoPagado,
        0
      );

  const comisionPendienteMXN =
    Math.max(
      totalComisionMXN -
      comisionPagadaMXN,
      0
    );

  const comisionPendienteUSD =
    Math.max(
      totalComisionUSD -
      comisionPagadaUSD,
      0
    );

  return (

    <div
      className="
        mt-6
        space-y-6
      "
    >

      {/* =========================
          ENCABEZADO
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
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                bg-[var(--mint-primary-soft)]
                text-[var(--mint-primary)]
                border
                border-[var(--mint-border-primary)]
                text-xl
                font-bold
                shrink-0
              "
            >

              {
                doctor.nombre
                  ?.trim()
                  .charAt(0)
                  .toUpperCase()
              }

            </div>

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-1
                "
              >

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-[var(--mint-primary-soft)]
                    text-[var(--mint-primary)]
                    border
                    border-[var(--mint-border-primary)]
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                  "
                >

                  {t("Detalle de comisión", "Commission details")}

                </span>

              </div>

              <h3
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  mint-text-primary
                "
              >

                {doctor.nombre}

              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  mint-text-secondary
                "
              >

                Desglose de tratamientos,
                base clínica y comisión del doctor.

              </p>

            </div>

          </div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-3
                rounded-xl
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >

                  {t("Comisión", "Commission")}

                </p>

                <p
                  className="
                    text-lg
                    font-bold
                    text-[var(--mint-accent)]
                  "
                >

                  {
                    Number(
                      doctor.porcentaje || 0
                    )
                  }
                  %

                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                mint-btn
                mint-btn-danger
              "
            >

              {t("Cerrar", "Close")}

            </button>

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
          sm:grid-cols-2
          xl:grid-cols-4
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

              {t("Tratamientos", "Treatments")}

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
                tratamientosDoctor.length
              }

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Vinculados al doctor", "Assigned to this doctor")}

            </p>

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
              bg-[var(--mint-info)]
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

              {t("Total cobrado", "Total collected")}

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-info)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1
                "
              >

                {mostrarMXN && (
<span>
                  $
                  {
                    formatoMonto(
                      totalPagadoMXN
                    )
                  }
                  {" "}
                  MXN
                </span>
)}

                {mostrarUSD && (
<span
                  className="
                    text-lg
                    mint-text-secondary
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalPagadoUSD
                    )
                  }
                  {" "}
                  USD
                </span>
)}

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Pagos reales registrados", "Actual payments recorded")}

            </p>

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

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.1em]
                font-bold
                mint-text-muted
              "
            >

              {t("Base clínica", "Clinic base")}

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-accent)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1
                "
              >

                {mostrarMXN && (
<span>
                  $
                  {
                    formatoMonto(
                      totalBaseClinicaMXN
                    )
                  }
                  {" "}
                  MXN
                </span>
)}

                {mostrarUSD && (
<span
                  className="
                    text-lg
                    mint-text-secondary
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalBaseClinicaUSD
                    )
                  }
                  {" "}
                  USD
                </span>
)}

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Pagos de tratamientos finalizados", "Payments from completed treatments")}

            </p>

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
              bg-[var(--mint-success)]
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

              {t("Comisión doctor", "Doctor commission")}

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-success)]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-1
                "
              >

                {mostrarMXN && (
<span>
                  $
                  {
                    formatoMonto(
                      totalComisionMXN
                    )
                  }
                  {" "}
                  MXN
                </span>
)}

                {mostrarUSD && (
<span
                  className="
                    text-lg
                    mint-text-secondary
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalComisionUSD
                    )
                  }
                  {" "}
                  USD
                </span>
)}

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              {t("Comisión calculada", "Calculated commission")}

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          DESGLOSE DE BASE CLÍNICA
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

              {t("Movimientos clínicos", "Clinical activity")}

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              {t("Detalle de tratamientos", "Treatment details")}

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
              tratamientosDoctor.length
            }
            {" "}
            {
              tratamientosDoctor.length ===
              1

                ? t("tratamiento", "treatment")

                : t("tratamientos", "treatments")
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

                  {t("Fecha", "Date")}

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {t("Paciente", "Patient")}

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  {t("Tratamiento", "Treatment")}

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {t("Pagado", "Paid")}

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {t("Base clínica", "Clinic base")}

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  {t("Comisión", "Commission")}

                </th>

              </tr>

            </thead>

            <tbody>

              {

                detalleTratamientos.length ===
                0

                  ? (

                    <tr>

                      <td
                        colSpan={6}
                        className="
                          px-6
                          py-12
                          text-center
                          mint-text-muted
                        "
                      >

                        No hay tratamientos registrados
                        para este doctor.

                      </td>

                    </tr>

                  )

                  : detalleTratamientos.map(
                    ({
                      tratamiento,
                      paciente,
                      pagadoMXN,
                      pagadoUSD,
                      baseClinicaMXN,
                      baseClinicaUSD,
                      comisionMXN,
                      comisionUSD,
                    }) => (

                      <tr
                        key={
                          tratamiento.id
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
                              tratamiento.fecha
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
                              paciente?.nombre ||
                              t("Sin paciente", "No patient")
                            }

                          </p>

                        </td>

                        <td
                          className="
                            p-4
                            mint-text-secondary
                          "
                        >

                          {
                            tratamiento.tratamiento
                          }

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

                            {mostrarMXN && (
<span
                              className="
                                font-semibold
                                mint-text-primary
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  pagadoMXN
                                )
                              }
                              {" "}
                              MXN
                            </span>
)}

                            {mostrarUSD && (
<span
                              className="
                                text-xs
                                mint-text-muted
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  pagadoUSD
                                )
                              }
                              {" "}
                              USD
                            </span>
)}

                          </div>

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

                            {mostrarMXN && (
<span
                              className="
                                font-bold
                                text-[var(--mint-info)]
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  baseClinicaMXN
                                )
                              }
                              {" "}
                              MXN
                            </span>
)}

                            {mostrarUSD && (
<span
                              className="
                                text-xs
                                mint-text-muted
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  baseClinicaUSD
                                )
                              }
                              {" "}
                              USD
                            </span>
)}

                          </div>

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                            whitespace-nowrap
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

                            {mostrarMXN && (
<span
                              className="
                                font-bold
                                text-[var(--mint-success)]
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  comisionMXN
                                )
                              }
                              {" "}
                              MXN
                            </span>
)}

                            {mostrarUSD && (
<span
                              className="
                                text-xs
                                mint-text-muted
                              "
                            >
                              $
                              {
                                formatoMonto(
                                  comisionUSD
                                )
                              }
                              {" "}
                              USD
                            </span>
)}

                          </div>

                        </td>

                      </tr>

                    )
                  )

              }

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          HISTORIAL DE COMISIONES
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
                uppercase
                tracking-[0.12em]
                font-bold
                text-[var(--mint-primary)]
                mb-1
              "
            >
              {t("Historial financiero", "Financial history")}
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              {t("Comisiones por cobro", "Commissions per payment")}
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Cada registro corresponde a un cobro real
              de un tratamiento finalizado.
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-4
              gap-2
            "
          >

            {mostrarMXN && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-danger-border)]
                bg-[var(--mint-danger-bg)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-danger)]">
                {t("Pendiente MXN", "Pending MXN")}
              </p>
              <p className="font-bold text-[var(--mint-danger)]">
                $
                {
                  formatoMonto(
                    comisionPendienteMXN
                  )
                }
              </p>
            </div>
)}

            {mostrarMXN && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-success-border)]
                bg-[var(--mint-success-bg)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-success)]">
                {t("Pagado MXN", "Paid MXN")}
              </p>
              <p className="font-bold text-[var(--mint-success)]">
                $
                {
                  formatoMonto(
                    comisionPagadaMXN
                  )
                }
              </p>
            </div>
)}

            {mostrarUSD && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-warning-border)]
                bg-[var(--mint-warning-bg)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-warning)]">
                {t("Pendiente USD", "Pending USD")}
              </p>
              <p className="font-bold text-[var(--mint-warning)]">
                $
                {
                  formatoMonto(
                    comisionPendienteUSD
                  )
                }
              </p>
            </div>
)}

            {mostrarUSD && (
<div
              className="
                rounded-xl
                border
                border-[var(--mint-border-primary)]
                bg-[var(--mint-primary-soft)]
                px-3
                py-2
              "
            >
              <p className="text-[10px] uppercase font-bold text-[var(--mint-primary)]">
                {t("Pagado USD", "Paid USD")}
              </p>
              <p className="font-bold text-[var(--mint-primary)]">
                $
                {
                  formatoMonto(
                    comisionPagadaUSD
                  )
                }
              </p>
            </div>
)}

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="mint-table w-full text-sm">

            <thead className="mint-table-head">
              <tr>

                <th className="p-4 text-left">
                  {t("Fecha cobro", "Payment date")}
                </th>

                <th className="p-4 text-left">
                  {t("Paciente", "Patient")}
                </th>

                <th className="p-4 text-left">
                  {t("Tratamiento", "Treatment")}
                </th>

                <th className="p-4 text-right">
                  {t("Cobro", "Payment")}
                </th>

                <th className="p-4 text-right">
                  {t("Comisión", "Commission")}
                </th>

                <th className="p-4 text-center">
                  {t("Estado", "Status")}
                </th>

                <th className="p-4 text-left">
                  {t("Pago comisión", "Commission payment")}
                </th>

              </tr>
            </thead>

            <tbody>

              {
                movimientosComision.length ===
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
                        No hay comisiones generadas
                        para este doctor en el período seleccionado.
                      </td>
                    </tr>

                  )

                  : movimientosComision.map(
                      (
                        movimiento
                      ) => (

                        <tr
                          key={
                            movimiento.pago.id
                            ??
                            `${movimiento.tratamiento.id}-${movimiento.pago.fecha}`
                          }
                          className="mint-table-row"
                        >

                          <td
                            className="
                              p-4
                              whitespace-nowrap
                              mint-text-secondary
                            "
                          >
                            {
                              formatoFechaHora(
                                movimiento.pago.fecha
                              )
                            }
                          </td>

                          <td className="p-4">
                            <p className="font-semibold mint-text-primary">
                              {
                                movimiento.paciente?.nombre ||
                                "Sin paciente"
                              }
                            </p>
                          </td>

                          <td className="p-4">
                            <p className="font-semibold mint-text-primary">
                              {
                                movimiento.tratamiento.tratamiento ||
                                "Tratamiento"
                              }
                            </p>
                          </td>

                          <td
                            className="
                              p-4
                              text-right
                              whitespace-nowrap
                            "
                          >
                            <span className="font-semibold mint-text-primary">
                              $
                              {
                                formatoMonto(
                                  movimiento.montoCobro
                                )
                              }
                              {" "}
                              {
                                movimiento.moneda
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
                            <span className="font-bold text-[var(--mint-accent)]">
                              $
                              {
                                formatoMonto(
                                  movimiento.comisionGenerada
                                )
                              }
                              {" "}
                              {
                                movimiento.moneda
                              }
                            </span>
                          </td>

                          <td className="p-4 text-center">

                            {
                              movimiento.pagada

                                ? (
                                  <span
                                    className="
                                      inline-flex
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      bg-[var(--mint-success-bg)]
                                      text-[var(--mint-success)]
                                      border
                                      border-[var(--mint-success-border)]
                                    "
                                  >
                                    {t("Pagado", "Paid")}
                                  </span>
                                )

                                : (
                                  <span
                                    className="
                                      inline-flex
                                      px-3
                                      py-1
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      bg-[var(--mint-danger-bg)]
                                      text-[var(--mint-danger)]
                                      border
                                      border-[var(--mint-danger-border)]
                                    "
                                  >
                                    {t("Pendiente", "Pending")}
                                  </span>
                                )
                            }

                          </td>

                          <td className="p-4">

                            {
                              movimiento.pagada

                                ? (

                                  <div>
                                    <p className="font-semibold mint-text-primary">
                                      {
                                        movimiento.pago
                                          .comision_doctor_metodo_pago ||
                                        "Registrado"
                                      }
                                    </p>

                                    <p className="text-xs mint-text-muted mt-1">
                                      $
                                      {
                                        formatoMonto(
                                          movimiento.montoPagado
                                        )
                                      }
                                      {" "}
                                      {
                                        movimiento.pago
                                          .comision_doctor_pago_moneda ||
                                        movimiento.moneda
                                      }
                                    </p>

                                    <p className="text-xs mint-text-muted mt-1">
                                      {
                                        formatoFechaHora(
                                          movimiento.pago
                                            .comision_doctor_fecha_pago
                                        )
                                      }
                                    </p>
                                  </div>

                                )

                                : (

                                  <span className="text-xs mint-text-muted">
                                    {t("Sin liquidar", "Unpaid")}
                                  </span>

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

      </div>

      {/* =========================
          RESUMEN DEL CÁLCULO
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

            {t("Cálculo", "Calculation")}

          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >

            {t("Resumen de comisión", "Commission summary")}

          </h3>

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
              md:grid-cols-4
              gap-4
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                {t("Total cobrado", "Total collected")}

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  mint-text-primary
                "
              >
{mostrarMXN && (<> 

                $
                {
                  formatoMonto(
                    totalPagadoMXN
                  )
                }
                {" MXN"}

                 </>)}
{mostrarUSD && (<> 

                $
                {
                  formatoMonto(
                    totalPagadoUSD
                  )
                }
                {" USD"}

               </>)}
</p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                {t("Tratamientos finalizados", "Completed treatments")}

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[var(--mint-danger)]
                "
              >

                {
                  totalTratamientosFinalizados
                }

              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-border)]
                bg-[var(--mint-bg-soft)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                {t("Base clínica", "Clinic base")}

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[var(--mint-info)]
                "
              >
{mostrarMXN && (<> 

                $
                {
                  formatoMonto(
                    totalBaseClinicaMXN
                  )
                }
                {" MXN"}

                 </>)}
{mostrarUSD && (<> 

                $
                {
                  formatoMonto(
                    totalBaseClinicaUSD
                  )
                }
                {" USD"}

               </>)}
</p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-[var(--mint-success-border)]
                bg-[var(--mint-success-bg)]
                p-4
              "
            >

              <p
                className="
                  text-xs
                  text-[var(--mint-success)]
                "
              >

                Comisión
                {" "}
                {
                  Number(
                    doctor.porcentaje || 0
                  )
                }
                %

              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-[var(--mint-success)]
                "
              >
{mostrarMXN && (<> 

                $
                {
                  formatoMonto(
                    totalComisionMXN
                  )
                }
                {" MXN"}

                 </>)}
{mostrarUSD && (<> 

                $
                {
                  formatoMonto(
                    totalComisionUSD
                  )
                }
                {" USD"}

               </>)}
</p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}