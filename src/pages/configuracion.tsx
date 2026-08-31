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

import ConfiguracionFinanzas
  from "../components/finanzas/ConfiguracionFinanzas";

import useFinanzas
  from "../hooks/useFinanzas";

type Seccion =
  | "usuarios"
  | "doctores"
  | "seguridad"
  | "bitacora"
  | "clinica"
  | "finanzas";

export default function Configuracion() {

  const [
    searchParams,
  ] = useSearchParams();

  const finanzas =
    useFinanzas();

  const {

    doctores,

    catalogoTratamientos,

    configuracionPagos,

    actualizarConfiguracionPago,

    guardarTratamientoCatalogo,

    actualizarTratamientoCatalogo,

    cambiarEstadoTratamientoCatalogo,

  } = finanzas;

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

      {
        seccion === "finanzas" && (

          <ConfiguracionFinanzas

            doctores={
              doctores
            }

            catalogoTratamientos={
              catalogoTratamientos
            }

            configuracionPagos={
              configuracionPagos
            }

            actualizarConfiguracionPago={
              actualizarConfiguracionPago
            }

            guardarTratamientoCatalogo={
              guardarTratamientoCatalogo
            }

            actualizarTratamientoCatalogo={
              actualizarTratamientoCatalogo
            }

            cambiarEstadoTratamientoCatalogo={
              cambiarEstadoTratamientoCatalogo
            }

          />

        )
      }

    </div>

  );

}