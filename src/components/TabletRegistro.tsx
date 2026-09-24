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

  function regresarInicio() {
    setVista({
      tipo: "inicio",
    });
  }

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
      <FormularioPacientePublico
        idiomaInicial={vista.idioma}
        onFinalizar={regresarInicio}
      />
    );
  }

  return (
    <FormularioPacientePublico
      idiomaInicial={vista.idioma}
      pacienteId={vista.paciente.id}
      onFinalizar={regresarInicio}
    />
  );
}