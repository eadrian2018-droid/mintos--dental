import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";

import Pacientes from "./pages/pacientesNEW";

import AgendaCalendar from "./pages/agendaCalendar";

import PacienteDetalle from "./pages/pacientedetalle";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Layout />}
        >

          <Route
            index
            element={
              <Navigate to="/agenda" />
            }
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

    </BrowserRouter>

  );

}