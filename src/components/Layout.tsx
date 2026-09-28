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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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

import { useLanguage }
  from "../context/LanguageContext";

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

  const {
    language,
  } = useLanguage();

  const es =
    language === "es";


  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState<MenuAbierto>(
    null
  );

  const [
    sidebarColapsado,
    setSidebarColapsado,
  ] = useState(false);

  useEffect(() => {

    if (
      location.pathname.startsWith(
        "/pacientes"
      ) ||
      location.pathname.startsWith(
        "/paciente/"
      ) ||
      location.pathname.startsWith(
        "/presupuestos"
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
      group
      relative
      flex
      items-center
      gap-3
      min-h-11
      px-3.5
      rounded-[14px]
      font-semibold
      text-[13px]
      transition-all
      duration-200

      ${
        activo
          ? `
              bg-[#e9f7f4]
              dark:bg-white/[0.09]
              text-[#0b7f73]
              dark:text-white
              shadow-[inset_0_0_0_1px_rgba(11,143,128,0.08),0_8px_22px_rgba(15,42,65,0.05)]
              dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_8px_22px_rgba(0,0,0,0.10)]
              before:absolute
              before:left-0
              before:top-1/2
              before:-translate-y-1/2
              before:w-[3px]
              before:h-6
              before:rounded-full
              before:bg-[#62dfc8]
              before:shadow-[0_0_14px_rgba(98,223,200,0.55)]
            `
          : `
              text-[#50697b]
              dark:text-slate-300
              hover:text-[#102f4f]
              dark:hover:text-white
              hover:bg-[#f0f6f7]
              dark:hover:bg-white/[0.055]
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
      rounded-[10px]
      text-[12px]
      font-medium
      transition-all
      duration-200

      ${
        activo
          ? `
              bg-[#edf8f6]
              dark:bg-white/[0.08]
              text-[#0b8f80]
              dark:text-[#62dfc8]
              font-semibold
            `
          : `
              text-[#718695]
              dark:text-slate-400
              hover:text-[#102f4f]
              dark:hover:text-white
              hover:bg-[#f2f7f8]
              dark:hover:bg-white/[0.045]
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
        ) ||
        location.pathname.startsWith(
          "/presupuestos"
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

      return es ? "Administrador" : "Administrator";

    }

    if (
      perfil?.rol === "doctor"
    ) {

      return es ? "Doctor" : "Doctor";

    }

    if (
      perfil?.rol ===
      "recepcionista"
    ) {

      return es ? "Recepcionista" : "Receptionist";

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
    true;

  const esAdmin =
    perfil?.rol === "admin";

  const puedeVerResumenFinanzas =
    esAdmin ||
    permisos?.ver_resumen_financiero === true;

  const puedeVerCobrosFinanzas =
    esAdmin ||
    permisos?.registrar_cobros === true ||
    permisos?.anular_cobros === true;

  const puedeVerGastosFinanzas =
    esAdmin ||
    permisos?.registrar_gastos === true ||
    permisos?.anular_gastos === true;

  const puedeVerComisionesFinanzas =
    esAdmin ||
    permisos?.ver_comisiones === true;

  const puedeVerReportesFinanzas =
    esAdmin ||
    permisos?.ver_utilidades === true;

  const puedeVerCierreFinanzas =
    esAdmin;

  const puedeVerDoctoresConfig =
    esAdmin ||
    permisos
      ?.configurar_comisiones ===
      true;

  const puedeVerClinicaConfig =
    esAdmin;

  const puedeConfigurarFinanzas =
    esAdmin;

  const puedeVerSeguridadConfig =
    esAdmin;

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
        es
          ? "No se pudo cerrar la sesión."
          : "Could not sign out."
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
        bg-[#eef5f4]
        dark:bg-[#050f17]
        overflow-hidden
        p-2
        gap-2
      "
    >

      <aside
        style={{
          width: sidebarColapsado ? "70px" : "195px",
        }}
        className="
          relative
          overflow-hidden
          bg-[linear-gradient(180deg,#e8f5f2_0%,#e2f1ee_54%,#dcece9_100%)]
          dark:bg-[linear-gradient(180deg,#0d2b42_0%,#0a2336_100%)]
          backdrop-blur-xl
          text-[#18364f]
          dark:text-white
          p-2.5
          flex
          flex-col
          flex-shrink-0
          transition-[width]
          duration-300
          border
          border-[#cfe1de]
          dark:border-white/[0.06]
          rounded-[24px]
          shadow-[0_18px_42px_rgba(18,53,68,0.09)]
        "
      >

        <div
          className="
            relative
            px-2
            pt-2
            pb-4
            mb-3
            border-b
            border-[#d7e7e4]
            dark:border-white/[0.08]
          "
        >
          <div
            className={`
              flex
              items-center
              ${sidebarColapsado ? "justify-center" : "justify-between"}
              gap-2
            `}
          >
            {!sidebarColapsado && (
              <div className="min-w-0">
                <div
                  className="
                    text-[23px]
                    leading-none
                    font-black
                    tracking-[-0.05em]
                    text-[#102f4f]
                    dark:text-white
                  "
                >
                  Mint<span className="text-[#0b9a88]">OS</span>
                </div>

                <div
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-1.5
                    text-[8px]
                    uppercase
                    tracking-[0.18em]
                    font-extrabold
                    text-[#0b8f80]
                    dark:text-[#62dfc8]
                  "
                >
                  <span className="w-4 h-[2px] rounded-full bg-[#d5b861]" />
                  Dental System
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setSidebarColapsado(
                  (valor) => !valor
                )
              }
              title={
                sidebarColapsado
                  ? (es ? "Expandir menú" : "Expand menu")
                  : (es ? "Contraer menú" : "Collapse menu")
              }
              className="
                w-9
                h-9
                flex-shrink-0
                rounded-[12px]
                border
                border-[#cfe2df]
                dark:border-white/10
                bg-white/90
                dark:bg-white/[0.06]
                text-[#527083]
                dark:text-slate-300
                shadow-[0_6px_16px_rgba(17,55,69,0.06)]
                flex
                items-center
                justify-center
                hover:text-[#0b8f80]
                hover:border-[#9fd5cc]
                dark:hover:text-[#62dfc8]
                transition
              "
            >
              {sidebarColapsado
                ? <PanelLeftOpen size={17} />
                : <PanelLeftClose size={17} />}
            </button>
          </div>
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

            {!sidebarColapsado && (es ? "Dashboard" : "Dashboard")}

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

                {!sidebarColapsado && (es ? "Agenda" : "Schedule")}

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
                    ${sidebarColapsado ? "justify-center" : "justify-between"}
                    gap-2
                    min-h-11
                    px-3.5
                    rounded-[14px]
                    text-[13px]
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      grupoActivo(
                        "pacientes"
                      )
                        ? `
                            text-[#0b7f73]
                            dark:text-white
                            bg-[#e9f7f4]
                            dark:bg-white/[0.09]
                            shadow-[inset_0_0_0_1px_rgba(11,143,128,0.07)]
                            dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]
                          `
                        : `
                            text-[#50697b]
                            dark:text-slate-300
                            hover:text-[#102f4f]
                            dark:hover:text-white
                            hover:bg-[#f0f6f7]
                            dark:hover:bg-white/[0.055]
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

                    {!sidebarColapsado && (es ? "Pacientes" : "Patients")}

                  </span>

                  {!sidebarColapsado && (
                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform
                        duration-200
                        ${
                          menuAbierto === "pacientes"
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  )}

                </button>

                {
                  menuAbierto ===
                    "pacientes" &&
                  !sidebarColapsado && (

                    <div
                      className="
                        ml-8
                        mt-1
                        mb-2
                        pl-3
                        border-l
                        border-[#dfe9eb] dark:border-white/[0.10]
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

                        {es ? "Lista de pacientes" : "Patient list"}

                      </Link>

                      <Link
                        to="/presupuestos"
                        className={
                          submenuClasses(
                            "/presupuestos"
                          )
                        }
                      >

                        {es ? "Presupuestos" : "Estimates"}

                      </Link>

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
                    ${sidebarColapsado ? "justify-center" : "justify-between"}
                    gap-2
                    min-h-11
                    px-3.5
                    rounded-[14px]
                    text-[13px]
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      grupoActivo(
                        "finanzas"
                      )
                        ? `
                            text-[#0b7f73]
                            dark:text-white
                            bg-[#e9f7f4]
                            dark:bg-white/[0.09]
                            shadow-[inset_0_0_0_1px_rgba(11,143,128,0.07)]
                            dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]
                          `
                        : `
                            text-[#50697b]
                            dark:text-slate-300
                            hover:text-[#102f4f]
                            dark:hover:text-white
                            hover:bg-[#f0f6f7]
                            dark:hover:bg-white/[0.055]
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

                    {!sidebarColapsado && (es ? "Finanzas" : "Finances")}

                  </span>

                  {!sidebarColapsado && (
                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform
                        duration-200
                        ${
                          menuAbierto === "finanzas"
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  )}

                </button>

                {
                  menuAbierto ===
                    "finanzas" &&
                  !sidebarColapsado && (

                    <div
                      className="
                        ml-8
                        mt-1
                        mb-2
                        pl-3
                        border-l
                        border-[#dfe9eb] dark:border-white/[0.10]
                        space-y-1
                      "
                    >

                      {
                        puedeVerResumenFinanzas && (

                          <Link
                        to="/finanzas"
                        className={
                          submenuClasses(
                            "/finanzas"
                          )
                        }
                      >

                        {es ? "Resumen financiero" : "Financial summary"}

                      </Link>

                        )
                      }

                      {
                        puedeVerCobrosFinanzas && (

                          <Link
                        to="/finanzas?seccion=cobros"
                        className={
                          submenuClasses(
                            "/finanzas",
                            "cobros"
                          )
                        }
                      >

                        {es ? "Cobros" : "Payments"}

                      </Link>

                        )
                      }

                      {
                        puedeVerGastosFinanzas && (

                          <Link
                        to="/finanzas?seccion=gastos"
                        className={
                          submenuClasses(
                            "/finanzas",
                            "gastos"
                          )
                        }
                      >

                        {es ? "Gastos" : "Expenses"}

                      </Link>

                        )
                      }

                      {
                        puedeVerComisionesFinanzas && (

                          <Link
                        to="/finanzas?seccion=comisiones"
                        className={
                          submenuClasses(
                            "/finanzas",
                            "comisiones"
                          )
                        }
                      >

                        {es ? "Comisiones" : "Commissions"}

                      </Link>

                        )
                      }

                      {
                        puedeVerReportesFinanzas && (

                          <Link
                        to="/finanzas?seccion=reportes"
                        className={
                          submenuClasses(
                            "/finanzas",
                            "reportes"
                          )
                        }
                      >

                        {es ? "Reportes" : "Reports"}

                      </Link>

                        )
                      }

                      {
                        puedeVerCierreFinanzas && (

                          <Link
                        to="/finanzas?seccion=cierre"
                        className={
                          submenuClasses(
                            "/finanzas",
                            "cierre"
                          )
                        }
                      >

                        {es ? "Cierre mensual" : "Monthly close"}

                      </Link>

                        )
                      }

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
                    ${sidebarColapsado ? "justify-center" : "justify-between"}
                    gap-2
                    min-h-11
                    px-3.5
                    rounded-[14px]
                    text-[13px]
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      grupoActivo(
                        "configuracion"
                      )
                        ? `
                            text-[#0b7f73]
                            dark:text-white
                            bg-[#e9f7f4]
                            dark:bg-white/[0.09]
                            shadow-[inset_0_0_0_1px_rgba(11,143,128,0.07)]
                            dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]
                          `
                        : `
                            text-[#50697b]
                            dark:text-slate-300
                            hover:text-[#102f4f]
                            dark:hover:text-white
                            hover:bg-[#f0f6f7]
                            dark:hover:bg-white/[0.055]
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

                    {!sidebarColapsado && (es ? "Configuración" : "Settings")}

                  </span>

                  {!sidebarColapsado && (
                    <ChevronDown
                      size={16}
                      className={`
                        transition-transform
                        duration-200
                        ${
                          menuAbierto === "configuracion"
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  )}

                </button>

                {
                  menuAbierto ===
                    "configuracion" &&
                  !sidebarColapsado && (

                    <div
                      className="
                        ml-8
                        mt-1
                        mb-2
                        pl-3
                        border-l
                        border-[#dfe9eb] dark:border-white/[0.10]
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

                            {es ? "Usuarios y Roles" : "Users & Roles"}

                          </Link>

                        )
                      }

                      {
                        puedeVerDoctoresConfig && (

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

                              {es ? "Doctores" : "Doctors"}

                            </span>

                          </Link>

                        )
                      }

                      {
                        puedeVerClinicaConfig && (

                          <Link
                            to="/configuracion?seccion=clinica"
                            className={
                              submenuClasses(
                                "/configuracion",
                                "clinica"
                              )
                            }
                          >

                            {es ? "Clínica" : "Clinic"}

                          </Link>

                        )
                      }

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

                            {es ? "Finanzas" : "Finances"}

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

                            {es ? "Bitácora" : "Audit Log"}

                          </Link>

                        )
                      }

                      {
                        puedeVerSeguridadConfig && (

                          <Link
                            to="/configuracion?seccion=seguridad"
                            className={
                              submenuClasses(
                                "/configuracion",
                                "seguridad"
                              )
                            }
                          >

                            {es ? "Seguridad" : "Security"}

                          </Link>

                        )
                      }

                      <Link
                        to="/configuracion?seccion=ajustes"
                        className={
                          submenuClasses(
                            "/configuracion",
                            "ajustes"
                          )
                        }
                      >

                        {es ? "Ajustes" : "Settings"}

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
            border-[#d7e7e4]
            dark:border-white/[0.08]
          "
        >
          {!sidebarColapsado && (
            <div
              className="
                mx-1
                mb-3
                p-3
                rounded-[15px]
                bg-white/70
                dark:bg-white/[0.04]
                border
                border-[#dbe9e7]
                dark:border-white/[0.06]
              "
            >
              <p
                className="
                  text-[13px]
                  font-bold
                  text-[#102f4f]
                  dark:text-white
                  truncate
                "
              >
                {
                  perfil?.nombre ||
                  (es ? "Usuario" : "User")
                }
              </p>

              <p
                className="
                  text-[11px]
                  text-[#718695]
                  dark:text-slate-400
                  mt-1
                "
              >
                {obtenerNombreRol()}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={cerrarSesion}
            title={es ? "Cerrar sesión" : "Sign out"}
            className={`
              w-full
              min-h-10
              flex
              items-center
              ${sidebarColapsado ? "justify-center" : "justify-start"}
              gap-2.5
              px-3
              rounded-[12px]
              font-semibold
              text-[12px]
              text-rose-500
              dark:text-rose-300
              hover:text-rose-600
              dark:hover:text-rose-200
              hover:bg-rose-50
              dark:hover:bg-rose-400/[0.08]
              transition
            `}
          >
            <LogOut size={16} />

            {!sidebarColapsado && (
              <span>
                {es ? "Cerrar sesión" : "Sign out"}
              </span>
            )}
          </button>

          {!sidebarColapsado && (
            <div
              className="
                mt-3
                px-3
                text-[9px]
                uppercase
                tracking-[0.10em]
                text-[#91a4af]
                dark:text-slate-500
              "
            >
              MintOS Dental System
            </div>
          )}
        </div>

      </aside>

      <main
        className="
          flex-1
          overflow-y-auto
          p-5
          lg:p-6
          rounded-[24px]
          border
          border-[#d9e7e5]
          dark:border-white/[0.06]
          shadow-[0_18px_46px_rgba(18,53,68,0.07)]
          bg-[radial-gradient(circle_at_82%_0%,rgba(74,190,169,0.055),transparent_25%),linear-gradient(135deg,#fffefa_0%,#fbfdfc_55%,#f8fbfa_100%)]
          dark:bg-[radial-gradient(circle_at_78%_0%,rgba(74,190,169,0.08),transparent_28%),linear-gradient(135deg,#07131d_0%,#0a1823_100%)]
        "
      >

        <Outlet />

      </main>

    </div>

  );

}


