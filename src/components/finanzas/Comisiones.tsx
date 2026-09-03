import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  Tratamiento,
} from "../../types/Tratamiento";

type PagoComision = {

  id?: number;

  tratamiento_id?: number;

  moneda?: string;

  monto_original?: number;

  comision_banco?: number;

};

type ComisionesProps = {

  doctores: Doctor[];

  tratamientos: Tratamiento[];

  pagos?: PagoComision[];

  setDoctorDetalle:
    Dispatch<
      SetStateAction<
        Doctor | null
      >
    >;

  setMostrarDetalleDoctor:
    Dispatch<
      SetStateAction<boolean>
    >;

};

export default function Comisiones({

  doctores,

  tratamientos,

  pagos = [],

  setDoctorDetalle,

  setMostrarDetalleDoctor,

}: ComisionesProps) {

  const formatoMonto =
    (
      monto: number
    ) =>
      monto.toLocaleString(
        "es-MX",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
  const resumenDoctores =
    doctores.map(
      (doctor) => {

        const tratamientosDoctor =
          tratamientos.filter(
            (tratamiento) =>
              tratamiento.doctor_id ===
              doctor.id
          );

        const tratamientosFinalizados =
          tratamientosDoctor.filter(
            (tratamiento) =>
              tratamiento.estado ===
              "Finalizado"
          );

        const idsTratamientosFinalizados =
          new Set(
            tratamientosFinalizados.map(
              (tratamiento) =>
                tratamiento.id
            )
          );

        const pagosDoctor =
          pagos.filter(
            (pago) =>
              pago.tratamiento_id !==
                undefined
              &&
              idsTratamientosFinalizados.has(
                pago.tratamiento_id
              )
          );

        const porcentaje =
          Number(
            doctor.porcentaje || 0
          );

        /*
        |--------------------------------------------------------------------------
        | MXN
        |--------------------------------------------------------------------------
        */

        const baseClinicaMXN =
          pagosDoctor
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

        const comisionMXN =
          baseClinicaMXN *
          porcentaje /
          100;

        /*
        |--------------------------------------------------------------------------
        | USD
        |--------------------------------------------------------------------------
        */

        const baseClinicaUSD =
          pagosDoctor
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

        const comisionUSD =
          baseClinicaUSD *
          porcentaje /
          100;

        return {

          doctor,

          tratamientosDoctor,

          tratamientosFinalizados,

          porcentaje,

          baseClinicaMXN,

          baseClinicaUSD,

          comisionMXN,

          comisionUSD,

        };

      }
    );

  const totalBaseClinicaMXN =
    resumenDoctores.reduce(
      (
        total,
        doctor
      ) =>
        total +
        doctor.baseClinicaMXN,
      0
    );

  const totalBaseClinicaUSD =
    resumenDoctores.reduce(
      (
        total,
        doctor
      ) =>
        total +
        doctor.baseClinicaUSD,
      0
    );

  const totalComisionesMXN =
    resumenDoctores.reduce(
      (
        total,
        doctor
      ) =>
        total +
        doctor.comisionMXN,
      0
    );

  const totalComisionesUSD =
    resumenDoctores.reduce(
      (
        total,
        doctor
      ) =>
        total +
        doctor.comisionUSD,
      0
    );

  const totalTratamientos =
    resumenDoctores.reduce(
      (
        total,
        doctor
      ) =>
        total +
        doctor.tratamientosDoctor.length,
      0
    );

  return (

    <div
      className="
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
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  border
                  border-[var(--mint-border-primary)]
                  px-3
                  py-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                "
              >

                Honorarios médicos

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

              Comisiones por doctor

            </h2>

            <p
              className="
                mt-2
                text-sm
                mint-text-secondary
                max-w-2xl
              "
            >

              Consulta la base clínica generada
              por cada doctor y la comisión
              correspondiente según su porcentaje.

            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              gap-3
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

                Doctores

              </p>

              <p
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                "
              >

                {
                  doctores.length
                }

              </p>

            </div>

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

              Base clínica

            </p>

            <h3
              className="
                text-3xl
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

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              Ingreso considerado para comisión

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

              Comisiones

            </p>

            <h3
              className="
                text-3xl
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

                <span>
                  $
                  {
                    formatoMonto(
                      totalComisionesMXN
                    )
                  }
                  {" "}
                  MXN
                </span>

                <span
                  className="
                    text-lg
                    mint-text-secondary
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalComisionesUSD
                    )
                  }
                  {" "}
                  USD
                </span>

              </div>

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              Total calculado para doctores

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

              Tratamientos

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
                totalTratamientos
              }

            </h3>

            <p
              className="
                text-xs
                mint-text-muted
                mt-2
              "
            >

              Tratamientos vinculados a doctores

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          TABLA DE COMISIONES
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

              Desglose

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              Comisiones por doctor

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
              doctores.length
            }
            {" "}
            {
              doctores.length ===
              1

                ? "doctor"

                : "doctores"
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

                  Doctor

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  %

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  Tratamientos

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  Base clínica

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  Comisión

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  Detalle

                </th>

              </tr>

            </thead>

            <tbody>

              {

                resumenDoctores.length ===
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

                        No hay doctores registrados
                        para mostrar.

                      </td>

                    </tr>

                  )

                  : resumenDoctores.map(
                    ({
                      doctor,
                      tratamientosDoctor,
                      porcentaje,
                      baseClinicaMXN,
                      baseClinicaUSD,
                      comisionMXN,
                      comisionUSD,
                    }) => (

                      <tr
                        key={
                          doctor.id
                        }
                        className="
                          mint-table-row
                        "
                      >

                        <td
                          className="
                            p-4
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
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
                                bg-[var(--mint-primary-soft)]
                                text-[var(--mint-primary)]
                                font-bold
                                border
                                border-[var(--mint-border-primary)]
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

                              <p
                                className="
                                  font-semibold
                                  mint-text-primary
                                "
                              >

                                {
                                  doctor.nombre
                                }

                              </p>

                              <p
                                className="
                                  text-xs
                                  mint-text-muted
                                  mt-0.5
                                "
                              >

                                Doctor clínico

                              </p>

                            </div>

                          </div>

                        </td>

                        <td
                          className="
                            p-4
                          "
                        >

                          <span
                            className="
                              mint-badge
                              mint-badge-accent
                            "
                          >

                            {
                              porcentaje
                            }
                            %

                          </span>

                        </td>

                        <td
                          className="
                            p-4
                            mint-text-secondary
                          "
                        >

                          <span
                            className="
                              inline-flex
                              items-center
                              justify-center
                              min-w-[38px]
                              h-8
                              px-2
                              rounded-lg
                              bg-[var(--mint-bg-soft)]
                              border
                              border-[var(--mint-border)]
                              font-semibold
                              mint-text-primary
                            "
                          >

                            {
                              tratamientosDoctor.length
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

                          <div
                            className="
                              flex
                              flex-col
                              items-end
                              gap-1
                            "
                          >

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

                          </div>

                        </td>

                        <td
                          className="
                            p-4
                            text-right
                          "
                        >

                          <button
                            type="button"
                            onClick={() => {

                              setDoctorDetalle(
                                doctor
                              );

                              setMostrarDetalleDoctor(
                                true
                              );

                            }}
                            className="
                              mint-btn
                              mint-btn-action
                              mint-btn-sm
                            "
                          >

                            Ver detalle

                          </button>

                        </td>

                      </tr>

                    )
                  )

              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}