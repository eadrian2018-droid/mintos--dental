import {
  useSearchParams,
} from "react-router-dom";

import UsuariosRoles
  from "../components/configuracion/UsuariosRoles";

import DoctoresConfig
  from "../components/configuracion/DoctoresConfig";

import ClinicaConfig
  from "../components/configuracion/ClinicaConfig";

import SeguridadConfig
  from "../components/configuracion/SeguridadConfig";

import BitacoraConfig
  from "../components/configuracion/BitacoraConfig";

type Seccion =
  | "usuarios"
  | "doctores"
  | "seguridad"
  | "bitacora"
  | "clinica";

export default function Configuracion() {

  const [
    searchParams,
  ] = useSearchParams();

  const seccion =
    (
      searchParams.get("seccion") ||
      "usuarios"
    ) as Seccion;

  return (

    <div className="space-y-5">

      {
        seccion === "usuarios" && (
          <UsuariosRoles />
        )
      }

      {
        seccion === "doctores" && (
          <DoctoresConfig />
        )
      }

      {
        seccion === "clinica" && (
          <ClinicaConfig />
        )
      }

      {
        seccion === "seguridad" && (
          <SeguridadConfig />
        )
      }

      {
        seccion === "bitacora" && (
          <BitacoraConfig />
        )
      }

    </div>

  );

}