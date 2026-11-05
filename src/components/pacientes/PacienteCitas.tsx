// Extraído de pacientesNEW.tsx, líneas 8601–8908.
// Mantener las operaciones de citas en el componente principal hasta integrar.

type PacienteCitasProps = {
  es: boolean;
  citas: any[];
  puedeEditarCitas: boolean;
  setMostrarModalCita: (mostrar: boolean) => void;
  textoEstado: (estado: any) => string;
  editarCita: (cita: any) => void;
  eliminarCita: (citaId: number) => void | Promise<void>;
};

export default function PacienteCitas({
  es,
  citas,
  puedeEditarCitas,
  setMostrarModalCita,
  textoEstado,
  editarCita,
  eliminarCita,
}: PacienteCitasProps) {
  return (
    <div className="
      rounded-[22px]
      border
      border-[var(--mint-border-teal)]
      bg-[var(--mint-surface-teal)]
      p-4
      shadow-[var(--mint-shadow-card)]
    ">

     <div className="
  flex
  justify-between
  items-center
  mb-6
">

  <h3 className="
    text-2xl
    font-bold
    mint-text-primary
  ">

    {es ? "Citas" : "Appointments"}

  </h3>

  {
    puedeEditarCitas && (

      <button

        onClick={() => {

          console.log(
            "CLICK CITA"
          );

          setMostrarModalCita(
            true
          );

        }}

        className="
          mint-btn
          mint-btn-primary
          px-4
          py-2
          text-sm
        "

      >

        {es ? "+ Agregar" : "+ Add"}

      </button>

    )
  }

</div>

      <div className="
        overflow-x-auto
        rounded-2xl
        border
        border-[var(--mint-border)]
        bg-[var(--mint-surface)]
      ">

        <table className="
          w-full
        ">

          <thead>

            <tr className="
              bg-[var(--mint-bg-soft)]
              border-b
              border-[var(--mint-border)]
            ">

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Fecha" : "Date"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Hora" : "Time"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Estado" : "Status"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Doctor" : "Doctor"}
              </th>

              <th className="
                p-3
                text-left
                text-sm
                font-semibold
                mint-text-secondary
              ">
                {es ? "Acciones" : "Actions"}
              </th>

            </tr>

          </thead>

          <tbody>

            {

              citas.length === 0

                ? (

                  <tr>

                    <td
                      colSpan={4}
                      className="
                        p-6
                        text-center
                        mint-text-secondary
                      "
                    >

                      {es ? "No hay citas registradas" : "No appointments recorded"}

                    </td>

                  </tr>

                )

                : citas.map(

                                    (cita: any) => (

                    <tr
                      key={cita.id}
                      className="
                        border-b
                        border-[var(--mint-border)]
                        hover:bg-[var(--mint-bg-soft)]
                        transition-colors
                      "
                    >

                      <td className="
                        p-3
                        mint-text-primary
                      ">

                        {
                          new Date(
                            cita.inicio
                          ).toLocaleDateString(
                            "es-MX"
                          )
                        }

                      </td>

                      <td className="
                        p-3
                        mint-text-primary
                      ">

                        {
                          new Date(
                            cita.inicio
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        }

                      </td>

                      <td className="
                        p-3
                        mint-text-secondary
                      ">

                        {textoEstado(cita.estado)}

                      </td>

                      <td className="
                        p-3
                        mint-text-primary
                      ">

                        {cita.doctor}

                      </td>

                      <td className="p-3">

                        <div className="
                          flex
                          gap-2
                        ">

                          {
                            puedeEditarCitas && (

                              <>

                                <button

                                  onClick={() =>
                                    editarCita(
                                      cita
                                    )
                                  }

                                  className="
                                    mint-btn
                                    mint-btn-secondary
                                    px-3
                                    py-1
                                    text-sm
                                  "

                                >

                                  {es ? "Editar" : "Edit"}

                                </button>

                                <button

                                  onClick={() =>
                                    eliminarCita(
                                      cita.id
                                    )
                                  }

                                  className="
                                    mint-btn
                                    mint-btn-danger
                                    px-3
                                    py-1
                                    text-sm
                                  "

                                >

                                  {es ? "Eliminar" : "Delete"}

                                </button>

                              </>

                            )
                          }

                        </div>

                      </td>

                    </tr>

                  )
                )

            }

          </tbody>

        </table>

      </div>

    </div>

  );
}
