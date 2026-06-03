import {

  Routes,

  Route,

  Navigate,

} from "react-router-dom";

import { useState } from "react";

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

  const [usuario] =
    useState(true);

  return (

    <Routes>

      {/* RUTA PUBLICA */}

      <Route

        path="/registro-paciente"

        element={
          <FormularioPacientePublico />
        }

      />

      {

        usuario

        ? (

          <Route

            path="/"

            element={<Layout />}

          >

            <Route

              index

              element={
                <Navigate to="/dashboard" />
              }

            />

            <Route

              path="/dashboard"

              element={<Dashboard />}

            />

            <Route

              path="/agenda"

              element={<AgendaCalendar />}

            />

            <Route

              path="/pacientes"

              element={<Pacientes />}

            />

            <Route

              path="/paciente/:id"

              element={<PacienteDetalle />}

            />

            <Route

              path="/qr-pacientes"

              element={<QRCodePaciente />}

            />

            <Route

  path="/finanzas"

  element={<Finanzas />}

/>

          </Route>

        )

        : (

          <Route

            path="*"

            element={<Login />}

          />

        )

      }

    </Routes>

  );

}