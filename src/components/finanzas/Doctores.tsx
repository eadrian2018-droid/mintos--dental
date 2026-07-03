type DoctoresProps = {

  doctores: any[];

  nombreDoctor: string;
  setNombreDoctor: React.Dispatch<React.SetStateAction<string>>;

  especialidadDoctor: string;
  setEspecialidadDoctor: React.Dispatch<React.SetStateAction<string>>;

  porcentajeDoctor: string;
  setPorcentajeDoctor: React.Dispatch<React.SetStateAction<string>>;

  guardarDoctor: () => void;

  setDoctorDetalle: React.Dispatch<any>;

};

export default function Doctores({

  doctores,

  nombreDoctor,
  setNombreDoctor,

  especialidadDoctor,
  setEspecialidadDoctor,

  porcentajeDoctor,
  setPorcentajeDoctor,

  guardarDoctor,

  setDoctorDetalle,

}: DoctoresProps) {

  return (

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
          mb-6
        "
      >

        Doctores

      </h2>

      <div
        className="
          grid
          md:grid-cols-3
          gap-4
          mb-6
        "
      >

        <input
          type="text"
          placeholder="Nombre"
          value={nombreDoctor}
          onChange={(e) =>
            setNombreDoctor(
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
          placeholder="Especialidad"
          value={especialidadDoctor}
          onChange={(e) =>
            setEspecialidadDoctor(
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
          type="number"
          placeholder="% Comisión"
          value={porcentajeDoctor}
          onChange={(e) =>
            setPorcentajeDoctor(
              e.target.value
            )
          }
          className="
            border
            rounded-xl
            p-3
          "
        />

      </div>

      <button
        onClick={guardarDoctor}
        className="
          bg-teal-600
          text-white
          px-4
          py-3
          rounded-xl
          mb-6
        "
      >

        Guardar Doctor

      </button>

      <div
  className="
    mt-8
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

          Nombre

        </th>

        <th className="p-3 text-left">

          Especialidad

        </th>

        <th className="p-3 text-left">

          %

        </th>

        <th className="p-3 text-left">

          Acción

        </th>

      </tr>

    </thead>

    <tbody>

      {

        doctores.map(
          (doctor: any) => (

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

                {doctor.especialidad}

              </td>

              <td className="p-3">

                {doctor.porcentaje}%

              </td>

              <td className="p-3">

                <button

                  onClick={() =>
                    setDoctorDetalle(
                      doctor
                    )
                  }

                  className="
                    bg-blue-500
                    hover:bg-blue-600
                    text-white
                    px-3
                    py-1
                    rounded-lg
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

      <table
        className="
          w-full
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

              Nombre

            </th>

            <th className="p-3 text-left">

              Especialidad

            </th>

            <th className="p-3 text-left">

              %

            </th>

          </tr>

        </thead>

        <tbody>

          {

            doctores.map(
              (
                doctor: any
              ) => (

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

                    {doctor.especialidad}

                  </td>

                  <td className="p-3">

                    {doctor.porcentaje}%

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

    </div>

  );

}