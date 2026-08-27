import {

  Routes,

  Route,

  Navigate,

} from "react-router-dom";

import {

  useEffect,

  useState,

} from "react";

import type {

  Session,

} from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";

import Layout from "./components/Layout";

import Login from "./components/Login";

import Dashboard from "./pages/dashboardNEW";

import AgendaCalendar from "./pages/agendaCalendar";

import Pacientes from "./pages/pacientesNEW";

import PacienteDetalle from "./pages/pacientedetalle";

import Finanzas from "./pages/finanzasNEW";

import QRCodePaciente from "./components/QRCodePaciente";

import FormularioPacientePublico from "./components/FormularioPacientePublico";

export default function App() {

  const [

    session,

    setSession,

  ] = useState<Session | null>(
    null
  );

  const [

    cargandoSesion,

    setCargandoSesion,

  ] = useState(true);

  useEffect(() => {

    async function cargarSesion() {

      const {

        data,

      } = await supabase.auth
        .getSession();

      setSession(
        data.session
      );

      setCargandoSesion(
        false
      );

    }

    cargarSesion();

    const {

      data: authListener,

    } = supabase.auth
      .onAuthStateChange(
        (
          _event,
          nuevaSession
        ) => {

          setSession(
            nuevaSession
          );

          setCargandoSesion(
            false
          );

        }
      );

    return () => {

      authListener.subscription
        .unsubscribe();

    };

  }, []);

  if (
    cargandoSesion
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

  return (

    <Routes>

      {/* RUTA PÚBLICA */}

      <Route

        path="/registro-paciente"

        element={
          <FormularioPacientePublico />
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
                  <Finanzas />
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