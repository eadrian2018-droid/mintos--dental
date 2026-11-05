import type { Dispatch, SetStateAction } from "react";

type DatosPacienteEditando = {
  nombre: string;
  telefono: string;
  correo: string;
  edad: string;
  sexo: string;
  direccion: string;
};

type Props = {
  es: boolean;
  pacienteAbierto: { id: number };
  datosPacienteEditando: DatosPacienteEditando;
  setDatosPacienteEditando: Dispatch<SetStateAction<DatosPacienteEditando>>;
  setMostrarEditarPaciente: Dispatch<SetStateAction<boolean>>;
  guardarDatosPaciente: () => void | Promise<void>;
};

export default function ModalEditarPaciente({
  es,
  pacienteAbierto,
  datosPacienteEditando,
  setDatosPacienteEditando,
  setMostrarEditarPaciente,
  guardarDatosPaciente,
}: Props) {
  return (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-[rgba(15,42,65,0.62)]
              backdrop-blur-[3px]
              p-4
            "
            onClick={() =>
              setMostrarEditarPaciente(
                false
              )
            }
          >

            <div
              className="
                w-full
                max-w-2xl
                overflow-hidden
                rounded-[24px]
                border
                border-white/20
                bg-[var(--mint-surface)]
                shadow-[0_28px_80px_rgba(15,42,65,0.30)]
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="
                relative
                overflow-hidden
                flex
                items-start
                justify-between
                gap-4
                px-6
                py-5
               bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]
              ">

                <div>

                  <p className="
                    text-[10px]
                    uppercase
                    tracking-[0.16em]
                    font-bold
                    text-[var(--mint-teal-soft)]
                  ">
                    {es ? "Expediente" : "Record"} #{pacienteAbierto.id}
                  </p>

                  <h3 className="
                    text-xl
                    font-bold
                    text-white
                    mt-1
                  ">
                    {es ? "Editar paciente" : "Edit patient"}
                  </h3>

                  <p className="
                    text-sm
                    text-white/65
                    mt-1
                  ">
                    {es ? "Actualiza los datos generales del paciente." : "Update the patient’s general information."}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarEditarPaciente(
                      false
                    )
                  }
                  className="
                    w-9
                    h-9
                    shrink-0
                    rounded-xl
                    border
                    border-white/20
                    bg-white/10
                    text-white
                    text-xl
                    leading-none
                    hover:bg-white/20
                    transition-colors
                  "
                >
                  ×
                </button>

              </div>

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
                px-6
                py-6
              ">

                <label className="
                  flex
                  flex-col
                  gap-2
                  md:col-span-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Nombre" : "Name"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.nombre
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        nombre:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Teléfono" : "Phone"}
                  </span>

                  <input
                    type="tel"
                    value={
                      datosPacienteEditando.telefono
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Correo" : "Email"}
                  </span>

                  <input
                    type="email"
                    value={
                      datosPacienteEditando.correo
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        correo:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Edad" : "Age"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.edad
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        edad:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Sexo" : "Sex"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.sexo
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        sexo:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

                <label className="
                  flex
                  flex-col
                  gap-2
                  md:col-span-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                    mint-text-primary
                  ">
                    {es ? "Dirección" : "Address"}
                  </span>

                  <input
                    type="text"
                    value={
                      datosPacienteEditando.direccion
                    }
                    onChange={(e) =>
                      setDatosPacienteEditando({
                        ...datosPacienteEditando,
                        direccion:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--mint-border)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </label>

              </div>

              <div className="
                mt-6
                pt-5
                border-t
                border-[var(--mint-border)]
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={() =>
                    setMostrarEditarPaciente(
                      false
                    )
                  }
                  className="
                    mint-btn
                    mint-btn-secondary
                    px-5
                    py-2.5
                    text-sm
                  "
                >
                  {es ? "Cancelar" : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={
                    guardarDatosPaciente
                  }
                  className="
                    mint-btn
                    mint-btn-primary
                    px-5
                    py-2.5
                    text-sm
                  "
                >
                  {es ? "Guardar cambios" : "Save changes"}
                </button>

              </div>

            </div>

          </div>
  );
}
