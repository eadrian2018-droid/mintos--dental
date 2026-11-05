import type { Dispatch, SetStateAction } from "react";

type NuevaCita = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  doctor: string;
};

type Props = {
  mostrarModalCita: boolean;
  es: boolean;
  nuevaCita: NuevaCita;
  setNuevaCita: Dispatch<SetStateAction<NuevaCita>>;
  setMostrarModalCita: Dispatch<SetStateAction<boolean>>;
  guardarCitaPaciente: () => Promise<void>;
};

export default function ModalCitaPaciente({
  mostrarModalCita,
  es,
  nuevaCita,
  setNuevaCita,
  setMostrarModalCita,
  guardarCitaPaciente,
}: Props) {
  if (!mostrarModalCita) return null;

  return (
    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
    ">

      <div className="
        w-full
        max-w-xl
        overflow-hidden
        rounded-[24px]
        border
        border-white/20
        bg-[var(--mint-surface)]
        shadow-[0_28px_80px_rgba(15,42,65,0.30)]
      ">

        <h2 className="
          text-xl
          font-bold
          text-white
          px-6
          py-5
          mb-0
         bg-[linear-gradient(120deg,#102f4f_0%,#1b4f68_55%,#0b8f80_100%)]
          border-b-[3px]
          border-[var(--mint-teal-soft)]
        ">

          {es ? "Nueva Cita" : "New Appointment"}

        </h2>

       <div className="
  grid
  gap-4
">

  <input
    type="date"
    value={
      nuevaCita.fecha
    }
    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        fecha:
          e.target.value,
      })
    }
    className="
      mint-input
      p-3
    "
  />

  <input
    type="time"
    value={
      nuevaCita.horaInicio
    }
    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        horaInicio:
          e.target.value,
      })
    }
    className="
      mint-input
      p-3
    "
  />

  <input
    type="time"
    value={
      nuevaCita.horaFin
    }
    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        horaFin:
          e.target.value,
      })
    }
    className="
      mint-input
      p-3
    "
  />

  <select

    value={
      nuevaCita.estado
    }

    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        estado:
          e.target.value,
      })
    }

    className="
      mint-input
      p-3
    "

  >

    <option value="pendiente">
      {es ? "Pendiente" : "Pending"}
    </option>

    <option value="confirmada">
      {es ? "Confirmada" : "Confirmed"}
    </option>

    <option value="cancelada">
      Cancelada
    </option>

    <option value="tratamiento">
      {es ? "Tratamiento" : "Treatment"}
    </option>

  </select>

  <input

    value={
      nuevaCita.doctor
    }

    onChange={(e)=>
      setNuevaCita({
        ...nuevaCita,
        doctor:
          e.target.value,
      })
    }

    className="
      mint-input
      p-3
    "

    placeholder={es ? "Doctor" : "Doctor"}

  />

</div>

        <div className="
          flex
          justify-end
          gap-3
          mt-6
        ">

          <button

            onClick={() =>
              setMostrarModalCita(
                false
              )
            }

            className="
              mint-btn
              mint-btn-danger
              px-4
              py-2
              text-sm
            "

          >

            {es ? "Cancelar" : "Cancel"}

          </button>

          <button

            onClick={
              guardarCitaPaciente
            }

            className="
              mint-btn
              mint-btn-primary
              px-4
              py-2
              text-sm
            "

          >

            {es ? "Guardar" : "Save"}

          </button>

        </div>

      </div>

    </div>
  );
}
