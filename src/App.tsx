import {

  Routes,

  Route,

  Navigate,

} from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./components/Login";

import ResetPassword from "./components/ResetPassword";

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
                  <AgendaCalendar />
                }

              />

              <Route

                path="/pacientes"

                element={
                  <Pacientes />
                }

              />

              <Route

                path="/paciente/:id"

                element={
                  <PacienteDetalle />
                }

              />

              <Route

                path="/qr-pacientes"

                element={
                  <QRCodePaciente />
                }

              />
<Route

  path="/finanzas"

  element={

    perfil?.rol === "admin"

      ? <Finanzas />

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

    perfil?.rol === "admin"

      ? <Configuracion />

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