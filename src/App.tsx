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

import PacienteDetalle from "./pages/pacientedetalle.tsx";

export default function App() {

  const [usuario] =
    useState(true);

  if (!usuario) {

    return <Login />;

  }

  return (

    <Routes>

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

      </Route>

    </Routes>

  );

}