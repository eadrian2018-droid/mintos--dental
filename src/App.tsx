import { useEffect, useState } from "react";

import {
  Routes,
  Route,
} from "react-router-dom";

import { supabase } from "./lib/supabase";

import Login from "./components/Login";

import Layout from "./components/Layout";

import FormularioPacientePublico from "./components/FormularioPacientePublico";

import Dashboard from "./pages/dashboardNEW";

import Pacientes from "./pages/pacientesNEW";

import Agenda from "./pages/agendaCalendar";

function AdminApp() {

  const [usuario,
    setUsuario] =
    useState<any>(null);

  const [pagina,
    setPagina] =
    useState("dashboard");

  useEffect(() => {

    verificarSesion();

  }, []);

  async function verificarSesion() {

    const {

      data: { session },

    } = await supabase.auth.getSession();

    setUsuario(
      session?.user || null
    );

  }

  if (!usuario) {

    return <Login />;

  }

  return (

    <Layout
      setPagina={
        setPagina
      }
    >

      {

        pagina ===
        "dashboard"

        &&

        <Dashboard />

      }

      {

        pagina ===
        "pacientes"

        &&

        <Pacientes />

      }

      {

        pagina ===
        "agenda"

        &&

        <Agenda />

      }

    </Layout>

  );

}

export default function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<AdminApp />}
      />

      <Route
        path="/formulario"
        element={
          <FormularioPacientePublico />
        }
      />

    </Routes>

  );

}