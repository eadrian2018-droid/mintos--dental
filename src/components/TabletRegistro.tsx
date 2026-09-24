import {
  useState,
} from "react";

import TabletInicio from "./TabletInicio";

import FormularioPacientePublico from "./FormularioPacientePublico";

type IdiomaTablet = "es" | "en";

type PacienteBusqueda = {
  id: number;
  nombre: string;
  telefono: string | null;
  correo: string | null;
};

type VistaTablet =
  | {
      tipo: "inicio";
    }
  | {
      tipo: "nuevo";
      idioma: IdiomaTablet;
    }
  | {
      tipo: "existente";
      idioma: IdiomaTablet;
      paciente: PacienteBusqueda;
    };

export default function TabletRegistro() {
  const [
    vista,
    setVista,
  ] = useState<VistaTablet>({
    tipo: "inicio",
  });

  if (vista.tipo === "inicio") {
    return (
      <TabletInicio
        onNuevoPaciente={(idioma) => {
          setVista({
            tipo: "nuevo",
            idioma,
          });
        }}
        onPacienteSeleccionado={(
          paciente,
          idioma
        ) => {
          setVista({
            tipo: "existente",
            idioma,
            paciente,
          });
        }}
      />
    );
  }

  if (vista.tipo === "nuevo") {
    return (
      <FormularioPacientePublico />
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        p-6
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          w-full
          max-w-lg
          bg-white
          border
          border-slate-200
          rounded-3xl
          shadow-xl
          p-8
          text-center
        "
      >
        <p
          className="
            text-sm
            font-bold
            uppercase
            tracking-wider
            text-teal-700
          "
        >
          {vista.idioma === "en"
            ? "Existing Patient"
            : "Paciente existente"}
        </p>

        <h1
          className="
            text-2xl
            font-bold
            text-slate-900
            mt-2
          "
        >
          {vista.paciente.nombre}
        </h1>

        <p
          className="
            text-slate-500
            mt-3
          "
        >
          {vista.idioma === "en"
            ? "The patient was selected correctly. The next step will open their existing record for completion."
            : "El paciente fue seleccionado correctamente. El siguiente paso abrirá su expediente existente para completarlo."}
        </p>

        <button
          type="button"
          onClick={() =>
            setVista({
              tipo: "inicio",
            })
          }
          className="
            mt-6
            w-full
            border
            border-slate-300
            bg-white
            hover:bg-slate-50
            text-slate-700
            px-5
            py-3
            rounded-xl
            font-bold
          "
        >
          {vista.idioma === "en"
            ? "Back"
            : "Regresar"}
        </button>
      </div>
    </div>
  );
}