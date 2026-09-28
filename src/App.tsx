import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./components/Login";

import ResetPassword from "./components/ResetPassword";

import AcceptInvite from "./components/AcceptInvite";

import Dashboard from "./pages/dashboardNEW";

import AgendaCalendar from "./pages/agendaCalendar";

import Pacientes from "./pages/pacientesNEW";

import PacienteDetalle from "./pages/pacientedetalle";

import Finanzas from "./pages/finanzasNEW";

import PresupuestosPage from "./pages/presupuestosPage";

import QRCodePaciente from "./components/QRCodePaciente";

import FormularioPacientePublico from "./components/FormularioPacientePublico";

import TabletRegistro from "./components/TabletRegistro";

import Configuracion from "./pages/configuracion";

import AdminMFA from "./components/AdminMFA";

import { useAuth } from "./context/AuthContext";

import { useLanguage } from "./context/LanguageContext";

export default function App() {

  const {
    session,
    perfil,
    permisos,
    loading,
  } = useAuth();

  const location =
    useLocation();

  const {
    language,
  } = useLanguage();

  const es =
    language === "es";

  const [
    adminMfaVerified,
    setAdminMfaVerified,
  ] = useState(false);

  useEffect(() => {

    setAdminMfaVerified(false);

  }, [session?.user.id]);

  const confirmarAdminMfa =
    useCallback(() => {

      setAdminMfaVerified(true);

    }, []);

  /*
   * Las rutas de invitación y configuración
   * de contraseña deben tener prioridad.
   *
   * Supabase puede crear la sesión antes de
   * que AuthContext termine de cargar el perfil.
   */

  if (
    location.pathname ===
    "/accept-invite"
  ) {

    return (

      <Routes>

        <Route
          path="/accept-invite"
          element={
            <AcceptInvite />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/accept-invite"
              replace
            />
          }
        />

      </Routes>

    );

  }

  if (
    location.pathname ===
    "/reset-password"
  ) {

    return (

      <Routes>

        <Route
          path="/reset-password"
          element={
            <ResetPassword />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/reset-password"
              replace
            />
          }
        />

      </Routes>

    );

  }

  if (
    loading
  ) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-100
        "
      >

        <p
          className="
            text-slate-500
          "
        >

          {
            es
              ? "Cargando MintOS..."
              : "Loading MintOS..."
          }

        </p>

      </div>

    );

  }

  if (
    session &&
    !perfil
  ) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-100
          p-6
        "
      >

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-6
            max-w-md
            w-full
            text-center
          "
        >

          <h2
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >

            {
              es
                ? "Perfil no configurado"
                : "Profile not configured"
            }

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            {
              es
                ? "Tu cuenta existe, pero todavía no tiene un perfil configurado en MintOS."
                : "Your account exists, but it does not have a MintOS profile configured yet."
            }

          </p>

        </div>

      </div>

    );

  }

  if (
    perfil &&
    !perfil.activo
  ) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-100
          p-6
        "
      >

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            p-6
            max-w-md
            w-full
            text-center
          "
        >

          <h2
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >

            {
              es
                ? "Usuario desactivado"
                : "User deactivated"
            }

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            {
              es
                ? "Tu cuenta no tiene acceso activo a MintOS."
                : "Your account does not have active access to MintOS."
            }

          </p>

        </div>

      </div>

    );

  }

  if (
    session &&
    perfil &&
    !perfil.password_configurado
  ) {

    return (

      <Routes>

        <Route
          path="*"
          element={
            <ResetPassword />
          }
        />

      </Routes>

    );

  }

  if (
    session &&
    perfil?.rol === "admin" &&
    !adminMfaVerified
  ) {

    return (
      <AdminMFA
        onVerified={
          confirmarAdminMfa
        }
      />
    );

  }

  const esTablet =

    session &&
    perfil?.rol === "tablet";

  const tabletPuedeRegistrar =

    esTablet &&
    permisos?.registrar_pacientes === true;

  const esRegistro =

    session &&
    perfil?.rol === "registro";

  const registroPuedeRegistrar =

    esRegistro &&
    permisos?.registrar_pacientes === true;

  const puedeVerFinanzas =

    permisos?.registrar_cobros === true ||

    permisos?.registrar_gastos === true ||

    permisos?.anular_cobros === true ||

    permisos?.anular_gastos === true ||

    permisos?.ver_resumen_financiero === true ||

    permisos?.ver_utilidades === true ||

    permisos?.ver_comisiones === true;

  return (

    <Routes>

      {/* ================================================= */}
      {/* RUTAS DE AUTENTICACIÓN */}
      {/* ================================================= */}

      <Route
        path="/accept-invite"
        element={
          <AcceptInvite />
        }
      />

      <Route
        path="/reset-password"
        element={
          <ResetPassword />
        }
      />

      {/* ================================================= */}
      {/* TABLET DE RECEPCIÓN */}
      {/* ================================================= */}

      {

        esTablet

          ? (

            <>

              <Route
                path="/registro-tablet"
                element={

                  tabletPuedeRegistrar

                    ? (
                      <TabletRegistro />
                    )

                    : (
                      <div
                        className="
                          min-h-screen
                          flex
                          items-center
                          justify-center
                          bg-gray-100
                          p-6
                        "
                      >

                        <div
                          className="
                            bg-white
                            border
                            border-slate-200
                            rounded-2xl
                            p-6
                            max-w-md
                            w-full
                            text-center
                          "
                        >

                          <h2
                            className="
                              text-xl
                              font-bold
                              text-slate-800
                            "
                          >

                            {
                              es
                                ? "Acceso no autorizado"
                                : "Unauthorized access"
                            }

                          </h2>

                          <p
                            className="
                              text-sm
                              text-slate-500
                              mt-2
                            "
                          >

                            {
                              es
                                ? "Esta cuenta no tiene permiso para registrar pacientes."
                                : "This account does not have permission to register patients."
                            }

                          </p>

                        </div>

                      </div>
                    )

                }
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/registro-tablet"
                    replace
                  />
                }
              />

            </>

          )

          : esRegistro

          ? (

            <>

              <Route
                path="/registro-paciente"
                element={
                  registroPuedeRegistrar
                    ? (
                      <FormularioPacientePublico />
                    )
                    : (
                      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-center">
                          <h2 className="text-xl font-bold text-slate-800">
                            {
                              es
                                ? "Acceso no autorizado"
                                : "Unauthorized access"
                            }
                          </h2>
                          <p className="text-sm text-slate-500 mt-2">
                            {
                              es
                                ? "Esta cuenta no tiene permiso para registrar pacientes."
                                : "This account does not have permission to register patients."
                            }
                          </p>
                        </div>
                      </div>
                    )
                }
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/registro-paciente"
                    replace
                  />
                }
              />

            </>

          )

          : session

            ? (

              <Route
                path="/"
                element={
                  <Layout />
                }
              >

                <Route
                  index
                  element={
                    <Navigate
                      to="/dashboard"
                      replace
                    />
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <Dashboard />
                  }
                />

                <Route
                  path="/agenda"
                  element={

                    permisos?.ver_agenda === true

                      ? (
                        <AgendaCalendar />
                      )

                      : (
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      )

                  }
                />

                <Route
                  path="/pacientes"
                  element={

                    permisos?.ver_pacientes === true

                      ? (
                        <Pacientes />
                      )

                      : (
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      )

                  }
                />

                <Route
                  path="/paciente/:id"
                  element={

                    permisos?.ver_expediente === true

                      ? (
                        <PacienteDetalle />
                      )

                      : (
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      )

                  }
                />

                <Route
                  path="/presupuestos"
                  element={

                    permisos?.ver_pacientes === true

                      ? (
                        <PresupuestosPage />
                      )

                      : (
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      )

                  }
                />

                <Route
                  path="/qr-pacientes"
                  element={

                    permisos?.editar_pacientes === true

                      ? (
                        <QRCodePaciente />
                      )

                      : (
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      )

                  }
                />

                <Route
                  path="/finanzas"
                  element={

                    puedeVerFinanzas

                      ? (
                        <Finanzas />
                      )

                      : (
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      )

                  }
                />

                <Route
                  path="/configuracion"
                  element={
                    <Configuracion />
                  }
                />

              </Route>

            )

            : (

              <Route
                path="*"
                element={
                  <Login />
                }
              />

            )

      }

    </Routes>

  );

}