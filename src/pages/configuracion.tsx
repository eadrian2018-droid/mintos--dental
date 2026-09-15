import {
  Navigate,
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

import { useAuth }
  from "../context/AuthContext";

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

  const {
    perfil,
    permisos,
  } = useAuth();

  const esAdmin =
    perfil?.rol === "admin";

  const puedeVerUsuarios =
    esAdmin ||
    permisos?.administrar_usuarios ===
      true;

  const puedeVerDoctores =
    esAdmin ||
    permisos?.configurar_comisiones ===
      true;

  const puedeVerClinica =
    esAdmin;

  const puedeVerFinanzas =
    esAdmin;

  const puedeVerSeguridad =
    esAdmin;

  const puedeVerBitacora =
    esAdmin ||
    permisos?.ver_bitacora ===
      true;

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

  const parametroSeccion =
    searchParams.get(
      "seccion"
    );

  let seccion: Seccion | null =
    null;

  if (
    parametroSeccion ===
    "usuarios"
  ) {

    seccion =
      "usuarios";

  } else if (
    parametroSeccion ===
    "doctores"
  ) {

    seccion =
      "doctores";

  } else if (
    parametroSeccion ===
    "seguridad"
  ) {

    seccion =
      "seguridad";

  } else if (
    parametroSeccion ===
    "bitacora"
  ) {

    seccion =
      "bitacora";

  } else if (
    parametroSeccion ===
    "clinica"
  ) {

    seccion =
      "clinica";

  } else if (
    parametroSeccion ===
    "finanzas"
  ) {

    seccion =
      "finanzas";

  }

  function tieneAcceso(
    seccionEvaluada: Seccion
  ) {

    if (
      seccionEvaluada ===
      "usuarios"
    ) {

      return puedeVerUsuarios;

    }

    if (
      seccionEvaluada ===
      "doctores"
    ) {

      return puedeVerDoctores;

    }

    if (
      seccionEvaluada ===
      "clinica"
    ) {

      return puedeVerClinica;

    }

    if (
      seccionEvaluada ===
      "finanzas"
    ) {

      return puedeVerFinanzas;

    }

    if (
      seccionEvaluada ===
      "seguridad"
    ) {

      return puedeVerSeguridad;

    }

    if (
      seccionEvaluada ===
      "bitacora"
    ) {

      return puedeVerBitacora;

    }

    return false;

  }

  let primeraSeccionPermitida:
    Seccion | null =
      null;

  if (
    puedeVerDoctores
  ) {

    primeraSeccionPermitida =
      "doctores";

  } else if (
    puedeVerUsuarios
  ) {

    primeraSeccionPermitida =
      "usuarios";

  } else if (
    puedeVerBitacora
  ) {

    primeraSeccionPermitida =
      "bitacora";

  } else if (
    puedeVerClinica
  ) {

    primeraSeccionPermitida =
      "clinica";

  } else if (
    puedeVerFinanzas
  ) {

    primeraSeccionPermitida =
      "finanzas";

  } else if (
    puedeVerSeguridad
  ) {

    primeraSeccionPermitida =
      "seguridad";

  }

  if (
    seccion === null ||
    !tieneAcceso(
      seccion
    )
  ) {

    if (
      primeraSeccionPermitida
    ) {

      return (

        <Navigate
          to={
            "/configuracion?seccion=" +
            primeraSeccionPermitida
          }
          replace
        />

      );

    }

    return (

      <div
        className="
          mint-card
          p-6
        "
      >

        <h2
          className="
            text-xl
            font-bold
            mint-text-primary
          "
        >
          Acceso restringido
        </h2>

        <p
          className="
            mt-2
            mint-text-secondary
          "
        >
          Tu usuario no tiene permisos
          para acceder a la configuración
          del sistema.
        </p>

      </div>

    );

  }

  return (

    <div className="space-y-5">

      {
        seccion ===
          "usuarios" &&
        puedeVerUsuarios && (

          <UsuariosRoles />

        )
      }

      {
        seccion ===
          "doctores" &&
        puedeVerDoctores && (

          <DoctoresConfig />

        )
      }

      {
        seccion ===
          "clinica" &&
        puedeVerClinica && (

          <ClinicaConfig />

        )
      }

      {
        seccion ===
          "seguridad" &&
        puedeVerSeguridad && (

          <SeguridadConfig />

        )
      }

      {
        seccion ===
          "bitacora" &&
        puedeVerBitacora && (

          <BitacoraConfig />

        )
      }

      {
        seccion ===
          "finanzas" &&
        puedeVerFinanzas && (

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