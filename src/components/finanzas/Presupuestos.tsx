import {
  Eye,
  FileText,
  Plus,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { useLanguage } from "../../context/LanguageContext";

import type {
  Presupuesto,
} from "../../types/Presupuesto";

type PresupuestoConPaciente =
  Presupuesto & {
    paciente_nombre?: string;
  };

type PresupuestosProps = {
  presupuestos: PresupuestoConPaciente[];
  onNuevoPresupuesto?: () => void;
  onAbrirPresupuesto?: (
    presupuesto: PresupuestoConPaciente
  ) => void;
  puedeCrear?: boolean;
};

export default function Presupuestos({
  presupuestos,
  onNuevoPresupuesto,
  onAbrirPresupuesto,
  puedeCrear = false,
}: PresupuestosProps) {

  const { language } = useLanguage();
  const es = language === "es";

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const presupuestosFiltrados = useMemo(
    () => {
      const termino = busqueda
        .trim()
        .toLocaleLowerCase(
          es ? "es-MX" : "en-US"
        );

      if (!termino) {
        return presupuestos;
      }

      return presupuestos.filter(
        (presupuesto) => {
          const numeroPresupuesto =
            String(presupuesto.id);

          const nombrePaciente =
            (
              presupuesto.paciente_nombre ||
              presupuesto.nombre_paciente ||
              ""
            )
              .trim()
              .toLocaleLowerCase(
                es ? "es-MX" : "en-US"
              );

          return (
            numeroPresupuesto.includes(
              termino
            ) ||
            nombrePaciente.includes(
              termino
            )
          );
        }
      );
    },
    [
      busqueda,
      presupuestos,
      es,
    ]
  );

  const formatoMonto =
    (
      valor: number,
      moneda: "MXN" | "USD"
    ) =>
      `$${Number(
        valor || 0
      ).toLocaleString(
        "es-MX",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )} ${moneda}`;

  const formatoFecha =
    (
      fecha: string
    ) =>
      new Date(
        fecha
      ).toLocaleDateString(
        "es-MX",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

  const estadoClasses =
    (
      estado: Presupuesto["estado"]
    ) => {

      if (
        estado === "Convertido"
      ) {

        return `
          bg-[var(--mint-success-bg)]
          text-[var(--mint-success)]
          border
          border-[var(--mint-success-border)]
        `;

      }

      if (
        estado === "Enviado"
      ) {

        return `
          bg-[var(--mint-info-bg)]
          text-[var(--mint-info)]
          border
          border-[var(--mint-info-border)]
        `;

      }

      return `
        bg-[var(--mint-warning-bg)]
        text-[var(--mint-warning)]
        border
        border-[var(--mint-warning-border)]
      `;

    };

  return (

    <div
      className="
        space-y-6
      "
    >

      <section
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
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-brand
              "
            >
              Presupuestos
            </p>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                mint-text-primary
                mt-1
              "
            >
              Presupuestos de pacientes
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
                max-w-2xl
              "
            >
              Crea, consulta y administra propuestas
              de tratamiento antes de convertirlas
              en tratamientos activos.
            </p>

          </div>

          {
            puedeCrear && (
              <button
                type="button"
                onClick={
                  onNuevoPresupuesto
                }
                className="
                  mint-btn
                  mint-btn-primary
                  inline-flex
                  items-center
                  gap-2
                "
              >
                <Plus
                  size={17}
                />

                Nuevo presupuesto
              </button>
            )
          }

        </div>

      </section>


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
            border-b
            border-[var(--mint-border)]
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div>

            <h3
              className="
                text-lg
                font-bold
                mint-text-primary
              "
            >
              Historial de presupuestos
            </h3>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Presupuestos registrados en MintOS.
            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-2
              rounded-xl
              bg-[var(--mint-primary-soft)]
              border
              border-[var(--mint-border-primary)]
            "
          >

            <FileText
              size={15}
              className="
                text-[var(--mint-primary)]
              "
            />

            <span
              className="
                text-xs
                font-bold
                text-[var(--mint-primary)]
              "
            >
              {presupuestos.length}
            </span>

          </div>

        </div>

        {presupuestos.length > 0 && (
          <div
            className="
              px-6
              py-4
              border-b
              border-[var(--mint-border)]
              bg-[var(--mint-bg-soft)]
            "
          >
            <div
              className="
                relative
                w-full
                sm:max-w-sm
              "
            >
              <Search
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  mint-text-muted
                  pointer-events-none
                "
              />

              <input
                type="search"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                placeholder={
                  es
                    ? "Buscar por número o paciente..."
                    : "Search by number or patient..."
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                  pl-10
                  pr-4
                  py-2.5
                  text-sm
                  mint-text-primary
                  outline-none
                  transition
                  focus:border-[var(--mint-primary)]
                  focus:ring-2
                  focus:ring-[var(--mint-primary-soft)]
                "
              />
            </div>
          </div>
        )}

        {
          presupuestos.length === 0

            ? (

              <div
                className="
                  px-6
                  py-12
                  text-center
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-[var(--mint-primary-soft)]
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >

                  <FileText
                    size={22}
                    className="
                      text-[var(--mint-primary)]
                    "
                  />

                </div>

                <p
                  className="
                    mt-4
                    font-semibold
                    mint-text-primary
                  "
                >
                  No hay presupuestos registrados.
                </p>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-1
                  "
                >
                  Crea el primer presupuesto
                  para comenzar.
                </p>

              </div>

            )

            : presupuestosFiltrados.length === 0

            ? (

              <div
                className="
                  px-6
                  py-12
                  text-center
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-[var(--mint-primary-soft)]
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >
                  <Search
                    size={21}
                    className="
                      text-[var(--mint-primary)]
                    "
                  />
                </div>

                <p
                  className="
                    mt-4
                    font-semibold
                    mint-text-primary
                  "
                >
                  {es
                    ? "No encontramos presupuestos."
                    : "No estimates found."}
                </p>

                <p
                  className="
                    text-sm
                    mint-text-secondary
                    mt-1
                  "
                >
                  {es
                    ? "Prueba con otro número o nombre de paciente."
                    : "Try another estimate number or patient name."}
                </p>
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
                          text-xs
                          font-bold
                          mint-text-muted
                        "
                      >
                        Fecha
                      </th>

                      <th
                        className="
                          text-left
                          px-6
                          py-3
                          text-xs
                          font-bold
                          mint-text-muted
                        "
                      >
                        Paciente
                      </th>

                      <th
                        className="
                          text-left
                          px-6
                          py-3
                          text-xs
                          font-bold
                          mint-text-muted
                        "
                      >
                        Estado
                      </th>

                      <th
                        className="
                          text-left
                          px-6
                          py-3
                          text-xs
                          font-bold
                          mint-text-muted
                        "
                      >
                        Moneda
                      </th>

                      <th
                        className="
                          text-right
                          px-6
                          py-3
                          text-xs
                          font-bold
                          mint-text-muted
                        "
                      >
                        Total
                      </th>

                      <th
                        className="
                          text-right
                          px-6
                          py-3
                          text-xs
                          font-bold
                          mint-text-muted
                        "
                      >
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {
                      presupuestosFiltrados.map(
                        (
                          presupuesto
                        ) => (

                          <tr
                            key={
                              presupuesto.id
                            }
                            onDoubleClick={() =>
                              onAbrirPresupuesto?.(
                                presupuesto
                              )
                            }
                            className="
                              border-t
                              border-[var(--mint-border)]
                              hover:bg-[var(--mint-bg-soft)]
                              transition-colors
                            "
                          >

                            <td
                              className="
                                px-6
                                py-4
                                whitespace-nowrap
                                mint-text-secondary
                              "
                            >
                              {
                                formatoFecha(
                                  presupuesto.fecha
                                )
                              }
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >

                              <p
                                className="
                                  font-semibold
                                  mint-text-primary
                                "
                              >
                                {
                                  presupuesto
                                    .paciente_nombre ||
                                  `Paciente #${presupuesto.paciente_id}`
                                }
                              </p>

                            </td>

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >

                              <span
                                className={`
                                  inline-flex
                                  px-2.5
                                  py-1
                                  rounded-lg
                                  text-[11px]
                                  font-bold

                                  ${
                                    estadoClasses(
                                      presupuesto.estado
                                    )
                                  }
                                `}
                              >
                                {
                                  presupuesto.estado
                                }
                              </span>

                            </td>

                            <td
                              className="
                                px-6
                                py-4
                                font-semibold
                                mint-text-secondary
                              "
                            >
                              {
                                presupuesto.moneda
                              }
                            </td>

                            <td
                              className="
                                px-6
                                py-4
                                text-right
                                font-bold
                                mint-text-primary
                                whitespace-nowrap
                              "
                            >
                              {
                                formatoMonto(
                                  presupuesto.total,
                                  presupuesto.moneda
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

                              <button
                                type="button"
                                onClick={() =>
                                  onAbrirPresupuesto?.(
                                    presupuesto
                                  )
                                }
                                className="
                                  mint-btn
                                  inline-flex
                                  items-center
                                  gap-2
                                "
                              >
                                <Eye
                                  size={15}
                                />

                                Ver
                              </button>

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

      </section>

    </div>

  );

}