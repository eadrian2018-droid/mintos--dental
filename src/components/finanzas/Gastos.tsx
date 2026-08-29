import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Gasto,
} from "../../types/Gasto";

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

  notasGasto,
  setNotasGasto,

  guardarGasto,

  gastosFiltrados,

  eliminarGasto,

  gastosPorCategoria,

}: GastosProps) {

  return (

    <div className="space-y-6">

      <div
        className="
          mint-card
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mint-text-primary
          "
        >

          Gastos

        </h2>

        <p
          className="
            mint-text-secondary
            mt-1
          "
        >

          Control y administración de gastos operativos

        </p>

      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-4
        "
      >

        <div
          className="
            mint-card-danger
            p-4
          "
        >

          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >

            Total Gastos

          </p>

          <h3
            className="
              text-2xl
              font-bold
              text-[var(--mint-danger)]
              mt-1
            "
          >

            $

            {total.toLocaleString()}

          </h3>

        </div>

        <div
          className="
            mint-card-accent
            p-4
          "
        >

          <p
            className="
              text-sm
              font-medium
              mint-text-secondary
            "
          >

            Cantidad de Gastos

          </p>

          <h3
            className="
              text-2xl
              font-bold
              mint-text-accent
              mt-1
            "
          >

            {cantidad}

          </h3>

        </div>

      </div>

      <div
        className="
          mint-card
          p-6
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

          Nuevo Gasto

        </h3>

        <div
          className="
            grid
            md:grid-cols-2
            gap-4
          "
        >

          <input
            type="date"
            value={fechaGasto}
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

          <input
            type="text"
            placeholder="Concepto"
            value={conceptoGasto}
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

          <select
            value={categoriaGasto}
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

          <input
            type="number"
            placeholder="Monto"
            value={montoGasto}
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

          <textarea
            placeholder="Notas"
            value={notasGasto}
            onChange={(e) =>
              setNotasGasto(
                e.target.value
              )
            }
            className="
              mint-input
              w-full
              p-3
              md:col-span-2
              min-h-[110px]
              resize-y
            "
          />

          <button
            onClick={guardarGasto}
            className="
              mint-btn
              mint-btn-primary
              md:col-span-2
              justify-center
            "
          >

            Guardar gasto

          </button>

        </div>

      </div>

      <div
        className="
          mint-card
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mint-text-primary
            mb-2
          "
        >

          Historial de Gastos

        </h3>

        <p
          className="
            mint-text-secondary
            mb-4
          "
        >

          Total de registros:

          <strong
            className="
              mint-text-primary
            "
          >

            {" "}

            {gastosFiltrados.length}

          </strong>

        </p>

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

                <th className="p-3 text-left">

                  Fecha

                </th>

                <th className="p-3 text-left">

                  Concepto

                </th>

                <th className="p-3 text-left">

                  Categoría

                </th>

                <th className="p-3 text-left">

                  Monto

                </th>

                <th className="p-3 text-left">

                  Acción

                </th>

              </tr>

            </thead>

            <tbody>

              {

                gastosFiltrados.map(
                  (gasto) => (

                    <tr
                      key={gasto.id}
                      className="
                        mint-table-row
                      "
                    >

                      <td className="p-3">

                        {gasto.fecha}

                      </td>

                      <td className="p-3">

                        {gasto.concepto}

                      </td>

                      <td className="p-3">

                        <span
                          className="
                            mint-badge
                            mint-badge-muted
                          "
                        >

                          {gasto.categoria}

                        </span>

                      </td>

                      <td
                        className="
                          p-3
                          font-semibold
                          text-[var(--mint-danger)]
                        "
                      >

                        $

                        {Number(
                          gasto.monto
                        ).toLocaleString()}

                      </td>

                      <td className="p-3">

                        <button
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

                  )
                )

              }

            </tbody>

          </table>

        </div>

      </div>

      <div
        className="
          mint-card
          p-6
          mt-6
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

          Resumen por Categoría

        </h3>

        {

          Object.entries(
            gastosPorCategoria
          ).map(
            (
              [
                categoria,
                totalCategoria,
              ]
            ) => (

              <div
                key={categoria}
                className="
                  flex
                  justify-between
                  items-center
                  py-3
                  border-b
                  border-[var(--mint-border)]
                  last:border-b-0
                "
              >

                <span
                  className="
                    mint-text-secondary
                  "
                >

                  {categoria}

                </span>

                <span
                  className="
                    font-semibold
                    mint-text-primary
                  "
                >

                  $

                  {totalCategoria.toLocaleString()}

                </span>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}