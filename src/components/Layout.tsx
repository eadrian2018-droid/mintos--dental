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
              bg-[var(--mint-primary)]
              text-[var(--mint-text-on-primary)]
              shadow-sm
            `
          : `
              mint-text-secondary
              hover:bg-[var(--mint-bg-soft)]
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
              bg-[var(--mint-primary-soft)]
              text-[var(--mint-primary)]
              font-semibold
            `
          : `
              mint-text-muted
              hover:bg-[var(--mint-bg-soft)]
              hover:text-[var(--mint-text-primary)]
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

  const puedeConfigurarFinanzas =

    permisos
      ?.configurar_precios_costos ===
      true ||

    permisos
      ?.configurar_comisiones ===
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
        bg-[var(--mint-bg-app)]
        overflow-hidden
      "
    >

      <aside
        style={{
          width: "210px",
        }}
        className="
          bg-[var(--mint-bg-card)]
          border-r
          border-[var(--mint-border)]
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
              text-[var(--mint-primary)]
            "
          >

            MintOS

          </h1>

          <p
            className="
              text-[10px]
              uppercase
              tracking-wider
              mint-text-muted
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
                            text-[var(--mint-primary)]
                            bg-[var(--mint-primary-soft)]
                          `
                        : `
                            mint-text-secondary
                            hover:bg-[var(--mint-bg-soft)]
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
                        border-[var(--mint-border)]
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
                          mint-text-muted
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
                  text-[var(--mint-primary)]
                  bg-[var(--mint-primary-soft)]
                `
              : `
                  mint-text-secondary
                  hover:bg-[var(--mint-bg-soft)]
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
              border-[var(--mint-border)]
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

            <Link
              to="/finanzas?seccion=cobros"
              className={
                submenuClasses(
                  "/finanzas",
                  "cobros"
                )
              }
            >

              Cobros

            </Link>

            <Link
  to="/finanzas?seccion=gastos"
  className={
    submenuClasses(
      "/finanzas",
      "gastos"
    )
  }
>

  Gastos

</Link>

<Link
  to="/finanzas?seccion=comisiones"
  className={
    submenuClasses(
      "/finanzas",
      "comisiones"
    )
  }
>

  Comisiones

</Link>

            <div
              className="
                px-3
                py-2
                text-[13px]
                mint-text-muted
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
                            text-[var(--mint-primary)]
                            bg-[var(--mint-primary-soft)]
                          `
                        : `
                            mint-text-secondary
                            hover:bg-[var(--mint-bg-soft)]
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
                        border-[var(--mint-border)]
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
                        puedeConfigurarFinanzas && (

                          <Link
                            to="/configuracion?seccion=finanzas"
                            className={
                              submenuClasses(
                                "/configuracion",
                                "finanzas"
                              )
                            }
                          >

                            Finanzas

                          </Link>

                        )
                      }

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
            border-[var(--mint-border)]
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
                mint-text-primary
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
                mint-text-secondary
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
              text-[var(--mint-danger)]
              hover:bg-[var(--mint-danger-bg)]
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
              mint-text-muted
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
          bg-[var(--mint-bg-app)]
        "
      >

        <Outlet />

      </main>

    </div>

  );

}