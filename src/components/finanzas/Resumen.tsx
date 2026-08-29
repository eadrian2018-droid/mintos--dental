import type { Paciente } from "../../types/Paciente";
import type { Tratamiento } from "../../types/Tratamiento";

type ResumenProps = {
  ingresos: number;
  cobrado: number;
  pendiente: number;
  gananciaNeta: number;

  totalGastos: number;
  totalBaseClinica: number;
  totalComisionesDoctor: number;

  cajaMXN: number;
  cajaUSD: number;

  totalTarjeta: number;
  totalTransferencia: number;

  pacientes: Paciente[];

  tratamientosFiltrados: Tratamiento[];
};

export default function Resumen({
  ingresos,
  cobrado,
  pendiente,
  gananciaNeta,

  totalGastos,
  totalBaseClinica,
  totalComisionesDoctor,

  cajaMXN,
  cajaUSD,

  totalTarjeta,
  totalTransferencia,
  pacientes,

  tratamientosFiltrados,
}: ResumenProps) {
  return (
    <>
      <h2
        className="
          text-xl
          font-bold
          mint-text-primary
          mb-4
        "
      >
        Resumen Financiero
      </h2>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          gap-6
          mb-8
        "
      >
        <div
          className="
            mint-card-primary
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Ingresos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-primary)]
            "
          >
            ${ingresos.toLocaleString()}
          </h2>
        </div>

        <div
          className="
            mint-card-success
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Cobrado
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-success)]
            "
          >
            ${cobrado.toLocaleString()}
          </h2>
        </div>

        <div
          className="
            mint-card-danger
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Pendiente
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-danger)]
            "
          >
            ${pendiente.toLocaleString()}
          </h2>
        </div>

        <div
          className="
            mint-card-success
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Ganancia Neta
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-success)]
            "
          >
            ${gananciaNeta.toLocaleString()}
          </h2>
        </div>

        <div
          className="
            md:col-span-2
            lg:col-span-4
            mt-2
            mb-2
          "
        >
          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Indicadores Operativos
          </h2>
        </div>

        <div
          className="
            mint-card-accent
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Tratamientos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              mint-text-accent
            "
          >
            {tratamientosFiltrados.length}
          </h2>
        </div>

        <div
          className="
            mint-card-danger
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Gastos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-danger)]
            "
          >
            ${totalGastos.toLocaleString()}
          </h2>
        </div>

        <div
          className="
            mint-card-info
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Base Clínica
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-info)]
            "
          >
            ${totalBaseClinica.toLocaleString()}
          </h2>
        </div>

        <div
          className="
            mint-card-warning
            p-6
          "
        >
          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >
            Comisiones Doctores
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
              text-[var(--mint-warning)]
            "
          >
            ${totalComisionesDoctor.toLocaleString()}
          </h2>
        </div>
      </div>

      <div
        className="
          mint-card
          p-6
        "
      >
        <div
          className="
            bg-[var(--mint-bg-soft)]
            border
            border-[var(--mint-border)]
            rounded-2xl
            p-6
            mb-6
          "
        >
          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
              mb-4
            "
          >
            Corte de Caja
          </h3>

          <div
            className="
              grid
              md:grid-cols-2
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-sm
                  mint-text-secondary
                "
              >
                Caja MXN
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-success)]
                "
              >
                ${cajaMXN.toLocaleString()}
              </p>
            </div>

            <div>
              <p
                className="
                  text-sm
                  mint-text-secondary
                "
              >
                Caja USD
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-info)]
                "
              >
                ${cajaUSD.toLocaleString()}
              </p>
            </div>

            <div>
              <p
                className="
                  text-sm
                  mint-text-secondary
                "
              >
                Tarjetas
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mint-text-primary
                "
              >
                ${totalTarjeta.toLocaleString()}
              </p>
            </div>

            <div>
              <p
                className="
                  text-sm
                  mint-text-secondary
                "
              >
                Transferencias
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mint-text-primary
                "
              >
                ${totalTransferencia.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <h2
          className="
            text-2xl
            font-bold
            mint-text-primary
            mb-6
          "
        >
          Movimientos
        </h2>

        <div className="overflow-x-auto">
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
                <th className="p-3 text-left">
                  Fecha
                </th>

                <th className="p-3 text-left">
                  Paciente
                </th>

                <th className="p-3 text-left">
                  Tratamiento
                </th>

                <th className="p-3 text-left">
                  Total
                </th>

                <th className="p-3 text-left">
                  Pagado
                </th>

                <th className="p-3 text-left">
                  Pendiente
                </th>
              </tr>
            </thead>

            <tbody>
              {tratamientosFiltrados.map((item) => {
                const paciente =
                  pacientes.find(
                    (p) =>
                      p.id ===
                      item.paciente_id
                  );

                return (
                  <tr
                    key={item.id}
                    className="
                      mint-table-row
                    "
                  >
                    <td className="p-3">
                      {item.fecha}
                    </td>

                    <td className="p-3">
                      {paciente?.nombre || "-"}
                    </td>

                    <td className="p-3">
                      {item.tratamiento}
                    </td>

                    <td className="p-3">
                      $
                      {Number(
                        item.total || 0
                      ).toLocaleString()}
                    </td>

                    <td
                      className="
                        p-3
                        text-[var(--mint-success)]
                        font-medium
                      "
                    >
                      $
                      {Number(
                        item.pago || 0
                      ).toLocaleString()}
                    </td>

                    <td
                      className="
                        p-3
                        text-[var(--mint-danger)]
                        font-medium
                      "
                    >
                      $
                      {Number(
                        item.resta || 0
                      ).toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              <tr
                className="
                  bg-[var(--mint-bg-soft)]
                  font-bold
                  border-t-2
                  border-[var(--mint-border-strong)]
                  mint-text-primary
                "
              >
                <td
                  className="p-3"
                  colSpan={3}
                >
                  TOTAL GENERAL
                </td>

                <td className="p-3">
                  ${ingresos.toLocaleString()}
                </td>

                <td
                  className="
                    p-3
                    text-[var(--mint-success)]
                  "
                >
                  ${cobrado.toLocaleString()}
                </td>

                <td
                  className="
                    p-3
                    text-[var(--mint-danger)]
                  "
                >
                  ${pendiente.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}