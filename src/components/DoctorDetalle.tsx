type DoctorDetalleProps = {
  doctor: any;
  pacientes: any[];
  tratamientos: any[];
  onClose: () => void;
};

export default function DoctorDetalle({
  doctor,
  pacientes,
  tratamientos,
  onClose,
  
}: DoctorDetalleProps) {

  if (!doctor) return null;

  return (

    <div
      className="
        bg-white
        rounded-3xl
        shadow-lg
        p-6
        mt-6
      "
    >

      <div
        className="
          flex
          justify-between
          items-center
          mb-4
        "
      >

        <h3
          className="
            text-xl
            font-bold
          "
        >

          Detalle de {doctor.nombre}

        </h3>

        <button

          onClick={onClose}

          className="
            bg-red-500
            hover:bg-red-600
            text-white
            px-4
            py-2
            rounded-lg
          "

        >

          Cerrar

        </button>

      </div>

      <div
        className="
          overflow-x-auto
          mt-6
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
                Paciente
              </th>

              <th className="p-3 text-left">
                Tratamiento
              </th>

              <th className="p-3 text-left">
                Pagado
              </th>

              <th className="p-3 text-left">
                Base Clínica
              </th>

              <th className="p-3 text-left">
                Comisión
              </th>

            </tr>

          </thead>

          <tbody>

                      {

            tratamientos

              .filter(
                (t: any) =>
                  t.doctor_id ===
                  doctor.id
              )

              .map(
                (t: any) => {

                  const baseClinica =

                    Number(
                      t.pago || 0
                    )

                    -

                    Number(
                      t.laboratorio || 0
                    )

                    -

                    Number(
                      t.especialista || 0
                    )

                    -

                    Number(
                      t.comision_banco || 0
                    );

                  const comision =

                    baseClinica *

                    Number(
                      doctor.porcentaje || 0
                    ) /

                    100;

                  return (

                    <tr
                      key={t.id}
                      className="
                        border-b
                        border-slate-100
                      "
                    >

                      <td className="p-3">

                        {t.fecha}

                      </td>

                      <td className="p-3">

                        {

                          pacientes.find(
                            (p: any) =>
                              p.id ===
                              t.paciente_id
                          )?.nombre ||

                          "-"

                        }

                      </td>

                      <td className="p-3">

                        {t.tratamiento}

                      </td>

                      <td className="p-3">

                        $

                        {Number(
                          t.pago || 0
                        ).toLocaleString()}

                      </td>

                      <td className="p-3">

                        $

                        {baseClinica.toLocaleString()}

                      </td>

                      <td
                        className="
                          p-3
                          font-bold
                          text-green-600
                        "
                      >

                        $

                        {comision.toLocaleString()}

                      </td>

                    </tr>

                  );

                }

              )

          }

          </tbody>

        </table>

      </div>

      <div
        className="
          grid
          md:grid-cols-4
          gap-4
          mt-6
        "
      >

        <div
          className="
            bg-slate-50
            rounded-xl
            p-4
          "
        >

          <p className="text-slate-500">

            Tratamientos

          </p>

          <h3 className="text-2xl font-bold">

            {

              tratamientos.filter(
                (t: any) =>
                  t.doctor_id ===
                  doctor.id
              ).length

            }

          </h3>

        </div>

      </div>

    </div>

  );

}