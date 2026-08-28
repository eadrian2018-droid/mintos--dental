import {

  Routes,

  Route,

  Navigate,

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

import QRCodePaciente from "./components/QRCodePaciente";

import FormularioPacientePublico from "./components/FormularioPacientePublico";

import Configuracion from "./pages/configuracion";

import { useAuth } from "./context/AuthContext";

export default function App() {

  const {

    session,

    perfil,

    permisos,

    loading,

  } = useAuth();

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

          Cargando MintOS...

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

            Perfil no configurado

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Tu cuenta existe, pero todavía no tiene un perfil configurado en MintOS.

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

            Usuario desactivado

          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-2
            "
          >

            Tu cuenta no tiene acceso activo a MintOS.

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

  const puedeVerFinanzas =

    permisos?.registrar_cobros === true ||

    permisos?.registrar_gastos === true ||

    permisos?.anular_cobros === true ||

    permisos?.anular_gastos === true ||

    permisos?.ver_resumen_financiero === true ||

    permisos?.ver_utilidades === true ||

    permisos?.ver_comisiones === true;

  const puedeVerConfiguracion =

    permisos?.configurar_precios_costos === true ||

    permisos?.configurar_comisiones === true ||

    permisos?.administrar_usuarios === true ||

    permisos?.ver_bitacora === true;

  return (

    <Routes>

      {/* RUTAS PÚBLICAS */}

      <Route

        path="/registro-paciente"

        element={
          <FormularioPacientePublico />
        }

      />

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

      {

        session

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

                  puedeVerConfiguracion

                    ? (
                      <Configuracion />
                    )

                    : (
                      <Navigate
                        to="/dashboard"
                        replace
                      />
                    )

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