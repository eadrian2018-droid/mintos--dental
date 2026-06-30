type ComisionesProps = {

  doctores: any[];

  tratamientos: any[];

  setDoctorDetalle: React.Dispatch<React.SetStateAction<any>>;

  setMostrarDetalleDoctor: React.Dispatch<React.SetStateAction<boolean>>;

};

export default function Comisiones({

  doctores,

  tratamientos,

  setDoctorDetalle,

  setMostrarDetalleDoctor,

}: ComisionesProps) {

  return (

    <div
      className="
        bg-white
        rounded-3xl
        shadow-lg
        p-6
        mb-6
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Comisiones por Doctor

      </h2>

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

                Doctor

              </th>

              <th className="p-3 text-left">

                %

              </th>

              <th className="p-3 text-left">

                Tratamientos

              </th>

              <th className="p-3 text-left">

                Base Clínica

              </th>

              <th className="p-3 text-left">

                Comisión

              </th>

              <th className="p-3 text-left">

                Detalle

              </th>

            </tr>

          </thead>

          <tbody>

            {

              doctores.map(

                (

                  doctor: any

                ) => {

                  const tratamientosDoctor =

                    tratamientos.filter(

                      (

                        t: any

                      ) =>

                        t.doctor_id === doctor.id

                    );

                  const baseClinica =

                    tratamientosDoctor.reduce(

                      (

                        total: number,

                        t: any

                      ) =>

                        total +

                        (

                          Number(t.pago || 0)

                          -

                          Number(t.laboratorio || 0)

                          -

                          Number(t.especialista || 0)

                          -

                          Number(t.comision_banco || 0)

                        ),

                      0

                    );

                  const comision =

                    baseClinica *

                    Number(

                      doctor.porcentaje || 0

                    ) /

                    100;

                  return (

                    <tr

                      key={doctor.id}

                      className="
                        border-b
                        border-slate-100
                      "

                    >

                      <td className="p-3">

                        {doctor.nombre}

                      </td>

                      <td className="p-3">

                        {doctor.porcentaje}%

                      </td>

                      <td className="p-3">

                        {tratamientosDoctor.length}

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

                      <td className="p-3">

                        <button

                          onClick={() => {

                            setDoctorDetalle(

                              doctor

                            );

                            setMostrarDetalleDoctor(

                              true

                            );

                          }}

                          className="
                            bg-blue-500
                            hover:bg-blue-600
                            text-white
                            px-3
                            py-1
                            rounded-lg
                            text-sm
                          "

                        >

                          Ver Detalle

                        </button>

                      </td>

                    </tr>

                  );

                }

              )

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}