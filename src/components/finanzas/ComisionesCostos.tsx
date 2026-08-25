import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
} from "../../types/TratamientoCatalogo";

type ComisionesCostosProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

};

export default function ComisionesCostos({

  doctores,

  catalogoTratamientos,

}: ComisionesCostosProps) {

  const tratamientosEspecialistas =
    catalogoTratamientos.filter(
      (tratamiento) =>
        tratamiento.tipo ===
        "especialista"
    );

  return (

    <div
      className="
        space-y-6
      "
    >

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

          Comisiones y Costos

        </h2>

        <p
          className="
            text-slate-500
            mt-2
          "
        >

          Resumen de comisiones
          de doctores y costos
          configurados para
          especialistas.

        </p>

      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
        "
      >

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p
            className="
              text-slate-500
            "
          >

            Doctores configurados

          </p>

          <h3
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            {doctores.length}

          </h3>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p
            className="
              text-slate-500
            "
          >

            Tratamientos de especialista

          </p>

          <h3
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            {
              tratamientosEspecialistas
                .length
            }

          </h3>

        </div>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mb-2
          "
        >

          Comisión por Doctor

        </h3>

        <p
          className="
            text-slate-500
            mb-6
          "
        >

          Este porcentaje se utiliza
          para calcular la comisión
          correspondiente al doctor.

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

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Doctor

                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Especialidad

                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Comisión

                </th>

              </tr>

            </thead>

            <tbody>

              {

                doctores.map(
                  (doctor) => (

                    <tr
                      key={
                        doctor.id
                      }
                      className="
                        border-b
                        border-slate-100
                      "
                    >

                      <td
                        className="
                          p-3
                        "
                      >

                        {
                          doctor.nombre
                        }

                      </td>

                      <td
                        className="
                          p-3
                        "
                      >

                        {
                          doctor
                            .especialidad
                        }

                      </td>

                      <td
                        className="
                          p-3
                          font-semibold
                        "
                      >

                        {
                          doctor
                            .porcentaje
                        }%

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
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mb-2
          "
        >

          Costos de Especialistas

        </h3>

        <p
          className="
            text-slate-500
            mb-6
          "
        >

          Estos costos se descuentan
          del pago del tratamiento
          para calcular la base
          real de la clínica.

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

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Tratamiento

                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Categoría

                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Especialista

                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Costo MXN

                </th>

                <th
                  className="
                    p-3
                    text-left
                  "
                >

                  Costo USD

                </th>

              </tr>

            </thead>

            <tbody>

              {

                tratamientosEspecialistas
                  .map(
                    (
                      tratamiento
                    ) => {

                      const doctor =
                        doctores.find(
                          (item) =>
                            item.id ===
                            tratamiento
                              .doctor_id
                        );

                      return (

                        <tr
                          key={
                            tratamiento.id
                          }
                          className="
                            border-b
                            border-slate-100
                          "
                        >

                          <td
                            className="
                              p-3
                            "
                          >

                            {
                              tratamiento
                                .nombre
                            }

                          </td>

                          <td
                            className="
                              p-3
                            "
                          >

                            {
                              tratamiento
                                .categoria
                            }

                          </td>

                          <td
                            className="
                              p-3
                            "
                          >

                            {
                              doctor
                                ?.nombre
                                ||
                              "Sin asignar"
                            }

                          </td>

                          <td
                            className="
                              p-3
                              font-semibold
                            "
                          >

                            $

                            {
                              Number(
                                tratamiento
                                  .costo_especialista_mxn
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>

                          <td
                            className="
                              p-3
                              font-semibold
                            "
                          >

                            $

                            {
                              Number(
                                tratamiento
                                  .costo_especialista_usd
                                || 0
                              )
                                .toLocaleString()
                            }

                          </td>

                        </tr>

                      );

                    }
                  )

              }

              {
                tratamientosEspecialistas
                  .length === 0

                &&

                <tr>

                  <td
                    colSpan={5}
                    className="
                      p-6
                      text-center
                      text-slate-500
                    "
                  >

                    No hay tratamientos
                    de especialista
                    configurados.

                  </td>

                </tr>
              }

            </tbody>

          </table>

        </div>

      </div>

      <div
        className="
          bg-slate-50
          border
          border-slate-200
          rounded-2xl
          p-6
        "
      >

        <h3
          className="
            font-bold
            text-lg
            mb-3
          "
        >

          Regla de cálculo

        </h3>

        <p
          className="
            text-slate-600
            leading-7
          "
        >

          La base de la clínica se
          calcula tomando el monto
          pagado y descontando los
          costos asociados al
          tratamiento, como
          laboratorio, especialista
          y comisión bancaria.

          {" "}

          Después se calcula la
          comisión correspondiente
          al doctor sobre esa base.

        </p>

      </div>

    </div>

  );

}