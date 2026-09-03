import type {
  Doctor,
} from "../types/Doctor";

import type {
  Paciente,
} from "../types/Paciente";

import type {
  Tratamiento,
} from "../types/Tratamiento";

type DoctorDetalleProps = {

  doctor: Doctor | null;

  pacientes: Paciente[];

  tratamientos: Tratamiento[];

  onClose: () => void;

};

export default function DoctorDetalle({

  doctor,

  pacientes,

  tratamientos,

  onClose,

}: DoctorDetalleProps) {

  if (!doctor) {

    return null;

  }

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
          "es-MX",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
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

        const pagado =
          Number(
            tratamiento.pago || 0
          );

        const laboratorio =
          Number(
            tratamiento.laboratorio || 0
          );

        const especialista =
          Number(
            tratamiento.especialista || 0
          );

        const comisionBanco =
          Number(
            tratamiento.comision_banco || 0
          );

        const baseClinica =
          pagado
          -
          laboratorio
          -
          especialista
          -
          comisionBanco;

        const porcentaje =
          Number(
            doctor.porcentaje || 0
          );

        const comision =
          baseClinica *
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

          pagado,

          laboratorio,

          especialista,

          comisionBanco,

          baseClinica,

          comision,

        };

      }
    );

  const totalPagado =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.pagado,
      0
    );

  const totalDescuentos =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.laboratorio +
        detalle.especialista +
        detalle.comisionBanco,
      0
    );

  const totalBaseClinica =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.baseClinica,
      0
    );

  const totalComision =
    detalleTratamientos.reduce(
      (
        total,
        detalle
      ) =>
        total +
        detalle.comision,
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

                  Detalle de comisión

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

                  Comisión

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

              Cerrar

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

              Vinculados al doctor

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

              Total cobrado

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-info)]
              "
            >

              $
              {
                formatoMonto(
                  totalPagado
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

              MXN registrados

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

              Base clínica

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-accent)]
              "
            >

              $
              {
                formatoMonto(
                  totalBaseClinica
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

              Después de costos y comisiones

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

              Comisión doctor

            </p>

            <h3
              className="
                text-2xl
                font-bold
                mt-2
                text-[var(--mint-success)]
              "
            >

              $
              {
                formatoMonto(
                  totalComision
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

              Comisión calculada

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

              Movimientos clínicos

            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >

              Detalle de tratamientos

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

                ? "tratamiento"

                : "tratamientos"
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

                  Paciente

                </th>

                <th
                  className="
                    p-4
                    text-left
                  "
                >

                  Tratamiento

                </th>

                <th
                  className="
                    p-4
                    text-right
                  "
                >

                  Pagado

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
                      pagado,
                      baseClinica,
                      comision,
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
                              "Sin paciente"
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

                          <span
                            className="
                              font-semibold
                              mint-text-primary
                            "
                          >

                            $
                            {
                              formatoMonto(
                                pagado
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

                            MXN

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
                              text-[var(--mint-info)]
                            "
                          >

                            $
                            {
                              formatoMonto(
                                baseClinica
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

                            MXN

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
                              text-[var(--mint-success)]
                            "
                          >

                            $
                            {
                              formatoMonto(
                                comision
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

                            MXN

                          </span>

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

            Cálculo

          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >

            Resumen de comisión

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

                Total cobrado

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  mint-text-primary
                "
              >

                $
                {
                  formatoMonto(
                    totalPagado
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
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                Costos descontados

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[var(--mint-danger)]
                "
              >

                -$
                {
                  formatoMonto(
                    totalDescuentos
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
                p-4
              "
            >

              <p
                className="
                  text-xs
                  mint-text-muted
                "
              >

                Base clínica

              </p>

              <p
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-[var(--mint-info)]
                "
              >

                $
                {
                  formatoMonto(
                    totalBaseClinica
                  )
                }

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

                $
                {
                  formatoMonto(
                    totalComision
                  )
                }

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}