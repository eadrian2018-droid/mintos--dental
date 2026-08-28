import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase }
  from "../lib/supabase";

import { useAuth }
  from "../context/AuthContext";

type MenuAbierto =
  | "pacientes"
  | "finanzas"
  | "configuracion"
  | null;

export default function Layout() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    perfil,
    permisos,
  } = useAuth();

  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState<MenuAbierto>(
    null
  );

  useEffect(() => {

    if (
      location.pathname.startsWith(
        "/pacientes"
      ) ||
      location.pathname.startsWith(
        "/paciente/"
      )
    ) {

      setMenuAbierto(
        "pacientes"
      );

      return;

    }

    if (
      location.pathname.startsWith(
        "/finanzas"
      )
    ) {

      setMenuAbierto(
        "finanzas"
      );

      return;

    }

    if (
      location.pathname.startsWith(
        "/configuracion"
      )
    ) {

      setMenuAbierto(
        "configuracion"
      );

    }

  }, [
    location.pathname,
  ]);

  function linkClasses(
    path: string
  ) {

    const activo =
      location.pathname === path;

    return `
      flex
      items-center
      gap-3
      px-3
      py-2.5
      rounded-xl
      font-semibold
      transition
      text-sm

      ${
        activo
          ? `
            bg-teal-600
            text-white
            shadow-sm
          `
          : `
            text-slate-700
            hover:bg-slate-100
          `
      }
    `;

  }

  function submenuClasses(
    path: string,
    seccion?: string
  ) {

    const parametros =
      new URLSearchParams(
        location.search
      );

    const seccionActual =
      parametros.get(
        "seccion"
      );

    const activo =
      location.pathname === path &&
      (
        seccion
          ? seccionActual === seccion
          : !seccionActual
      );

    return `
      block
      w-full
      text-left
      px-3
      py-2
      rounded-lg
      text-[13px]
      font-medium
      transition

      ${
        activo
          ? `
            bg-teal-50
            text-teal-700
            font-semibold
          `
          : `
            text-slate-500
            hover:bg-slate-50
            hover:text-slate-800
          `
      }
    `;

  }

  function grupoActivo(
    grupo:
      | "pacientes"
      | "finanzas"
      | "configuracion"
  ) {

    if (
      grupo === "pacientes"
    ) {

      return (
        location.pathname.startsWith(
          "/pacientes"
        ) ||
        location.pathname.startsWith(
          "/paciente/"
        )
      );

    }

    return location.pathname
      .startsWith(
        `/${grupo}`
      );

  }

  function toggleMenu(
    menu: MenuAbierto
  ) {

    setMenuAbierto(
      menuAbierto === menu
        ? null
        : menu
    );

  }

  function obtenerNombreRol() {

    if (
      perfil?.rol === "admin"
    ) {

      return "Administrador";

    }

    if (
      perfil?.rol === "doctor"
    ) {

      return "Doctor";

    }

    if (
      perfil?.rol ===
      "recepcionista"
    ) {

      return "Recepcionista";

    }

    return "";

  }

  const puedeVerFinanzas =

    permisos
      ?.registrar_cobros ===
      true ||

    permisos
      ?.registrar_gastos ===
      true ||

    permisos
      ?.anular_cobros ===
      true ||

    permisos
      ?.anular_gastos ===
      true ||

    permisos
      ?.ver_resumen_financiero ===
      true ||

    permisos
      ?.ver_utilidades ===
      true ||

    permisos
      ?.ver_comisiones ===
      true;

  const puedeVerConfiguracion =

    permisos
      ?.configurar_precios_costos ===
      true ||

    permisos
      ?.configurar_comisiones ===
      true ||

    permisos
      ?.administrar_usuarios ===
      true ||

    permisos
      ?.ver_bitacora ===
      true;

  async function cerrarSesion() {

    const {
      error,
    } = await supabase.auth
      .signOut();

    if (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

      alert(
        "No se pudo cerrar la sesión."
      );

      return;

    }

    navigate(
      "/",
      {
        replace: true,
      }
    );

  }

  return (

    <div
      className="
        flex
        h-screen
        bg-slate-100
        overflow-hidden
      "
    >

      <aside
        style={{
          width: "210px",
        }}
        className="
          bg-white
          border-r
          border-slate-200
          p-3
          flex
          flex-col
          flex-shrink-0
        "
      >

        <div
          className="
            px-2
            pt-2
            mb-6
          "
        >

          <h1
            className="
              text-2xl
              font-bold
              text-teal-600
            "
          >

            MintOS

          </h1>

          <p
            className="
              text-[10px]
              uppercase
              tracking-wider
              text-slate-400
              mt-1
            "
          >

            Dental System

          </p>

        </div>

        <nav
          className="
            flex
            flex-col
            gap-1
          "
        >

          <Link
            to="/dashboard"
            className={
              linkClasses(
                "/dashboard"
              )
            }
          >

            <LayoutDashboard
              size={18}
            />

            Dashboard

          </Link>

          {
            permisos
              ?.ver_agenda ===
              true && (

              <Link
                to="/agenda"
                className={
                  linkClasses(
                    "/agenda"
                  )
                }
              >

                <CalendarDays
                  size={18}
                />

                Agenda

              </Link>

            )
          }

          {
            permisos
              ?.ver_pacientes ===
              true && (

              <div>

                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(
                      "pacientes"
                    )
                  }
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-2
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    transition

                    ${
                      grupoActivo(
                        "pacientes"
                      )
                        ? `
                          text-teal-700
                          bg-teal-50
                        `
                        : `
                          text-slate-700
                          hover:bg-slate-100
                        `
                    }
                  `}
                >

                  <span
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <Users
                      size={18}
                    />

                    Pacientes

                  </span>

                  <ChevronDown
                    size={16}
                    className={`
                      transition-transform
                      duration-200

                      ${
                        menuAbierto ===
                        "pacientes"
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>

                {
                  menuAbierto ===
                    "pacientes" && (

                    <div
                      className="
                        ml-8
                        mt-1
                        mb-2
                        pl-3
                        border-l
                        border-slate-200
                        space-y-1
                      "
                    >

                      <Link
                        to="/pacientes"
                        className={
                          submenuClasses(
                            "/pacientes"
                          )
                        }
                      >

                        Lista de pacientes

                      </Link>

                      <div
                        className="
                          px-3
                          py-2
                          text-[13px]
                          text-slate-400
                        "
                      >

                        Historial clínico

                      </div>

                      <div
                        className="
                          px-3
                          py-2
                          text-[13px]
                          text-slate-400
                        "
                      >

                        Odontogramas

                      </div>

                      <div
                        className="
                          px-3
                          py-2
                          text-[13px]
                          text-slate-400
                        "
                      >

                        Presupuestos

                      </div>

                    </div>

                  )
                }

              </div>

            )
          }

          {
            puedeVerFinanzas && (

              <div>

                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(
                      "finanzas"
                    )
                  }
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-2
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    transition

                    ${
                      grupoActivo(
                        "finanzas"
                      )
                        ? `
                          text-teal-700
                          bg-teal-50
                        `
                        : `
                          text-slate-700
                          hover:bg-slate-100
                        `
                    }
                  `}
                >

                  <span
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <CircleDollarSign
                      size={18}
                    />

                    Finanzas

                  </span>

                  <ChevronDown
                    size={16}
                    className={`
                      transition-transform
                      duration-200

                      ${
                        menuAbierto ===
                        "finanzas"
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>

                {
                  menuAbierto ===
                    "finanzas" && (

                    <div
                      className="
                        ml-8
                        mt-1
                        mb-2
                        pl-3
                        border-l
                        border-slate-200
                        space-y-1
                      "
                    >

                      <Link
                        to="/finanzas"
                        className={
                          submenuClasses(
                            "/finanzas"
                          )
                        }
                      >

                        Resumen financiero

                      </Link>

                      <div
                        className="
                          px-3
                          py-2
                          text-[13px]
                          text-slate-400
                        "
                      >

                        Cobros

                      </div>

                      <div
                        className="
                          px-3
                          py-2
                          text-[13px]
                          text-slate-400
                        "
                      >

                        Gastos

                      </div>

                      <div
                        className="
                          px-3
                          py-2
                          text-[13px]
                          text-slate-400
                        "
                      >

                        Reportes

                      </div>

                    </div>

                  )
                }

              </div>

            )
          }

          {
            puedeVerConfiguracion && (

              <div>

                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(
                      "configuracion"
                    )
                  }
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-2
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    transition

                    ${
                      grupoActivo(
                        "configuracion"
                      )
                        ? `
                          text-teal-700
                          bg-teal-50
                        `
                        : `
                          text-slate-700
                          hover:bg-slate-100
                        `
                    }
                  `}
                >

                  <span
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <Settings
                      size={18}
                    />

                    Configuración

                  </span>

                  <ChevronDown
                    size={16}
                    className={`
                      transition-transform
                      duration-200

                      ${
                        menuAbierto ===
                        "configuracion"
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>

                {
                  menuAbierto ===
                    "configuracion" && (

                    <div
                      className="
                        ml-8
                        mt-1
                        mb-2
                        pl-3
                        border-l
                        border-slate-200
                        space-y-1
                      "
                    >

                      {
                        permisos
                          ?.administrar_usuarios ===
                          true && (

                          <Link
                            to="/configuracion?seccion=usuarios"
                            className={
                              submenuClasses(
                                "/configuracion",
                                "usuarios"
                              )
                            }
                          >

                            Usuarios y Roles

                          </Link>

                        )
                      }

                      <Link
                        to="/configuracion?seccion=doctores"
                        className={
                          submenuClasses(
                            "/configuracion",
                            "doctores"
                          )
                        }
                      >

                        <span
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <Stethoscope
                            size={14}
                          />

                          Doctores

                        </span>

                      </Link>

                      <Link
                        to="/configuracion?seccion=clinica"
                        className={
                          submenuClasses(
                            "/configuracion",
                            "clinica"
                          )
                        }
                      >

                        Clínica

                      </Link>

                      {
                        permisos
                          ?.ver_bitacora ===
                          true && (

                          <Link
                            to="/configuracion?seccion=bitacora"
                            className={
                              submenuClasses(
                                "/configuracion",
                                "bitacora"
                              )
                            }
                          >

                            Bitácora

                          </Link>

                        )
                      }

                      <Link
                        to="/configuracion?seccion=seguridad"
                        className={
                          submenuClasses(
                            "/configuracion",
                            "seguridad"
                          )
                        }
                      >

                        Seguridad

                      </Link>

                    </div>

                  )
                }

              </div>

            )
          }

        </nav>

        <div
          className="
            mt-auto
            pt-4
            border-t
            border-slate-200
          "
        >

          <div
            className="
              px-3
              mb-3
            "
          >

            <p
              className="
                text-sm
                font-bold
                text-slate-800
                truncate
              "
            >

              {
                perfil?.nombre ||
                "Usuario"
              }

            </p>

            <p
              className="
                text-xs
                text-slate-500
                mt-1
              "
            >

              {
                obtenerNombreRol()
              }

            </p>

          </div>

          <button
            type="button"
            onClick={
              cerrarSesion
            }
            className="
              w-full
              text-left
              px-3
              py-2
              rounded-lg
              font-semibold
              text-sm
              text-red-600
              hover:bg-red-50
              transition
            "
          >

            Cerrar sesión

          </button>

          <div
            className="
              mt-3
              px-3
              text-[10px]
              text-slate-400
            "
          >

            MintOS Dental System

          </div>

        </div>

      </aside>

      <main
        className="
          flex-1
          overflow-y-auto
          p-3
        "
      >

        <Outlet />

      </main>

    </div>

  );

}