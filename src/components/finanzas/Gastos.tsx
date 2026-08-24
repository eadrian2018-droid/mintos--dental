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
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
          "
        >

          Gastos

        </h2>

        <p
          className="
            text-slate-500
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
            bg-slate-50
            rounded-2xl
            p-4
          "
        >

          <p className="text-slate-500">

            Total Gastos

          </p>

          <h3
            className="
              text-2xl
              font-bold
              text-red-600
            "
          >

            $

            {total.toLocaleString()}

          </h3>

        </div>

        <div
          className="
            bg-slate-50
            rounded-2xl
            p-4
          "
        >

          <p className="text-slate-500">

            Cantidad de Gastos

          </p>

          <h3
            className="
              text-2xl
              font-bold
            "
          >

            {cantidad}

          </h3>

        </div>

      </div>

      <h3
        className="
          text-xl
          font-bold
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
            border
            rounded-xl
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
            border
            rounded-xl
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
            border
            rounded-xl
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
            border
            rounded-xl
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
            border
            rounded-xl
            p-3
            md:col-span-2
          "
        />

        <button
          onClick={guardarGasto}
          className="
            bg-teal-600
            text-white
            px-4
            py-3
            rounded-xl
            md:col-span-2
          "
        >

          Guardar gasto

        </button>

      </div>

      <h3
        className="
          text-xl
          font-bold
          mt-8
          mb-2
        "
      >

        Historial de Gastos

      </h3>

      <p
        className="
          text-slate-600
          mb-4
        "
      >

        Total de registros:

        <strong>

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
            w-full
            text-sm
          "
        >

          <thead>

            <tr
              className="
                border-b
                border-slate-200
              "
            >

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
                      border-b
                      border-slate-100
                    "
                  >

                    <td className="p-3">

                      {gasto.fecha}

                    </td>

                    <td className="p-3">

                      {gasto.concepto}

                    </td>

                    <td className="p-3">

                      {gasto.categoria}

                    </td>

                    <td className="p-3">

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
                          bg-red-600
                          text-white
                          px-3
                          py-1
                          rounded-lg
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

      <div
        className="
          bg-slate-50
          rounded-2xl
          p-6
          mt-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
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
                  py-2
                  border-b
                  border-slate-200
                "
              >

                <span>

                  {categoria}

                </span>

                <span
                  className="
                    font-semibold
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